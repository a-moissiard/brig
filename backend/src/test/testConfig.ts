import { IBrigMongoConfig } from '../lib/config';

export const testConfig: IBrigMongoConfig = {
    connection:{
        user: process.env.MONGO_USER || '',
        pass: process.env.MONGO_PASS || '',
        host: process.env.MONGO_HOST || '',
        port: process.env.MONGO_PORT || '27017',
    },
    dbName: 'brig-test',
};
