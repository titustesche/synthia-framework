import {DataSource} from 'typeorm';
import {Memory} from "./entities/Memory";

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: 'localhost',
    port: 3306,
    username: 'ai_memory',
    password: '1234',
    database: 'ai_memory',
    entities: [Memory],
    synchronize: true
});