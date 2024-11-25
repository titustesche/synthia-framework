import {response} from "express";
import axios from "axios";
import {Message} from "./database/entities/Message";
import {Conversation} from "./database/entities/Conversation";
import {EventEmitter} from "events";

export async function getMessages(conversation: Conversation) {
    let cleanMessages = [];
    let messages = await Message.find({
        where: {
            conversation: conversation,
        }
    })

    messages.forEach(message => {
        cleanMessages.push({
            "role": message.role,
            "content": message.content,
        });
    });

    return cleanMessages.length > 0 ? cleanMessages : undefined;
}

export async function aiRequest(model: string, role: string, message: string, images: string[], conversation: Conversation): Promise<EventEmitter> {
    const emitter = new EventEmitter();
    let messages = await getMessages(conversation);

    if (!messages)
    {
        emitter.emit("error", "Messages not found");
    }

    else {
        let url = "http://localhost:11434/api/chat";
        const data = {
            "model": model,
            "messages": messages,
        };

        try {
            const res = await axios.post(url, data, {responseType: "stream"});

            res.data.on("data", (chunk: Buffer) => {
                // Datenverarbeitung
                emitter.emit("data", JSON.parse(chunk.toString()).message.content);
            });

            res.data.on("end", () => {
                emitter.emit("end");
            });

            return emitter;
        } catch (e) {
            emitter.emit("error", e);
        }
    }
}