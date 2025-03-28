import {Router} from "express";
import {z} from "zod";
import { v4 as uuidv4 } from "uuid";
import {User} from "../database/entities/User";
import {processRequestBody} from "zod-express-middleware";
const bcrypt = require("bcrypt");

const saltRounds = 10;

const registerSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),

})
const userRoute = Router();

userRoute.post("/user", processRequestBody(registerSchema), async (req, res) => {
    const user = await User.findOne({
        where: {
            email: req.body.email,
        }
    });

    if (!user) {
        const newUser = new User();
        const options = {
            random: Buffer.from(req.body.email),
        };

        newUser.id = uuidv4(options);
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        await bcrypt.hash(req.body.password, saltRounds, async (err: any, hash: string) => {
            if (err) {
                return res.status(500);
            }
            newUser.passwordHash = hash;
            await newUser.save();
        });

        return res.status(201).json({uuid: newUser.id});
    }

    return res.status(400).json({error: "User already exists"});
});

export default userRoute;