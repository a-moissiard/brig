import { IBrigMongoConfig } from '../../config';
import { MongoConnectionManager } from './MongoConnectionManager';

export class MongoConnectionTestManager extends MongoConnectionManager {
    constructor(mongoConfig: IBrigMongoConfig) {
        super(mongoConfig);
    }

    async close(): Promise<void> {
        await this.db.dropDatabase();
        return super.close();
    }

    async cleanDb(): Promise<void> {
        const collections = await this.db.collections();
        await Promise.all(collections.map(collection => collection.deleteMany({})));
    }
}
