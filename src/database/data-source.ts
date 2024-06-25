import {DataSource} from 'typeorm';

const appDataSource = new DataSource({
    type: 'mariadb',
    host: 'localhost',
    port: 3306,
    username: 'ai-memory',
    password: '1234',
    database: 'ai-memory',
    entities: [],
});