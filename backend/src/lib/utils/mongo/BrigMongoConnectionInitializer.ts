import { Db, MongoClient } from 'mongodb';

import { IBrigMongoConfig } from '../../config';

export class BrigMongoConnectionInitializer {
    private readonly mongoConfig: IBrigMongoConfig;
    private readonly mongoClient: MongoClient;

    constructor(mongoConfig: IBrigMongoConfig) {
        this.mongoConfig = mongoConfig;
        const { user, pass, host, port } = mongoConfig.connection;
        const mongoUrl = `mongodb://${user}:${pass}@${host}:${port}`;
        this.mongoClient = new MongoClient(mongoUrl);
    }

    public async init(): Promise<void> {
        await this.mongoClient.connect();
    }

    public getDb(): Db {
        return this.mongoClient.db(this.mongoConfig.dbName);
    }
}
