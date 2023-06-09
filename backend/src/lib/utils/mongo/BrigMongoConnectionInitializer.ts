import { Db, MongoClient } from 'mongodb';

import { IBrigMongoConfig } from '../../config';

export interface IBrigMongoConnectionInitializer {
    db: Db;
    init(): Promise<void>;
    close(): Promise<void>;
}

export class BrigMongoConnectionInitializer implements IBrigMongoConnectionInitializer {
    private readonly mongoConfig: IBrigMongoConfig;
    private readonly mongoClient: MongoClient;
    public readonly db: Db;

    constructor(mongoConfig: IBrigMongoConfig) {
        this.mongoConfig = mongoConfig;
        const { user, pass, host, port } = mongoConfig.connection;
        const mongoUrl = `mongodb://${user}:${pass}@${host}:${port}`;
        this.mongoClient = new MongoClient(mongoUrl);
        this.db = this.mongoClient.db(this.mongoConfig.dbName);
    }

    public async init(): Promise<void> {
        await this.mongoClient.connect();
    }

    public async close(): Promise<void> {
        await this.mongoClient.close();
    }
}
