import {DataSource} from 'typeorm';
import {Memory} from "./entities/Memory";
import {Conversation} from "./entities/Conversation";
import {Message} from "./entities/Message";
import {User} from "./entities/User";

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: process.env.DATABASE_HOST, // Change this if you don't run inside docker
    port: 3306,
    username: 'synthia_framework',
    password: '1234',
    database: 'synthia_framework',
    charset: 'utf8mb4',
    extra: {
        collation: 'utf8mb4_unicode_ci',
    },
    entities: [Memory, Conversation, Message, User],
    synchronize: true
});