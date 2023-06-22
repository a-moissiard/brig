import { config, IBrigAuthConfig, IBrigMongoConfig } from '../lib/config';

export const testMongoConfig: IBrigMongoConfig = {
    ...config.mongo,
    dbName: 'brig-test',
};

export const testAuthConfig: IBrigAuthConfig = config.auth;
