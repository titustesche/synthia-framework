// Todo: Everything in here can be moved to database because it basically is database access
import {Router} from "express";
import {processRequestBody} from "zod-express-middleware";
import {Conversation} from "../database/entities/Conversation";
import {z} from "zod";
import {Message} from "../database/entities/Message";
import * as crypto from "node:crypto";

const conversationRoute = Router();
const convoPostSchema = z.object({
    name: z.string(),
});
const messagePostSchema = z.object({
    role: z.string(),
    content: z.string(),
});

// List all conversations
conversationRoute.get('/conversation', async (req, res) => {
    try {
        let conversations = await Conversation.find();
        // Todo: Order these by last message
        return res.status(200).json({"conversations": conversations});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

// Delete an existing conversation
conversationRoute.delete('/conversation/:id', async (req, res) => {
    try {
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: req.params.id
            }
        });

        if (!conversation) {
            return res.status(404).json({error: "Conversation does not exist"});
        }

        await Conversation.delete({
            id: conversation.id
        });

        return res.status(200);
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

// Create a new conversation
conversationRoute.post('/conversation', processRequestBody(convoPostSchema), async (req, res) => {
    try {
        let conversation = new Conversation();
        conversation.name = req.body.name;
        conversation.id = crypto.randomUUID();

        await conversation.save();
        return res.status(200).json({"conversation": conversation});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

// Request this to get all the messages from the given conversation
conversationRoute.get('/message/:id', async (req, res) => {
    try {
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: req.params.id
            },
            relations: {
                messages: true
            }
        });

        if (!conversation)
        {
            return res.status(404).json({"error": "Conversation not found"});
        }

        return res.status(200).json({"messages": conversation.messages});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

// Submit a new Message to a conversation (without requesting an answer from the AI)
conversationRoute.post('/message/:id', processRequestBody(messagePostSchema), async (req, res) => {
    try {
        // Make sure the conversation exists
        // Todo: Also make sure the user is allowed to modify the conversation
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: req.params['id']
            }
        });

        if (!conversation) return res.status(404).json({"error": "Conversation does not exist"});

        let message = new Message();
        message.role = req.body.role;
        message.content = req.body.content;
        message.conversation = conversation;

        await message.save();

        return res.status(200).json({"message": message});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
})

export default conversationRoute;