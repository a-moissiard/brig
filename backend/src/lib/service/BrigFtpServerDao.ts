import { IBrigMongoConnectionManager } from '../utils/mongo';
import { BrigAbstractDao } from './BrigAbstractDao';
import { IFtpServerModel, IFtpServerUpdateModel } from './BrigFtpServerTypes';

interface IFtpServerDb {
    id: string;
    host: string;
    port: number;
    username: string;
}

interface IBrigFtpServerDaoDependencies {
    mongoConnectionManager: IBrigMongoConnectionManager;
}

export class BrigFtpServerDao extends BrigAbstractDao<IFtpServerDb>{
    public static readonly collectionName = 'ftpServer';

    constructor(deps: IBrigFtpServerDaoDependencies) {
        super({ mongoConnectionManager: deps.mongoConnectionManager, collectionName: BrigFtpServerDao.collectionName });
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
        await this.createIndex(
            {
                host: 1, port: 1, username: 1,
            }, {
                unique: true,
            });
    }

    public async getServer(serverId: string): Promise<IFtpServerModel> {
        return BrigFtpServerDao.mapDbToModel(await this.get({ id: serverId }));
    }

    public async listServers(): Promise<IFtpServerModel[]> {
        return (await this.list()).map(BrigFtpServerDao.mapDbToModel);
    }

    public async createServer(server: IFtpServerModel): Promise<IFtpServerModel> {
        return BrigFtpServerDao.mapDbToModel(await this.insert(BrigFtpServerDao.mapModelToDb(server)));
    }

    public async updateServer(serverId: string, server: IFtpServerUpdateModel): Promise<IFtpServerModel> {
        return BrigFtpServerDao.mapDbToModel(await this.update( { id: serverId }, server));
    }

    public async deleteServer(serverId: string): Promise<void> {
        await this.delete({ id: serverId });
    }
}
