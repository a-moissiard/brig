import * as uuid from 'uuid';

import { BrigFtpServerDao } from './BrigFtpServerDao';
import { IFtpServerCreateModel, IFtpServerModel, IFtpServerUpdateModel } from './BrigFtpServerTypes';

interface IBrigServiceDependencies {
    brigFtpServerDao: BrigFtpServerDao;
}

export class BrigService {
    private readonly brigFtpServerDao: BrigFtpServerDao;

    constructor(deps: IBrigServiceDependencies) {
        this.brigFtpServerDao = deps.brigFtpServerDao;
    }

    public async listServers(): Promise<IFtpServerModel[]> {
        return this.brigFtpServerDao.listServers();
    }

    public async createServer(server: IFtpServerCreateModel): Promise<IFtpServerModel> {
        const id = uuid.v4();
        return this.brigFtpServerDao.createServer({
            id,
            ...server,
        });
    }

    public async getServer(serverId: string): Promise<IFtpServerModel> {
        return this.brigFtpServerDao.getServer(serverId);
    }

    public async updateServer(serverId: string, server: IFtpServerUpdateModel): Promise<IFtpServerModel> {
        return this.brigFtpServerDao.updateServer(serverId, server);
    }

    public async deleteServer(serverId: string): Promise<void> {
        return this.brigFtpServerDao.deleteServer(serverId);
    }
}
