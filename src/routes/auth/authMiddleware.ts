import { Request, Response, NextFunction } from "express";
import { User } from "../../database/entities/User";
import * as jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            token?: string;
        }
    }
}

export const JWT_SECRET = process.env.JWT_SECRET || "extremely-secure-secret";

interface JWTPayload {
    userId: string;
    email: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies) return res.status(401).json({error: "Could not read cookies"});
    const token = req.cookies.token;

    if (!token) return res.status(401).json({error: "No token provided"});
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        const user = await User.findOneOrFail({
            where: {
                id: decoded.userId,
            }
        });

        if (!user) return res.status(401).json({error: "User not found"});

        req.user = user;
        req.token = token;
        next();
    }

    catch (e) {
        if (e instanceof jwt.TokenExpiredError) return res.status(401).json({error: "Token expired"});
        if (e instanceof jwt.JsonWebTokenError) return res.status(401).json({error: "Invalid token"});
        console.error(e);
        return res.status(500).json({error: "Internal server error"});
    }
}