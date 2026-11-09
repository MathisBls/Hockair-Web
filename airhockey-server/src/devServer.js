import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { MongoMemoryServer } from 'mongodb-memory-server';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DATABASE_PATH = path.resolve(currentDirectory, '..', '.local-db');
const LOCAL_DATABASE_PORT = 27027;
const LOCAL_DATABASE_NAME = 'hockair';

fs.mkdirSync(LOCAL_DATABASE_PATH, { recursive: true });

const localDatabase = await MongoMemoryServer.create({
  instance: {
    dbPath: LOCAL_DATABASE_PATH,
    port: LOCAL_DATABASE_PORT,
    storageEngine: 'wiredTiger',
  },
});

process.env.DATABASE_URL = localDatabase.getUri(LOCAL_DATABASE_NAME);
console.log(`Local MongoDB running at ${process.env.DATABASE_URL}`);

const stopLocalDatabase = async () => {
  await localDatabase.stop({ doCleanup: false });
  process.exit(0);
};
process.on('SIGINT', stopLocalDatabase);
process.on('SIGTERM', stopLocalDatabase);

await import('./server.js');
