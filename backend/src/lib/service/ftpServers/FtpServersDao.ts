import * as _ from 'lodash';

import { IMongoConnectionManager } from '../../utils/mongo';
import { BrigAbstractDao } from '../BrigAbstractDao';
import { IFtpServerModel, IFtpServerUpdateModel } from './FtpServersTypes';

interface IFtpServerDb {
    id: string;
    alias: string;
    host: string;
    port: number;
    username: string;
    secure: boolean;
    ownerId: string;
    lastPath: string;
}

interface IFtpServersDaoDependencies {
    mongoConnectionManager: IMongoConnectionManager;
}

export class FtpServersDao extends BrigAbstractDao<IFtpServerDb>{
    public static readonly collectionName = 'ftpServers';
    public static readonly elementName = 'FTP Server';

    constructor(deps: IFtpServersDaoDependencies) {
        super({ mongoConnectionManager: deps.mongoConnectionManager, collectionName: FtpServersDao.collectionName, elementName: FtpServersDao.elementName });
    }

    private static mapDbToModel(db: IFtpServerDb): IFtpServerModel {
        return {
            id: db.id,
            alias: db.alias,
            host: db.host,
            port: db.port,
            username: db.username,
            secure: db.secure,
            ownerId: db.ownerId,
            lastPath: db.lastPath,
        };
    }
    
    private static mapModelToDb(model: IFtpServerModel): IFtpServerDb {
        return {
            id: model.id,
            alias: model.alias,
            host: model.host,
            port: model.port,
            username: model.username,
            secure: model.secure,
            ownerId: model.ownerId,
            lastPath: model.lastPath,
        };
    }

    public async init(): Promise<void> {
        await this.createIndexes([
            {
                id: 1,
            },
            {
                host: 1, port: 1, username: 1, ownerId: 1,
            },
        ], {
            unique: true,
        });
        await this.createIndexes([
            {
                ownerId: 1,
            },
        ]);
    }

    public async createServer(server: IFtpServerModel): Promise<IFtpServerModel> {
        return FtpServersDao.mapDbToModel(await this.insert(FtpServersDao.mapModelToDb(server)));
    }

    public async getServer(serverId: string): Promise<IFtpServerModel> {
        return FtpServersDao.mapDbToModel(await this.get({ id: serverId }));
    }

    public async getServerOwnerId(serverId: string): Promise<string> {
        return (await this.get({ id: serverId })).ownerId;
    }

    public async listUserServers(userId: string): Promise<IFtpServerModel[]> {
        return (await this.list({ ownerId: userId })).map(FtpServersDao.mapDbToModel);
    }

    public async listAllServers(): Promise<IFtpServerModel[]> {
        return (await this.list()).map(FtpServersDao.mapDbToModel);
    }

    public async updateServer(serverId: string, server: IFtpServerUpdateModel): Promise<IFtpServerModel> {
        return FtpServersDao.mapDbToModel(await this.update({ id: serverId }, {
            $set: _.omitBy({
                alias: server.alias,
                host: server.host,
                port: server.port,
                username: server.username,
                secure: server.secure,
            }, _.isUndefined),
        }, {
            returnDocument: 'after',
        }));
    }

    public async updateLastPath(serverId: string, lastPath: string) : Promise<IFtpServerModel> {
        return FtpServersDao.mapDbToModel(await this.update({ id: serverId }, { $set: { lastPath } }, { returnDocument: 'after' }));
    }

    public async deleteServer(serverId: string): Promise<void> {
        await this.delete({ id: serverId });
    }
}
