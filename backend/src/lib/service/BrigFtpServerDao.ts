import { Collection, MongoServerError } from 'mongodb';

import { logger } from '../logger';
import { BRIG_ERROR_CODE, BrigError } from '../utils';
import { IFtpServerModel, IFtpServerUpdateModel } from './BrigFtpServerTypes';

interface IFtpServerDb {
    id: string;
    host: string;
    port: number;
    username: string;
}

interface IBrigFtpServerDaoDependencies {
    collection: Collection<IFtpServerDb>;
}

export class BrigFtpServerDao {
    public static readonly collectionName = 'ftpServer';
    private readonly collection: Collection<IFtpServerDb>;
    
    constructor(deps: IBrigFtpServerDaoDependencies) {
        this.collection = deps.collection;
    }

    private static mapDbToModel(db: IFtpServerDb): IFtpServerModel {
        return {
            id: db.id,
            host: db.host,
            port: db.port,
            username: db.username,
        };
    }
    
    private static mapModelToDb(model: IFtpServerModel): IFtpServerDb {
        return {
            id: model.id,
            host: model.host,
            port: model.port,
            username: model.username,
        };
    }

    public async init(): Promise<void> {
        await this.collection.createIndex(
            {
                id: 1,
            }, {
                unique: true,
            });
        await this.collection.createIndex(
            {
                host: 1, port: 1, username: 1,
            }, {
                unique: true,
            });
        logger.verbose(`Indexes created for mongo collection ${BrigFtpServerDao.collectionName}`);
    }

    public async listServers(): Promise<IFtpServerModel[]> {
        return (await this.collection.find().toArray()).map(BrigFtpServerDao.mapDbToModel);
    }

    public async createServer(server: IFtpServerModel): Promise<IFtpServerModel> {
        let createdServer: IFtpServerDb | null;
        try {
            const insertionResult = await this.collection.insertOne(BrigFtpServerDao.mapModelToDb(server));
            createdServer = await this.collection.findOne({ _id: insertionResult.insertedId });
        } catch (e) {
            if (e instanceof MongoServerError && e.code === 11000) {
                throw new BrigError(BRIG_ERROR_CODE.DB_DUPLICATE, 'A server with the same username@host:port already exists.', {
                    cause: e.stack,
                });
            }
            throw e;
        }
        if (!createdServer) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `Error while inserting document ${server.id} in collection ${BrigFtpServerDao.collectionName}`);
        }
        return BrigFtpServerDao.mapDbToModel(createdServer);
    }

    public async getServer(serverId: string): Promise<IFtpServerModel> {
        const server = await this.collection.findOne({ id: serverId });
        if (!server) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `No server found with id=${serverId}`);
        }
        return BrigFtpServerDao.mapDbToModel(server);
    }

    public async updateServer(serverId: string, server: IFtpServerUpdateModel): Promise<IFtpServerModel> {
        const updatedServer = (await this.collection.findOneAndUpdate({
            id: serverId,
        }, {
            $set: { ...server },
        }, {
            returnDocument: 'after',
        })).value;
        if (!updatedServer) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `No server found with id=${serverId}`);
        }
        return BrigFtpServerDao.mapDbToModel(updatedServer);
    }

    public async deleteServer(serverId: string): Promise<void> {
        const deletedServer = (await this.collection.findOneAndDelete({ id: serverId })).value;
        if (!deletedServer) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `No server found with id=${serverId}`);
        }
    }
}
