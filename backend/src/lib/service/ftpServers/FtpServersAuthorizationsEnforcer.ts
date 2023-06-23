import { BrigAbstractAuthorizationsEnforcer, IRequester } from '../authorizations';
import { UsersDao } from '../users';
import { FtpServersDao } from './FtpServersDao';
import { IFtpServerModel } from './FtpServersTypes';

interface IFtpServersAuthorizationsEnforcerDependencies {
    usersDao: UsersDao;
    ftpServersDao: FtpServersDao;
}

export class FtpServersAuthorizationsEnforcer extends BrigAbstractAuthorizationsEnforcer {
    private readonly ftpServersDao: FtpServersDao;

    constructor(deps: IFtpServersAuthorizationsEnforcerDependencies) {
        super(deps);
        this.ftpServersDao = deps.ftpServersDao;
    }

    public async assertCanManageServerById(requester: IRequester, serverId: string): Promise<void> {
        const serverOwnerId = await this.ftpServersDao.getServerOwnerId(serverId);
        return this.assertCanManageResource(requester, serverId, serverOwnerId, FtpServersDao.elementName);
    }

    public async assertCanManageServer(requester: IRequester, server: IFtpServerModel): Promise<void> {
        return this.assertCanManageResource(requester, server.id, server.ownerId, FtpServersDao.elementName);
    }
}
