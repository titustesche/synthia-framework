import {Router} from "express";
import {z} from "zod";
import {processRequestBody} from "zod-express-middleware";
import conversation from "./conversation";
import {Conversation} from "../database/entities/Conversation";
import {aiRequest} from "../requestHandler";
import {Message} from "../database/entities/Message";

const chatRoute = Router();
const chatSchema = z.object({
    model: z.string(),
    role: z.string(),
    query: z.string(),
    images: z.array(z.string()),
});

// Todo: Permissions
// For submitting a chat request
chatRoute.post("/chat/:conversation", processRequestBody(chatSchema), async (req, res) => {
    // Set headers to stream
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Try to load the conversation
    try {
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: +req.params.conversation,
            }
        });

        // Return with error
        if (!conversation) {
            return res.write(JSON.stringify({error: "Conversation does not exist"}));
        }

        // If it exists
        else {
            // Store body contents
            let model = req.body.model;
            let role = req.body.role;
            let query = req.body.query;
            let images = req.body.images;

            // Create a new message for the user and store it in the database
            let userMessage = new Message();
            userMessage.role = role;
            userMessage.content = query;
            userMessage.conversation = conversation;

            await userMessage.save();

            // Create a new message for the assistant and leave its contents blank
            let assistantMessage = new Message();
            assistantMessage.role = "assistant";
            assistantMessage.conversation = conversation;
            assistantMessage.content = "";

            // Call aiRequest function (returns EventEmitter)
            const response = await aiRequest(model, role, query, images, conversation);

            // On incoming data
            response.on("data", data => {
                // Add this data to the assistant message's contents
                assistantMessage.content += data;
                res.write(JSON.stringify({data: data}));
                res.flushHeaders();
            });

            // When the stream ends
            response.on("end", async (exitMessage) => {
                // Save the assistant message and end the stream
                await assistantMessage.save();
                res.write(JSON.stringify({exit: exitMessage}));
                res.flushHeaders();
                res.end();
            });

            // If an error occurs
            response.on("error", (error) => {
                // Report that error and send the stream
                res.write(JSON.stringify({"error": error}));
                res.flushHeaders();
                res.end();
            });
        }
    }

    catch (e) {
        console.error(e);
    }
});

export default chatRoute;