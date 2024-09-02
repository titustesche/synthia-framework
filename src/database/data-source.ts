import {DataSource} from 'typeorm';
import {Memory} from "./entities/Memory";
import {Conversation} from "./entities/Conversation";
import {Message} from "./entities/Message";

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: 'localhost',
    port: 3306,
    username: 'ai_memory',
    password: '1234',
    database: 'ai_memory',
    entities: [Memory, Conversation, Message],
    synchronize: true
});