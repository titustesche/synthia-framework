import { Router } from 'express';
import { z } from "zod";
import {processRequestBody} from "zod-express-middleware";
import {Memory} from "../database/entities/Memory";
import {Like} from "typeorm";
const route = Router();
const writeFormat = z.object({
    topic: z.string(),
    keywords: z.array(z.string()),
    description: z.string(),
    context: z.string(),
    createdAt: z.string().datetime(),
    // Workaround for floating point values that I selfishly copied from the internet
    importance: z.number().refine( n => {
        return n.toString().split('.')[1].length <= 2

    }, {message: 'Max precision is 2 decimal places'} ),
});

const readFormat = z.object({
    keywords: z.array(z.string()),
});

// Route to handle read requests
route.get('/request', processRequestBody(readFormat), async (req, res) => {
    let memory: Memory[] = [];

    for (let i = 0; i < req.body.keywords.length; i++)
    {
        let match: Memory[] = await Memory.find({
            where: {
                keywords: Like(`%${req.body.keywords[i]}%`)
            }
        })
        memory = memory.concat(match);
    }

    res.status(200).json(memory);
});

// Route to handle store requests
route.post('/request', processRequestBody(writeFormat), async (req, res) => {
    const memory = new Memory();
    memory.topic = req.body.topic;
    memory.keywords = JSON.stringify(req.body.keywords);
    memory.description = req.body.description;
    memory.context = req.body.context;
    memory.createdAt = new Date(req.body.createdAt);
    memory.importance = req.body.importance;

    await memory.save();

    res.status(200).json(memory);
});

export default route;