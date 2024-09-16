import _ from 'lodash';
import path from 'path';
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

interface IUserConnectionsState {
    clients: Record<string, FtpClient>;
    transferCanceled: boolean;
    stream?: PassThrough;
    sendEventCallbacks: Record<string, SendEventCallback>;
}

interface IFtpServersServiceDependencies {
    ftpServersDao: FtpServersDao;
    ftpServersAuthorizationsEnforcer: FtpServersAuthorizationsEnforcer;
}

export class FtpServersService {
    private readonly ftpServersDao: FtpServersDao;
    private readonly ftpServersAuthorizationsEnforcer: FtpServersAuthorizationsEnforcer;

    private readonly usersStates: Map<string, IUserConnectionsState>;

    constructor(deps: IFtpServersServiceDependencies) {
        this.ftpServersDao = deps.ftpServersDao;
        this.ftpServersAuthorizationsEnforcer = deps.ftpServersAuthorizationsEnforcer;

        this.usersStates = new Map();
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

        const client = new FtpClient({ ftpServer: server, password });

        await client.connect();

        const userState = this.usersStates.get(requester.id);
        if (userState) {
            const clients = userState.clients;
            const serverIds = Object.keys(clients);
            if (serverIds.length < 2 || serverIds.includes(serverId)) {
                clients[serverId] = client;
            } else {
                throw new BrigError(BRIG_ERROR_CODE.FTP_MAX_CLIENT_NUMBER_REACHED, 'Connection to more than two FTP servers at a time not permitted');
            }
            userState.clients = clients;

            _.forEach(userState.sendEventCallbacks, (cb, id) => {
                client.registerSendEventCallback(id, cb);
            });
            await client.trackProgress();
        } else {
            this.usersStates.set(requester.id, {
                clients: {
                    [serverId]: client,
                },
                transferCanceled: false,
                sendEventCallbacks: {},
            });
        }
    }

    public async getUserConnectedServers(requester: IRequester): Promise<IFtpServerConnectionStateModel[]> {
        const userState = this.usersStates.get(requester.id);
        if (userState) {
            const connectedServers = [];
            for (let client of Object.values(userState.clients)) {
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

        const fileInfo = await this.findFileInfoInWorkingDir(client, path);

        if (fileInfo.type === FileType.File) {
            await client.deleteFile(path);
        } else if (fileInfo.type === FileType.Directory) {
            await client.deleteDir(path);
        } else {
            throw new BrigError(BRIG_ERROR_CODE.FTP_UNSUPPORTED_FILE_TYPE, `Operation not supported for file type='${fileInfo.type}'`);
        }
    }

    public async registerSendEventCallback(requester: IRequester, callback: SendEventCallback): Promise<string> {
        // Register the callback so all future clients will be able to track progress immediately
        const callbackId = uuid.v4();

        const userState = this.usersStates.get(requester.id);
        if (userState) {
            userState.sendEventCallbacks[callbackId] = callback;

            // Track progress for all already existing clients
            for (let client of Object.values(userState.clients)) {
                client.registerSendEventCallback(callbackId, callback);
            }
        } else {
            this.usersStates.set(requester.id, {
                clients: {},
                transferCanceled: false,
                sendEventCallbacks: { [callbackId]: callback },
            });
        }

        return callbackId;
    }

    public async unregisterSendEventCallback(requester: IRequester, callbackId: string): Promise<void> {
        const userState = this.usersStates.get(requester.id);
        if (userState) {
            for (let client of Object.values(userState.clients)) {
                client.unregisterSendEventCallback(callbackId);
            }
            delete userState.sendEventCallbacks[callbackId];
        }
    }

    /**
     * Preparation step of the transfer, responsible for the following:
     * - Building a mapping of the files to be transferred, in the form of a Record<string, string> containing
     *      the absolute paths of the files on the source server as keys and
     *      the absolute paths where the files will be transferred on the destination server as values
     * - Ensuring all the necessary directories are created on the destination server if there is a dir tree to build
     * @param requester
     * @param sourceServerId
     * @param destinationServerId
     * @param _path
     */

    public async prepareTransfer(
        requester: IRequester,
        sourceServerId: string,
        destinationServerId: string,
        _path: string,
    ): Promise<Record<string, string>> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, sourceServerId);
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, destinationServerId);

        const sourceClient = this.getClient(requester, sourceServerId);
        const destinationClient = this.getClient(requester, destinationServerId);

        const sourceWorkingDir = await sourceClient.pwd();
        const destinationWorkingDir = await destinationClient.pwd();

        const fileInfo = await this.findFileInfoInWorkingDir(sourceClient, _path);

        const sourceAbsolutePath = path.join(sourceWorkingDir, fileInfo.name);
        const destinationAbsolutePath = path.join(destinationWorkingDir, fileInfo.name);

        if (fileInfo.type === FileType.File) {
            return { [sourceAbsolutePath]: destinationAbsolutePath };
        } else if (fileInfo.type === FileType.Directory) {
            const transferMapping = await this.buildRecursiveTransferMappingAndEnsureDirs(requester, sourceClient, destinationClient, sourceAbsolutePath, destinationAbsolutePath);
            // reset the working dirs to the initial values
            await sourceClient.cd(sourceWorkingDir);
            await destinationClient.cd(destinationWorkingDir);
            return transferMapping;
        } else {
            throw new BrigError(BRIG_ERROR_CODE.FTP_UNSUPPORTED_FILE_TYPE, `Transfer not supported for file type='${fileInfo.type}'`);
        }
    }

    public async transfer(
        requester: IRequester,
        sourceServerId: string,
        destinationServerId: string,
        transferMapping: Record<string, string>,
    ) : Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, sourceServerId);
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, destinationServerId);

        const userState = this.usersStates.get(requester.id);

        if (userState) {
            const sourceClient = this.getClient(requester, sourceServerId);
            const destinationClient = this.getClient(requester, destinationServerId);

            userState.transferCanceled = false;

            for (const sourceFilePath of Object.keys(transferMapping)) {
                try {
                    if (!userState.transferCanceled) {
                        await this.transferFile(requester, userState, sourceClient, destinationClient, sourceFilePath, transferMapping[sourceFilePath]);
                    }
                } catch (e) {
                    logger.warn(`Error caught on file transfer: ${(e as any)?.code}`);
                }
            }

            _.forEach(userState.sendEventCallbacks, (cb) => {
                cb(userState.transferCanceled ? EVENT_TYPE.TRANSFER_CANCELED : EVENT_TYPE.TRANSFER_COMPLETED, { serverId: sourceServerId });
            });
        } else {
            // Should never happen, if userState is undefined prepareTransfer step would have already throw
            throw new BrigError(BRIG_ERROR_CODE.FTP_NO_STATE, `No state registered for user=${requester.id}`, {
                publicMessage: 'Internal error, cannot transfer',
            });
        }
    }

    public async cancelTransfer(requester: IRequester, serverId: string): Promise<void> {
        await this.ftpServersAuthorizationsEnforcer.assertCanManageServerById(requester, serverId);
        const userState = this.usersStates.get(requester.id);
        if (userState) {
            userState.transferCanceled = true;
            if (userState.stream) {
                userState.stream.destroy();
            }
        }
    }

    private async findFileInfoInWorkingDir(client: FtpClient, name: string): Promise<IFileInfo> {
        const list = await client.list();
        const fileInfo = list.find(f => f.name === name);
        if (!fileInfo) {
            throw new BrigError(BRIG_ERROR_CODE.FTP_PATH_DOES_NOT_EXIST, `No file or directory '${name}' exist in working directory`);
        }
        return fileInfo;
    }

    private async findFileInfoAtPath(client: FtpClient, name: string, pathToLookIn: string): Promise<IFileInfo> {
        const list = await client.list(pathToLookIn);
        const fileInfo = list.find(f => f.name === name);
        if (!fileInfo) {
            throw new BrigError(BRIG_ERROR_CODE.FTP_PATH_DOES_NOT_EXIST, `No file or directory '${name}' exist at path='${pathToLookIn}'`);
        }
        return fileInfo;
    }

    private async buildRecursiveTransferMappingAndEnsureDirs(
        requester: IRequester,
        sourceClient: FtpClient,
        destinationClient: FtpClient,
        sourceAbsoluteDirPath: string,
        destinationAbsoluteDirPath: string,
    ): Promise<Record<string, string>> {
        await sourceClient.cd(sourceAbsoluteDirPath);
        await destinationClient.ensureDirAndMoveIn(destinationAbsoluteDirPath);

        let childrenTransferMapping: Record<string, string> = {};

        const children = await sourceClient.list();

        for (const child of children) {
            const childSourcePath = path.join(sourceAbsoluteDirPath, child.name);
            const childDestinationPath = path.join(destinationAbsoluteDirPath, child.name);
            if (child.type === FileType.File) {
                childrenTransferMapping[childSourcePath] = childDestinationPath;
            } else if (child.type === FileType.Directory) {
                childrenTransferMapping = {
                    ...childrenTransferMapping,
                    ...(await this.buildRecursiveTransferMappingAndEnsureDirs(requester, sourceClient, destinationClient, childSourcePath, childDestinationPath)),
                };
                await sourceClient.cd(sourceAbsoluteDirPath);
                await destinationClient.cd(destinationAbsoluteDirPath);
            }
        }

        return childrenTransferMapping;
    }

    private async transferFile(
        requester: IRequester,
        userState: IUserConnectionsState,
        sourceClient: FtpClient,
        destinationClient: FtpClient,
        sourceFilePath: string,
        destinationFilePath: string,
    ): Promise<void> {
        const ptStream = new PassThrough();
        ptStream.on('error', (err: Error) => {
            userState.stream = undefined;
            throw new BrigError(BRIG_ERROR_CODE.STREAM_CLOSED_WITH_ERROR, err.message);
        });
        ptStream.on('close', () => {
            userState.stream = undefined;
            logger.debug('Stream closed');
        });
        userState.stream = ptStream;

        const splitSourceFilePath = sourceFilePath.split('/');
        const fileName = splitSourceFilePath.pop();
        const directory = splitSourceFilePath.join('/');
        const fileInfo = await this.findFileInfoAtPath(sourceClient, fileName || '', directory);

        await Promise.all([
            sourceClient.download(ptStream, sourceFilePath, fileInfo),
            destinationClient.upload(ptStream, destinationFilePath),
        ]);
        
        ptStream.end();
    }

    private unsetClient(requester: IRequester, serverId: string): void {
        const userState = this.usersStates.get(requester.id);
        if (userState) {
            delete userState.clients[serverId];
        }
    }

    private getClient(requester: IRequester, serverId: string): FtpClient {
        const userState = this.usersStates.get(requester.id);
        if (userState && userState.clients[serverId]) {
            return userState.clients[serverId];
        }
        throw new BrigError(BRIG_ERROR_CODE.FTP_NOT_LOGGED_IN, `Client not registered for user=${requester.id}`, {
            publicMessage: 'You are not connected to this FTP server, please connect first',
        });
    }
}
