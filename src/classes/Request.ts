import {Conversation} from "../database/entities/Conversation";
import {Message} from "../database/entities/Message";
import {EventEmitter} from "events";
import axios from "axios";
import {getMessages} from "../requestHandler";
import actionTypes from "../blueprints/actionTypes";

// Construct for a request, including its original parameters as well as it's response and potential actions taken
export class Request {
    public url: string;
    public data: any;
    public model: string;
    public role: string;
    public conversation: Conversation;
    public messages: {role: string; content: string}[];
    public response: {
        model: string,
        message: {role: string; blocks: { type: string; content: string, lang?: string }[] };
        actions: {
            // Don't ask me, this was JetBrains AI
            type: typeof actionTypes[keyof typeof actionTypes],
            data: string,
            success: boolean,
        }[]
    };
    public query: string;
    public images: string[];
    public timestamp: Date;
    public tokensPerSecond: number;

    private  modes = { TEXT: "text", THINK: "think", SCRIPT: "script" };
    private mode: typeof this.modes[keyof typeof this.modes] = undefined;
    private emitterData: {
        type: typeof this.modes[keyof typeof this.modes] | undefined,
        data: string,
        lang?: string,
    } = {type: undefined, data: ""};
    private activeBlockIndex: number;

    // Useful for the detection engines, makes it easy to track everything until the closing tag
    private replyBuffer: string = "";

    getinfo(): string {
        return `
        ---Request---
        URL: ${this.url}
        Model: ${this.model}
        Role: ${this.role}
        Conversation: ${JSON.stringify(this.conversation)}
        Query: ${this.query}
        Images: ${this.images}
        Response: ${JSON.stringify(this.response)}
        Timestamp: ${this.timestamp.toLocaleString()}
        Tokens Per Second: ${this.tokensPerSecond}
        ---End Request---`;
    }

    async Send(): Promise<EventEmitter>
    {
        //region Error handling
        if (!this.url) throw new Error("URL not specified");
        if (!this.model) throw new Error("Model not specified");
        if (!this.role) throw new Error("Role not specified");
        if (!this.conversation) throw new Error("Conversation not specified");
        if (!this.query) throw new Error("Query not specified");
        //endregion

        // Set the timestamp
        this.timestamp = new Date();

        // Create the Event emitter
        const emitter = new EventEmitter();

        // Get all current messages from the Database
        this.messages = await getMessages(this.conversation);

        // Set messages to be an empty array if it's undefined
        if (!this.messages) this.messages = [];

        // Create the new message and store it in the Database
        let newMessage = new Message();
        newMessage.role = this.role;
        newMessage.content = this.query;
        newMessage.conversation = this.conversation;
        await newMessage.save();

        // Has to be removed or else it will f up the request
        delete newMessage.id;
        delete newMessage.conversation;

        // Push the new message to the array of messages that already exist
        this.messages.push({role: newMessage.role, content: newMessage.content});

        // Convert to ollama friendly format
        let convertedMessages = [];
        for (let message of this.messages)
        {
            // User and system messages don't contain any blocks so their content can be passed directly
            if (message.role !== "assistant") {
                convertedMessages.push({role: message.role, content: message.content});
                continue;
            }

            let tmpMessage = {
                role: message.role,
                content: "",
            }

            for (let block of JSON.parse(message.content))
            {
                // Todo: Rewrite together with a new tag detection Engine
                // Very rudimentary, but get's the job done
                if (block.type === "text") tmpMessage.content += block.content + "\n";
                if (block.type === "script") tmpMessage.content += "Python script executed\n";
            }
            // Save that bitch
            convertedMessages.push(tmpMessage);
        }

        // Prepare Data for the Request
        this.data = {
            "model": this.model,
            "messages": convertedMessages,
        };

        // Do love me some error handling - catches the request part
        try {
            // Fill the response Attribute
            this.response = {
                model: this.model,
                message: {
                    role: "assistant",
                    blocks: [],
                },
                actions: [
                    /* Example to follow when implementing
                    {
                        type: actionTypes.databaseRead,
                        data: "SELECT * FROM test;",
                        success: true,
                    }
                    */
                ],
            };

            // Create res object
            const res = await axios.post(this.url, this.data, { responseType: "stream"});

            // Todo:
            //  Rework tag detection entirely, maybe listen as soon as a message includes a <
            //  and then listen for the next words to determine what tag it is?

            // On incoming data
            res.data.on("data", (chunk: Buffer) => {
                // Convert the chunk to JSON Format for reading
                let convertedChunk = JSON.parse(chunk.toString()).message;

                // Todo:
                //      Start "recording" when the word includes <
                //      Wait until > or />
                //      extract the tag name and create a new block in the message with type tag name
                //      Everything after that except scripts is something the frontend can worry about

                // Push an empty block if the message is completely empty
                if (this.response.message.blocks.length === 0) {
                    this.response.message.blocks.push({type: this.mode, content: ""});
                    this.activeBlockIndex = this.response.message.blocks.length - 1;
                }

                // Temporarily store the data that should be written into the message block
                let blockBuffer = "";

                //region Thinking
                if (convertedChunk.thinking) {
                    // If this is the first thing in the message (yes, probably a 100% chance)
                    if (this.mode === undefined) {
                        // Overwrite mode and the undefined start block
                        this.mode = this.modes.THINK;
                        this.response.message.blocks[this.activeBlockIndex].type = this.mode;
                    }

                    // If it was doing something else - very unlikely
                    if (this.mode !== "think") {
                        // Change mode to think
                        this.mode = this.modes.THINK;
                        // Increase block index
                        this.activeBlockIndex++;
                        // Push new block
                        this.response.message.blocks.push({type: this.mode, content: ""});
                    }

                    // If it was already thinking, just add the content
                    blockBuffer += convertedChunk.thinking;

                }
                //endregion
                //region Text - copy of thinking
                if (convertedChunk.content !== '') {
                    // If this is the first thing in the message
                    if (this.mode === undefined) {
                        // Overwrite mode and the undefined start block
                        this.mode = this.modes.TEXT;
                        this.response.message.blocks[this.activeBlockIndex].type = this.mode;
                        blockBuffer += convertedChunk.content;
                    }

                    // If it was doing something else beside texting or scripting
                    if (this.mode !== "text" && this.mode !== "script") {
                        // Change mode to text
                        this.mode = this.modes.TEXT;
                        // Increase block index
                        this.activeBlockIndex++;
                        // Push new block
                        this.response.message.blocks.push({type: this.mode, content: ""});
                        // Fill the block buffer
                        blockBuffer += convertedChunk.content;
                    }

                    // If it was already texting, add the new content to the block Buffer
                    else if (this.mode === this.modes.TEXT) blockBuffer += convertedChunk.content;

                    // If it's scripting
                    if (this.mode === this.modes.SCRIPT) {
                        // and the language is undefined
                        if (this.emitterData.lang === undefined) {
                            // Set the language
                            this.emitterData.lang = convertedChunk.content;
                            this.emitterData.data = "";
                        }

                        // and the language is already defined
                        else {
                            // add the current content to the block buffer
                            blockBuffer += convertedChunk.content;
                        }
                    }

                }
                //endregion
                //region Script Detection

                // Order of operation:
                // - Listen for backticks, no matter how many
                // - If one is detected, write into replyBuffer
                // - Count occurrences in reply buffer
                // - Are there at least 3?
                // - If yes, clear the reply buffer and toggle scripting mode

                // Clear the reply buffer if it holds less than three backticks and anything else than a backtick appears
                if (this.replyBuffer.includes("`") && convertedChunk.content[0] !== "`") this.replyBuffer = "";

                // If a backtick is present
                if (convertedChunk.content.includes("`")) {
                    // Add to reply buffer
                    this.replyBuffer += convertedChunk.content;

                    // If the reply buffer includes
                    if (this.replyBuffer.includes("```")) {
                        this.replyBuffer = "";
                        if (this.mode === this.modes.SCRIPT) {
                            // End script mode
                            this.mode = this.modes.TEXT;
                            // Bear with me here...
                            let contentLength = this.response.message.blocks[this.activeBlockIndex].content.length - 1;
                            // Count the number of backticks in the current block Buffer
                            // Subtract 3 minus that number from the back of the active block, effectively deleting the backticks
                            // Yes it's long, I know
                            this.response.message.blocks[this.activeBlockIndex].content = this.response.message.blocks[this.activeBlockIndex].content.slice(0, contentLength - (3 - blockBuffer.match(/`/g).length));
                            this.response.message.blocks.push({type: this.mode, content: ""});
                            this.activeBlockIndex++;
                        }

                        // Vorgehensweise wie am Ende nur das erste Zeichen gecuttet werden
                        // Dann Alles bis zum nächsten \n ausschneiden und das als lang attribut benutzen

                        else  {
                            // If the AI isn't scripting, create a new actionProcessor for that script
                            this.mode = this.modes.SCRIPT;
                            // Remove all backticks from the current block buffer
                            blockBuffer = blockBuffer.replace(/`/g, "");
                            this.response.message.blocks.push({type: this.mode, content: "", lang: undefined});
                            this.response.message.blocks[this.activeBlockIndex].lang = undefined;
                            this.activeBlockIndex++;
                        }
                    }
                }

                //endregion

                // Write the finished block buffer to message and emitter data
                this.response.message.blocks[this.activeBlockIndex].content += blockBuffer;
                this.emitterData.data = blockBuffer;

                // Update emitter Data type
                this.emitterData.type = this.mode;

                // Delete the lang attribute if it isn't scripting
                if (this.mode !== this.modes.SCRIPT) delete this.emitterData.lang;

                console.log(this.emitterData); // Debugging
                // Emit the incoming data - check is needed because we have
                emitter.emit("data", this.emitterData);
            });

            // When the stream ends
            res.data.on("end", () => {
                // End this stream as well
                emitter.emit("end");
            });

            // Return the Emitter
            return emitter;
        }
        // If an error occurs, emit that error
        catch (e) {
            emitter.emit("error", e);
            // Return the Emitter
            return emitter;
        }
    }
}