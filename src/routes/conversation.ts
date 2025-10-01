// Todo: Everything in here can be moved to database because it basically is database access
// No but what the actual fuck was i tripping on when writing this todo?
import {Router} from "express";
import {processRequestBody} from "zod-express-middleware";
import {Conversation} from "../database/entities/Conversation";
import {z} from "zod";
import {Message} from "../database/entities/Message";
import * as crypto from "node:crypto";
import {authMiddleware} from "./auth/authMiddleware";
import user from "./user";

const conversationRoute = Router();
const convoPostSchema = z.object({
    name: z.string(),
});
const messagePostSchema = z.object({
    role: z.string(),
    content: z.string(),
});

// List all conversations
conversationRoute.get('/conversation', authMiddleware, async (req, res) => {
    const user = req.user!;
    if (!user) return res.status(401).json({error: "Unauthorized"});

    try {
        let conversations = await Conversation.find({
            where: {
                owner: user
            }
        });

        // Todo: Order these by last message
        return res.status(200).json({"conversations": conversations});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

// Delete an existing conversation
conversationRoute.delete('/conversation/:id', authMiddleware, async (req, res) => {
    const user = req.user!;
    if (!user) return res.status(401).json({error: "Unauthorized"});

    try {
        let conversation = await Conversation.findOneOrFail({
            where: {
                owner: user,
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
conversationRoute.post('/conversation', authMiddleware, processRequestBody(convoPostSchema), async (req, res) => {
    const user = req.user!;
    if (!user) return res.status(401).json({error: "Unauthorized"});

    try {
        let conversation = new Conversation();
        conversation.id = crypto.randomUUID();
        conversation.name = req.body.name;
        conversation.owner = user;

        await conversation.save();
        return res.status(200).json({"conversation": conversation});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

// Request this to get all the messages from the given conversation
conversationRoute.get('/message/:id', authMiddleware, async (req, res) => {
    const user = req.user!;
    if (!user) return res.status(401).json({error: "Unauthorized"});

    try {
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: req.params.id,
                owner: user
            },
            relations: {
                messages: true
            }
        });

        if (!conversation)
        {
            return res.status(404).json({error: "Cannot access conversation"});
        }

        return res.status(200).json({"messages": conversation.messages});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

// Submit a new Message to a conversation (without requesting an answer from the AI)
conversationRoute.post('/message/:id', authMiddleware, processRequestBody(messagePostSchema), async (req, res) => {
    const user = req.user!;
    if (!user) return res.status(401).json({error: "Unauthorized"});

    try {
        // Make sure the conversation exists
        // Todo: Also make sure the user is allowed to modify the conversation
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: req.params['id'],
                owner: user
            }
        });

        if (!conversation) return res.status(404).json({error: "Cannot access conversation"});

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