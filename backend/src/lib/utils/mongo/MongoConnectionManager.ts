import { Db, MongoClient, MongoClientOptions } from 'mongodb';

import { IBrigMongoConfig } from '../../config';
import { logger } from '../../logger';

export interface IMongoConnectionManager {
    db: Db;
    init(): Promise<void>;
    close(): Promise<void>;
}

export class MongoConnectionManager implements IMongoConnectionManager {
    private readonly mongoConfig: IBrigMongoConfig;
    private readonly mongoClient: MongoClient;
    public readonly db: Db;

    constructor(mongoConfig: IBrigMongoConfig) {
        this.mongoConfig = mongoConfig;
        const { user, pass, authSource, host, port } = mongoConfig.connection;
        const mongoUrl = `mongodb://${host}:${port}`;
        const mongoOptions: MongoClientOptions = {
            auth: user && pass ? {
                username: user,
                password: pass,
            } : undefined,
            authSource,
        };
        this.mongoClient = new MongoClient(mongoUrl, mongoOptions);
        this.db = this.mongoClient.db(this.mongoConfig.dbName);
    }

    public async init(): Promise<void> {
        await this.mongoClient.connect();
        logger.info('Connection to mongodb successful');
    }

    public async close(): Promise<void> {
        await this.mongoClient.close();
        logger.info('Connection to mongodb closed');
    }
}
