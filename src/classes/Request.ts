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
        message: {role: string; blocks: { type: string; content: string }[] };
        actions: {
            // Don't ask me, this was JetBrains AI
            type: typeof actionTypes[keyof typeof actionTypes],
            data: string,
            success: boolean,
        }[]
    };
    public query: string;
    public images: string[];

    private isThinking: boolean;
    private isScripting: boolean;

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
        Timestamp: ${new Date().toLocaleString()}
        ---End Request---`;
    }

    async Send(): Promise<EventEmitter>
    {
        // Throw error if any field is undefined
        if (!this.url) {
            throw new Error("URL not specified");
        }
        if (!this.model) {
            throw new Error("Model not specified");
        }
        if (!this.role) {
            throw new Error("Role not specified");
        }
        if (!this.conversation) {
            throw new Error("Conversation not specified");
        }
        if (!this.query) {
            throw new Error("Query not specified");
        }

        // Create new Event emitter
        const emitter = new EventEmitter();

        // Get all current messages from the Database
        this.messages = await getMessages(this.conversation);

        // Set messages to empty array if it's undefined
        if (!this.messages) {
            this.messages = [];
        }

        // Create the new message and store it to the Database
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

        // Prepare Data for the Request
        this.data = {
            "model": this.model,
            "messages": this.messages,
        };

        // Try to request
        try {
            // Fill the response Attribute
            this.response = {
                model: this.model,
                message: {
                    role: "assistant",
                    blocks: [],
                },
                actions: [
                    /*
                    {
                        type: actionTypes.databaseRead,
                        data: "print('Hello World!')",
                        success: true,
                    }
                    */
                ],
            };

            // Store the response
            const res = await axios.post(this.url, this.data, { responseType: "stream"});

            // On incoming data
            res.data.on("data", (chunk: Buffer) => {
                // Convert the chunk to JSON Format for reading
                let convertedChunk = JSON.parse(chunk.toString()).message.content;

                // If the received word is <think>
                if (convertedChunk.includes("<think>")) {
                    // ENTER THINKING MODE RIGHT NOW
                    this.isThinking = true;

                    this.response.message.blocks.push({
                        type: "think",
                        content: "",
                    });
                    return;
                }

                if (convertedChunk.includes("</think>")) {
                    // Leave thinking mode
                    this.isThinking = false;

                    this.response.message.blocks.push({
                        type: "text",
                        content: "",
                    });
                    return;
                }

                if (convertedChunk.includes("<script>")) {
                    this.isScripting = true;

                    this.response.message.blocks.push({
                        type: "script",
                        content: "",
                    });
                }

                if (convertedChunk.includes("</script>")) {
                    this.isScripting = false;

                    this.response.message.blocks.push({
                        type: "text",
                        content: "",
                    });
                }

                let activeBlock = this.response.message.blocks[this.response.message.blocks.length - 1];
                activeBlock.content += convertedChunk;

                // Emit the incoming data
                emitter.emit("data", {type: activeBlock.type, data: convertedChunk});
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