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