import { IBrigMongoConfig } from '../../config';
import { BrigMongoConnectionInitializer } from './BrigMongoConnectionInitializer';

export class BrigMongoConnectionTestInitializer extends BrigMongoConnectionInitializer {
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
