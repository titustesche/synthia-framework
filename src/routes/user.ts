import {Router} from "express";
import {z} from "zod";
import {v4 as uuidv4} from "uuid";
import {User} from "../database/entities/User";
import {processRequestBody} from "zod-express-middleware";
import bcrypt = require("bcrypt");
import * as crypto from "node:crypto";
import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from "./auth/authMiddleware";

// How should registration data be structured?
const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),

});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const userRoute = Router();

userRoute.post('/login', processRequestBody(loginSchema), async (req, res) => {
    try {
        // Get user from DB
        const user = await User.findOne({where: {email: req.body.email}});
        // If not exist, return 404
        if (!user) return res.status(401).json({error: "Unauthorized"});
        // Get password from post-body
        let password = req.body.password;
        // Compare to stored hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        // If hash doesn't match, return 401
        if (!isMatch) return res.status(401).json({error: "Unauthorized"});
        // If password and hash match, generate session token
        const token = jwt.sign({userId: user.id, email: user.email}, JWT_SECRET, { expiresIn: '24h'});
        // Return token

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
        });

        return res.status(200).json({token: token});
    }

    catch (error) {
        res.status(500).json({error: "Internal Server Error"})
    }
});

userRoute.post("/register", processRequestBody(registerSchema), async (req, res) => {
    const user = await User.findOne({
        where: {
            email: req.body.email,
        }
    });

    if (!user) {
        const newUser = new User();

        // Overcomplicated creation of a user ID based on the user's email address
        const options = {
            random:
                crypto.createHash('sha256')
                .update(req.body.email)
                .digest()
                .subarray(0, 16)
        };

        newUser.id = uuidv4(options);
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        try {
            // Hash the password
            newUser.passwordHash = await bcrypt.hash(req.body.password, 10);
            // Save the user
            await newUser.save();
            // Create a new access token for the client
            const token = jwt.sign({userId: newUser.id, email: newUser.email}, JWT_SECRET, { expiresIn: '24h'});
            // Respond back with the token
            return res.status(201).json({token: token});
        }

        // In case something goes wrong
        catch (e) {
            // Log that error and report back to the client
            console.error(e);
            return res.status(500).json({error: e});
        }
    }

    return res.status(400).json({error: "User already exists"});
});

export default userRoute;