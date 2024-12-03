import {DataSource} from 'typeorm';
import {Memory} from "./entities/Memory";
import {Conversation} from "./entities/Conversation";
import {Message} from "./entities/Message";
import {User} from "./entities/User";

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: 'localhost',
    port: 3306,
    username: 'synthia_framework',
    password: '1234',
    database: 'synthia_framework',
    entities: [Memory, Conversation, Message, User],
    synchronize: true
});