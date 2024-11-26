// Todo: Everything in here can be moved to database because it basically is database access

import {Router} from "express";
import {processRequestBody} from "zod-express-middleware";
import {Conversation} from "../database/entities/Conversation";
import {z} from "zod";
import {Message} from "../database/entities/Message";

const conversationRoute = Router();
const convoPostSchema = z.object({
    name: z.string(),
});
const messagePostSchema = z.object({
    role: z.string(),
    content: z.string(),
});

conversationRoute.get('/conversation', async (req, res) => {
    try {
        let conversations = await Conversation.find();
        return res.status(200).json({"conversations": conversations});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

conversationRoute.post('/conversation', processRequestBody(convoPostSchema), async (req, res) => {
    try {
        let conversation = new Conversation();
        conversation.name = req.body.name;

        await conversation.save();
        return res.status(200).json({"conversation": conversation});
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({"error": e});
    }
});

conversationRoute.get('/message/:id', async (req, res) => {
    try {
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: +req.params.id
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

conversationRoute.post('/message/:id', async (req, res) => {
    try {
        let conversation = await Conversation.findOneOrFail({
            where: {
                id: +req.params['id']
            }
        });

        if (!conversation) {
            return res.status(404).json({"error": "Conversation does not exist"});
        }

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