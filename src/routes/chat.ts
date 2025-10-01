import {Router} from "express";
import {z} from "zod";
import {processRequestBody} from "zod-express-middleware";
import {Conversation} from "../database/entities/Conversation";
import {Message} from "../database/entities/Message";
import {Request} from "../classes/Request";
import {authMiddleware} from "./auth/authMiddleware";

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
chatRoute.post("/chat/:conversation", authMiddleware, processRequestBody(chatSchema), async (req, res) => {
    const user = req.user!;
    if (!user) return res.status(401).json({error: "Unauthorized"});
    // Set headers to stream
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Try to load the conversation
    try {
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: req.params.conversation,
            }
        });

        // Return with error
        if (!conversation) {
            res.write(JSON.stringify({error: "Conversation does not exist"}));
            res.flushHeaders();
            return res.end();
        }

        // Create a new request
        let request = new Request();
        request.url = req.body.url;
        request.model = req.body.model;
        request.role = req.body.role;
        request.query = req.body.query;
        request.conversation = conversation;
        request.images = req.body.images;

        // Send the request and store its EventEmitter as response
        const responseStream = await request.Send();

        // On incoming data
        responseStream.on("data", data => {
            // Send the incoming data
            // console.log(data);
            res.write(JSON.stringify(data));
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
            assistantMessage.content = JSON.stringify(request.response.message.blocks);
            await assistantMessage.save();

            console.log(request.getinfo());
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

chatRoute.patch("/chat/:id", authMiddleware, processRequestBody(chatSchema), async (req, res) => {
    const user = req.user!;
    if (!user) return res.status(401).json({error: "Unauthorized"});

    // Make message contents editable
})

export default chatRoute;