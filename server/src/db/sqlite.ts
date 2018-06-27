import { open, Database } from 'sqlite';

let db: Database;

export const initDB = async () => {
    db = await open('./db/database.sqlite', { promise: Promise });
    console.log('Initialised SQLite');
    db.migrate({ force: 'last', migrationsPath: './db/migrations' });
    console.log('Completed SQL migration');
}

export const run = async (query, ...params) => {
    return await db.run(query, ...params);
}

export const get = async (query, ...params) => {
    return await db.get(query, ...params);
}

export const all = async (query, ...params) => {
    return await db.all(query, ...params);
}