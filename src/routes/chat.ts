import {Router} from "express";
import {z} from "zod";
import {processRequestBody} from "zod-express-middleware";
import {Conversation} from "../database/entities/Conversation";
import {Message} from "../database/entities/Message";
import {Request} from "../classes/Request";

const chatRoute = Router();
const chatSchema = z.object({
    url: z.string(),
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

        // Create a new request
        let request = new Request();
        request.url = req.body.url;
        request.model = req.body.model;
        request.role = req.body.role;
        request.query = req.body.query;
        request.conversation = conversation;
        request.images = req.body.images;

        // Log that requests information to the console (debugging)
        console.log(request.getinfo());

        // Send the request and store its EventEmitter as response
        const responseStream = await request.Send();

        // On incoming data
        responseStream.on("data", data => {
            // Send the incoming data
            res.write(JSON.stringify({data: data}));
            res.flushHeaders();
        });

        // When the stream ends
        responseStream.on("end", async (exitMessage) => {
            // Save the assistant message and end the stream
            res.write(JSON.stringify({exit: exitMessage}));
            res.flushHeaders();
            res.end();

            // Create a new message for the assistant and upload it to the database
            let assistantMessage = new Message();
            assistantMessage.role = request.response.message.role;
            assistantMessage.conversation = conversation;
            assistantMessage.content = request.response.message.content;
            await assistantMessage.save();

            console.log(JSON.stringify(request.response));
            return;
        });

        // If an error occurs
        responseStream.on("error", (error) => {
            // Report that error and send the stream
            res.write(JSON.stringify({"error": error}));
            res.flushHeaders();
            res.end();
            return;
        });
    }

    catch (e) {
        console.error(e);
        return;
    }
});

export default chatRoute;