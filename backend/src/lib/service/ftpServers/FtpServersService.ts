import { PassThrough } from 'stream';
import * as uuid from 'uuid';

import { EVENT_TYPE, SendEventCallback } from '../../api/utils';
import { logger } from '../../logger';
import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';
import { IRequester } from '../authorizations';
import { FileType, FtpClient, IFileInfo } from '../ftpUtils';
import { FtpServersAuthorizationsEnforcer } from './FtpServersAuthorizationsEnforcer';
import { FtpServersDao } from './FtpServersDao';
import { IFtpServerConnectionStateModel, IFtpServerCreateModel, IFtpServerModel, IFtpServerUpdateModel } from './FtpServersTypes';

interface IFtpServersServiceDependencies {
    ftpServersDao: FtpServersDao;
    ftpServersAuthorizationsEnforcer: FtpServersAuthorizationsEnforcer;
}

export class FtpServersService {
    private readonly ftpServersDao: FtpServersDao;
    private readonly ftpServersAuthorizationsEnforcer: FtpServersAuthorizationsEnforcer;

    private readonly usersClients: Map<string, Record<string, FtpClient>>;
    private readonly usersStreams: Map<string, PassThrough>;
    private readonly usersSendEventCallback: Map<string, SendEventCallback>;

    constructor(deps: IFtpServersServiceDependencies) {
        this.ftpServersDao = deps.ftpServersDao;
        this.ftpServersAuthorizationsEnforcer = deps.ftpServersAuthorizationsEnforcer;

        this.usersClients = new Map();
        this.usersStreams = new Map();
        this.usersSendEventCallback = new Map();
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

        // If progress tracking has been required, track progress for this newly created client
        const sendEventCallback = this.usersSendEventCallback.get(requester.id);
        if (sendEventCallback) {
            await client.trackProgress(sendEventCallback);
        }
    }

    public async disconnect(requester: IRequester, serverId: string): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, serverId);
        await client.disconnect();
        this.unsetClient(requester, serverId);
    }

    public async cd(requester: IRequester, serverId: string, path: string): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, serverId);
        await client.cd(path);
    }

    public async list(requester: IRequester, serverId: string): Promise<IFileInfo[]> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, serverId);
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
        const originalDir = await client.pwd();
        await client.ensureDirAndMoveIn(path);
        await client.cd(originalDir);
    }

    public async delete(requester: IRequester, serverId: string, path: string): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const client = this.getClient(requester, serverId);

        const fileInfo = await this.findFileInfo(client, path);

        if (fileInfo.type === FileType.File) {
            await client.deleteFile(path);
        } else if (fileInfo.type === FileType.Directory) {
            await client.deleteDir(path);
        } else {
            throw new BrigError(BRIG_ERROR_CODE.FTP_UNSUPPORTED_FILE_TYPE, `Operation not supported for file type='${fileInfo.type}'`);
        }
    }

    public async registerSendEventCallback(requester: IRequester, sendEvent: SendEventCallback): Promise<void> {
        // Register the callback so all future clients will be able to track progress immediately
        this.usersSendEventCallback.set(requester.id, sendEvent);

        // Track progress for all already existing clients
        const userClients = this.usersClients.get(requester.id);
        if (userClients) {
            for (let client of Object.values(userClients)) {
                await client.trackProgress(sendEvent);
            }
        }
    }

    public async unregisterSendEventCallback(requester: IRequester): Promise<void> {
        this.usersSendEventCallback.delete(requester.id);
    }

    public async transfer(requester: IRequester, sourceServerId: string, destinationServerId: string, path: string) : Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, sourceServerId);
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, destinationServerId);

        const sourceClient = this.getClient(requester, sourceServerId);
        const destinationClient = this.getClient(requester, destinationServerId);

        const fileInfo = await this.findFileInfo(sourceClient, path);

        if (fileInfo.type === FileType.File) {
            await this.transferFile(requester, sourceClient, destinationClient, fileInfo);
        } else if (fileInfo.type === FileType.Directory) {
            const initialSourceDir = await sourceClient.pwd();
            const initialDestinationDir = await destinationClient.pwd();
            await this.transferDirectory(requester, sourceClient, destinationClient, fileInfo);
            await sourceClient.cd(initialSourceDir);
            await destinationClient.cd(initialDestinationDir);
        } else {
            throw new BrigError(BRIG_ERROR_CODE.FTP_UNSUPPORTED_FILE_TYPE, `Transfer not supported for file type='${fileInfo.type}'`);
        }

        const sendEventCallback = this.usersSendEventCallback.get(requester.id);
        if (sendEventCallback) {
            sendEventCallback(EVENT_TYPE.TRANSFER_COMPLETED, { serverId: sourceServerId });
        }
    }

    public async cancelTransfer(requester: IRequester, serverId: string): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const ptStream = this.usersStreams.get(requester.id);
        if (ptStream) {
            ptStream.destroy();
        }
    }

    public async getUserConnectedServers(requester: IRequester): Promise<IFtpServerConnectionStateModel[]> {
        const userClients = this.usersClients.get(requester.id);
        if (userClients) {
            const connectedServers = [];
            for (let client of Object.values(userClients)) {
                try {
                    connectedServers.push({
                        server: client.ftpServer,
                        workingDir: await client.pwd(),
                        files: await client.list(),
                    });
                } catch (e) {
                    this.unsetClient(requester, client.ftpServer.id);
                }
            }
            return connectedServers;
        }
        return [];
    }

    private async findFileInfo(client: FtpClient, path: string): Promise<IFileInfo> {
        const list = await client.list();
        const fileInfo = list.find(f => f.name === path);
        if (!fileInfo) {
            throw new BrigError(BRIG_ERROR_CODE.FTP_PATH_DOES_NOT_EXIST, `No file or directory exist at path='${path}'`);
        }
        return fileInfo;
    }

    private async transferFile(requester: IRequester, sourceClient: FtpClient, destinationClient: FtpClient, fileInfo: IFileInfo): Promise<void> {
        const ptStream = new PassThrough();
        ptStream.on('error', (err: Error) => {
            this.usersStreams.delete(requester.id);
            throw new BrigError(BRIG_ERROR_CODE.STREAM_CLOSED_WITH_ERROR, err.message);
        });
        ptStream.on('close', () => {
            this.usersStreams.delete(requester.id);
            logger.info('Stream closed');
        });
        this.usersStreams.set(requester.id, ptStream);
        try {
            await Promise.all([
                sourceClient.download(ptStream, fileInfo),
                destinationClient.upload(ptStream, fileInfo),
            ]);
        } catch (e) {
            logger.warn(`Error caught on file transfer: ${(e as any)?.code}`);
        }
        ptStream.end();
    }

    private async transferDirectory(requester: IRequester, sourceClient: FtpClient, destinationClient: FtpClient, fileInfo: IFileInfo): Promise<void> {
        await destinationClient.ensureDirAndMoveIn(fileInfo.name);
        const savedDestinationWorkingDir = await destinationClient.pwd();

        await sourceClient.cd(fileInfo.name);
        const savedSourceWorkingDir = await sourceClient.pwd();

        const files = await sourceClient.list();

        for (const file of files) {
            await destinationClient.cd(savedDestinationWorkingDir);
            await sourceClient.cd(savedSourceWorkingDir);

            if (file.type === FileType.File) {
                await this.transferFile(requester, sourceClient, destinationClient, file);
            } else if (file.type === FileType.Directory) {
                await this.transferDirectory(requester, sourceClient, destinationClient, file);
            }
        }
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
