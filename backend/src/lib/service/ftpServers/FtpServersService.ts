import * as uuid from 'uuid';

import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';
import { IRequester } from '../authorizations';
import { FtpClient, IFileInfo } from '../ftpUtils';
import { FtpServersAuthorizationsEnforcer } from './FtpServersAuthorizationsEnforcer';
import { FtpServersDao } from './FtpServersDao';
import { IFtpServerCreateModel, IFtpServerModel, IFtpServerUpdateModel } from './FtpServersTypes';

interface IFtpServersServiceDependencies {
    ftpServersDao: FtpServersDao;
    ftpServersAuthorizationsEnforcer: FtpServersAuthorizationsEnforcer;
}

interface IUsersClients {
    firstClient?: FtpClient;
    secondClient?: FtpClient;
}

export class FtpServersService {
    private readonly ftpServersDao: FtpServersDao;
    private readonly ftpServersAuthorizationsEnforcer: FtpServersAuthorizationsEnforcer;

    private readonly usersClients: Map<string, IUsersClients>;

    constructor(deps: IFtpServersServiceDependencies) {
        this.ftpServersDao = deps.ftpServersDao;
        this.ftpServersAuthorizationsEnforcer = deps.ftpServersAuthorizationsEnforcer;

        this.usersClients = new Map();
    }

    // CRUD

    public async createServer(requester: IRequester, server: IFtpServerCreateModel): Promise<IFtpServerModel> {
        const id = uuid.v4();
        return this.ftpServersDao.createServer({
            id,
            ownerId: requester.id,
            ...server,
        });
    }

    public async getServer(requester: IRequester, serverId: string): Promise<IFtpServerModel> {
        const server = await this.ftpServersDao.getServer(serverId);
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServer(requester, server);
        return server;
    }

    public async listUserServers(requester: IRequester): Promise<IFtpServerModel[]> {
        return this.ftpServersDao.listUserServers(requester.id);
    }

    public async listAllServers(requester: IRequester): Promise<IFtpServerModel[]> {
        await this.ftpServersAuthorizationsEnforcer.assertIsAdmin(requester);
        return this.ftpServersDao.listAllServers();
    }

    public async updateServer(requester: IRequester, serverId: string, serverUpdate: IFtpServerUpdateModel): Promise<IFtpServerModel> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        return this.ftpServersDao.updateServer(serverId, serverUpdate);
    }

    public async deleteServer(requester: IRequester, serverId: string): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        return this.ftpServersDao.deleteServer(serverId);
    }

    // Actions

    public async connect(requester: IRequester, serverId: string, first: boolean, password: string): Promise<void> {
        const server = await this.ftpServersDao.getServer(serverId);
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServer(requester, server);
        const client = new FtpClient({ ftpServer: server });
        await client.connect(password);
        this.setClient(requester, first, client);
    }

    public async disconnect(requester: IRequester, serverId: string, first: boolean): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, first);
        await client.disconnect();
        this.unsetClient(requester, first);
    }

    public async list(requester: IRequester, serverId: string, first: boolean, path: string): Promise<IFileInfo[]> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, first);
        await client.cd(path);
        return client.list();
    }

    public async pwd(requester: IRequester, serverId: string, first: boolean): Promise<string> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, first);
        return client.pwd();
    }

    private setClient(requester: IRequester, first: boolean, client: FtpClient): void {
        const userClients = this.usersClients.get(requester.id) || {};
        if (first) {
            userClients.firstClient = client;
        } else {
            userClients.secondClient = client;
        }
        this.usersClients.set(requester.id, userClients);
    }

    private unsetClient(requester: IRequester, first: boolean): void {
        const userClients = this.usersClients.get(requester.id) || {};
        if (first) {
            if (userClients.secondClient) {
                delete userClients.firstClient;
                this.usersClients.set(requester.id, userClients);
            } else {
                this.usersClients.delete(requester.id);
            }
        } else {
            if (userClients.firstClient) {
                delete userClients.secondClient;
                this.usersClients.set(requester.id, userClients);
            } else {
                this.usersClients.delete(requester.id);
            }
        }
    }

    private getClient(requester: IRequester, first: boolean): FtpClient {
        const usersClient = this.usersClients.get(requester.id);
        if (usersClient) {
            if (first && usersClient.firstClient) {
                return usersClient.firstClient;
            } else if (!first && usersClient.secondClient) {
                return usersClient.secondClient;
            }
        }
        throw new BrigError(BRIG_ERROR_CODE.FTP_NOT_LOGGED_IN, `Client not registered for user=${requester.id}`, {
            publicMessage: 'You need to reconnect to the ftp server',
        });
    }
}
