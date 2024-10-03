import * as ftp from 'basic-ftp';
import { FileInfo, FTPError } from 'basic-ftp';
import * as fpa from 'f-promise-async';
import _ from 'lodash';
import { LRUCache } from 'lru-cache';
import { PassThrough } from 'stream';

import { EVENT_TYPE, SendEventCallback } from '../../api/utils';
import { logger } from '../../logger';
import { BRIG_ERROR_CODE, BrigError, isTLSError } from '../../utils/error';
import { IFtpServerModel } from '../ftpServers';
import { IFileInfo } from './FileInfoTypes';

interface IFtpClientDependencies {
    ftpServer: IFtpServerModel;
    password: string;
}

export class FtpClient {
    public readonly ftpServer: IFtpServerModel;
    private readonly password: string;
    private rejectUnauthorized: boolean;
    private readonly basicClient: ftp.Client;
    private readonly funnel: fpa.Funnel;
    private readonly sendEventCallbacks: Record<string, SendEventCallback>;
    private readonly fileInfoCache: LRUCache<string, IFileInfo>;
    private lastPath: string | undefined;

    constructor(deps: IFtpClientDependencies) {
        this.ftpServer = deps.ftpServer;
        this.password = deps.password;
        this.rejectUnauthorized = true;
        this.basicClient = new ftp.Client();
        this.funnel = fpa.funnel(1);
        this.sendEventCallbacks = {};
        this.fileInfoCache = new LRUCache<string, IFileInfo>({ max: 32 });
    }

    private static mapFtpFileInfoToFileInfo(ftpFileInfo: FileInfo): IFileInfo {
        return {
            name: ftpFileInfo.name,
            type: ftpFileInfo.type,
            size: ftpFileInfo.size,
        };
    }

    // TODO: ask user before switching to rejectUnauthorized=false
    public async connect(client: ftp.Client = this.basicClient): Promise<void> {
        try {
            await client.access({
                host: this.ftpServer.host,
                port: this.ftpServer.port,
                user: this.ftpServer.username,
                password: this.password,
                ...(this.ftpServer.secure ? {
                    secure: true,
                    secureOptions: {
                        rejectUnauthorized: this.rejectUnauthorized,
                    },
                } : {
                    secure: false,
                }),
            });
        } catch (e: unknown) {
            if (e instanceof Error) {
                if (e instanceof FTPError && e.code === 530) {
                    throw new BrigError(BRIG_ERROR_CODE.FTP_INVALID_CREDENTIALS, e.message);
                }
                if (isTLSError(e)) {
                    if (e.code.match(/UNABLE_TO_VERIFY_LEAF_SIGNATURE/)) {
                        logger.warn('Unable to verify leaf signature');
                    } else if (e.code.match(/SELF_SIGNED_CERT/)) {
                        logger.warn('Self signed certificate');
                    }
                    this.rejectUnauthorized = false;
                    return await this.connect();
                }
                throw new BrigError(BRIG_ERROR_CODE.FTP_UNKNOWN_ERROR, e.message);
            }
            throw new BrigError(BRIG_ERROR_CODE.FTP_UNKNOWN_ERROR, String(e));
        }
    }

    public async disconnect(): Promise<void> {
        this.basicClient.close();
    }

    public async list(path?: string): Promise<IFileInfo[]> {
        return (await this.enqueueAction(() => this.basicClient.list(path))).map(FtpClient.mapFtpFileInfoToFileInfo);
    }

    public async pwd(): Promise<string> {
        return this.enqueueAction(() => this.basicClient.pwd());
    }

    public async cd(path: string): Promise<void> {
        await this.enqueueAction(() => this.basicClient.cd(path));
        this.lastPath = path;
    }

    public async ensureDirAndMoveIn(path: string): Promise<void> {
        await this.enqueueAction(() => this.basicClient.ensureDir(path));
    }

    public async deleteFile(path: string): Promise<void> {
        await this.enqueueAction(() => this.basicClient.remove(path));
    }

    public async deleteDir(path: string): Promise<void> {
        await this.enqueueAction(() => this.basicClient.removeDir(path));
    }

    public async download(ptStream: PassThrough, filePath: string, fileInfo: IFileInfo): Promise<void> {
        this.fileInfoCache.set(filePath, fileInfo);
        const transferClient = new ftp.Client();
        await this.connect(transferClient);
        await this.trackProgress(transferClient);
        await transferClient.downloadTo(ptStream, filePath);
        transferClient.close();
    }

    public async upload(ptStream: PassThrough, filePath: string): Promise<void> {
        const transferClient = new ftp.Client();
        await this.connect(transferClient);
        await transferClient.uploadFrom(ptStream, filePath);
        transferClient.close();
    }

    public async trackProgress(client: ftp.Client): Promise<void> {
        client.trackProgress((info) => {
            if (info.type === 'download') {
                let progress: number | undefined;
                const file = this.fileInfoCache.get(info.name);
                if (file) {
                    progress = (info.bytes / file.size) * 100;
                }
                _.forEach(this.sendEventCallbacks, (cb) => {
                    cb(EVENT_TYPE.PROGRESS, _.omitBy({
                        serverId: this.ftpServer.id,
                        path: info.name,
                        type: info.type,
                        bytes: info.bytes,
                        progress,
                    }, _.isUndefined));
                });
            }
        });
    }

    public registerSendEventCallback(id: string, callback: SendEventCallback): void {
        this.sendEventCallbacks[id] = callback;
    }

    public unregisterSendEventCallback(id: string): void {
        delete this.sendEventCallbacks[id];
    }

    private async enqueueAction<T>(fn: () => T | Promise<T>): Promise<T> {
        return this.funnel(() => this.wrapCall(fn));
    }

    private async wrapCall<T>(fn: () => T | Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (e: unknown) {
            if (e instanceof Error) {
                if (e.message.match(/Client is closed/)) {
                    logger.debug('Client disconnected, reconnecting...');
                    await this.connect();
                    await this.basicClient.cd(this.lastPath ?? this.ftpServer.lastPath);
                    return this.wrapCall(fn);
                }
                throw new BrigError(BRIG_ERROR_CODE.FTP_UNKNOWN_ERROR, e.message);
            }
            throw new BrigError(BRIG_ERROR_CODE.FTP_UNKNOWN_ERROR, String(e));
        }
    }
}
