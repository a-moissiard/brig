import * as uuid from 'uuid';

import { FtpServersDao } from './FtpServersDao';
import { IFtpServerCreateModel, IFtpServerModel, IFtpServerUpdateModel } from './FtpServersTypes';

interface IFtpServersServiceDependencies {
    ftpServersDao: FtpServersDao;
}

export class FtpServersService {
    private readonly ftpServersDao: FtpServersDao;

    constructor(deps: IFtpServersServiceDependencies) {
        this.ftpServersDao = deps.ftpServersDao;
    }

    public async listServers(): Promise<IFtpServerModel[]> {
        return this.ftpServersDao.listServers();
    }

    public async createServer(server: IFtpServerCreateModel): Promise<IFtpServerModel> {
        const id = uuid.v4();
        return this.ftpServersDao.createServer({
            id,
            ...server,
        });
    }

    public async getServer(serverId: string): Promise<IFtpServerModel> {
        return this.ftpServersDao.getServer(serverId);
    }

    public async updateServer(serverId: string, server: IFtpServerUpdateModel): Promise<IFtpServerModel> {
        return this.ftpServersDao.updateServer(serverId, server);
    }

    public async deleteServer(serverId: string): Promise<void> {
        return this.ftpServersDao.deleteServer(serverId);
    }
}
