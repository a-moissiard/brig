import * as _ from 'lodash';

import { IMongoConnectionManager } from '../../utils/mongo';
import { BrigAbstractDao } from '../BrigAbstractDao';
import { IFtpServerModel, IFtpServerUpdateModel } from './FtpServersTypes';

interface IFtpServerDb {
    id: string;
    host: string;
    port: number;
    username: string;
}

interface IFtpServersDaoDependencies {
    mongoConnectionManager: IMongoConnectionManager;
}

export class FtpServersDao extends BrigAbstractDao<IFtpServerDb>{
    public static readonly collectionName = 'ftpServers';

    constructor(deps: IFtpServersDaoDependencies) {
        super({ mongoConnectionManager: deps.mongoConnectionManager, collectionName: FtpServersDao.collectionName });
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
        await this.createIndexes([
            {
                id: 1,
            },
            {
                host: 1, port: 1, username: 1,
            },
        ], {
            unique: true,
        });
    }

    public async getServer(serverId: string): Promise<IFtpServerModel> {
        return FtpServersDao.mapDbToModel(await this.get({ id: serverId }));
    }

    public async listServers(): Promise<IFtpServerModel[]> {
        return (await this.list()).map(FtpServersDao.mapDbToModel);
    }

    public async createServer(server: IFtpServerModel): Promise<IFtpServerModel> {
        return FtpServersDao.mapDbToModel(await this.insert(FtpServersDao.mapModelToDb(server)));
    }

    public async updateServer(serverId: string, server: IFtpServerUpdateModel): Promise<IFtpServerModel> {
        return FtpServersDao.mapDbToModel(await this.update( { id: serverId }, {
            $set: _.omitBy({
                host: server.host,
                port: server.port,
                username: server.username,
            }, _.isUndefined),
        }, {
            returnDocument: 'after',
        }));
    }

    public async deleteServer(serverId: string): Promise<void> {
        await this.delete({ id: serverId });
    }
}
