import { Router } from 'express';
import { z } from "zod";
import {processRequestBody} from "zod-express-middleware";
const userRoute = Router();
const format = z.object({
    topic: z.string(),
    keywords: z.array(z.string()),
    description: z.string(),
    context: z.string(),
    createdAt: z.date(),
    importance: z.number(),
})

userRoute.get('/', processRequestBody(format), (req, res) => {

});

export default userRoute;