import { Collection, Db } from 'mongodb';

import { logger } from '../logger';

interface IFtpServerDb {
    id: string;
    host: string;
    port: number;
    username: string;
}

interface IBrigFtpServerDaoDependencies {
    collection: Collection;
}

export class BrigFtpServerDao {
    public static readonly collectionName = 'ftpServer';
    private readonly collection: Collection;
    
    constructor(deps: IBrigFtpServerDaoDependencies) {
        this.collection = deps.collection;
    }

    public async init(): Promise<void> {
        await this.collection.createIndexes([
            {
                key: { id: 1 },
            },
            {
                key: { host: 1, port: 1 },
            },
        ], {
            unique: true,
        });
        logger.verbose(`Indexes created for mongo collection ${BrigFtpServerDao.collectionName}`);
    }
}