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

export class FtpServersService {
    private readonly ftpServersDao: FtpServersDao;
    private readonly ftpServersAuthorizationsEnforcer: FtpServersAuthorizationsEnforcer;

    private readonly usersClients: Map<string, Record<string, FtpClient>>;

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

    public async connect(requester: IRequester, serverId: string, password: string): Promise<void> {
        const server = await this.ftpServersDao.getServer(serverId);
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServer(requester, server);
        const client = new FtpClient({ ftpServer: server });
        this.setClient(requester, serverId, client);
        await client.connect(password);
    }

    public async disconnect(requester: IRequester, serverId: string): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, serverId);
        await client.disconnect();
        this.unsetClient(requester, serverId);
    }

    public async list(requester: IRequester, serverId: string, path: string): Promise<IFileInfo[]> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, serverId);
        await client.cd(path);
        return client.list();
    }

    public async pwd(requester: IRequester, serverId: string): Promise<string> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, serverId);
        return client.pwd();
    }

    public async createDir(requester: IRequester, serverId: string, path: string): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, serverId);
        await client.createDir(path);
        await client.cd('..');
    }

    private setClient(requester: IRequester, serverId: string, client: FtpClient): void {
        const userClients = this.usersClients.get(requester.id) || {};
        const serverIds = Object.keys(userClients);
        if (serverIds.length < 2 || serverIds.includes(serverId)) {
            userClients[serverId] = client;
        } else {
            throw new BrigError(BRIG_ERROR_CODE.FTP_MAX_CLIENT_NUMBER_REACHED, 'Connection to more than two FTP servers at a time not permitted');
        }
        this.usersClients.set(requester.id, userClients);
    }

    private unsetClient(requester: IRequester, serverId: string): void {
        const userClients = this.usersClients.get(requester.id) || {};
        delete userClients[serverId];
        if (Object.keys(userClients).length === 0) {
            this.usersClients.delete(requester.id);
        } else {
            this.usersClients.set(requester.id, userClients);
        }
    }

    private getClient(requester: IRequester, serverId: string): FtpClient {
        const userClients = this.usersClients.get(requester.id);
        if (userClients && userClients[serverId]) {
            return userClients[serverId];
        }
        throw new BrigError(BRIG_ERROR_CODE.FTP_NOT_LOGGED_IN, `Client not registered for user=${requester.id}`, {
            publicMessage: 'You are not connected to this FTP server, please connect first',
        });
    }
}
