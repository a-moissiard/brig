import * as ftp from 'basic-ftp';
import { FileInfo, FTPError } from 'basic-ftp';
import { PassThrough } from 'stream';

import { logger } from '../../logger';
import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';
import { IFtpServerModel } from '../ftpServers';
import { IFileInfo } from './FileInfoTypes';

interface IFtpClientDependencies {
    ftpServer: IFtpServerModel;
}

export class FtpClient {
    private readonly ftpServer: IFtpServerModel;
    private readonly basicFtpClient: ftp.Client;

    constructor(deps: IFtpClientDependencies) {
        this.ftpServer = deps.ftpServer;
        this.basicFtpClient = new ftp.Client();
    }

    private static mapFtpFileInfoToFileInfo(ftpFileInfo: FileInfo): IFileInfo {
        return {
            name: ftpFileInfo.name,
            type: ftpFileInfo.type,
            size: ftpFileInfo.size,
        };
    }

    // TODO: ask user before switching to rejectUnauthorized=false
    public async connect(password: string, secure: boolean = true): Promise<void> {
        try {
            await this.wrapFtpClientCall(() => this.basicFtpClient.access({
                host: this.ftpServer.host,
                port: this.ftpServer.port,
                user: this.ftpServer.username,
                password,
                secure: true,
                secureOptions: {
                    rejectUnauthorized: secure,
                },
            }));
        } catch (e: any) {
            if (typeof e?.code === 'string' && (e.code as string).match(/UNABLE_TO_VERIFY_LEAF_SIGNATURE/)) {
                logger.warn('Unable to verify leaf signature');
                return await this.connect(password, false);
            } else if (typeof e?.code === 'string' && (e.code as string).match(/SELF_SIGNED_CERT/)) {
                logger.warn('Self signed certificate');
                return await this.connect(password, false);
            }
            throw e;
        }
    }

    public async disconnect(): Promise<void> {
        await this.wrapFtpClientCall(() => this.basicFtpClient.close());
    }

    public async list(): Promise<IFileInfo[]> {
        return (await this.wrapFtpClientCall(() => this.basicFtpClient.list())).map(FtpClient.mapFtpFileInfoToFileInfo);
    }

    public async pwd(): Promise<string> {
        return this.wrapFtpClientCall(() => this.basicFtpClient.pwd());
    }

    public async cd(path: string): Promise<void> {
        await this.wrapFtpClientCall(() => this.basicFtpClient.cd(path));
    }

    public async createDir(path: string): Promise<void> {
        await this.wrapFtpClientCall(() => this.basicFtpClient.ensureDir(path));
    }

    public async download(ptStream: PassThrough, path: string): Promise<void> {
        await this.wrapFtpClientCall(() => this.basicFtpClient.downloadTo(ptStream, path));
    }

    public async upload(ptStream: PassThrough, path: string): Promise<void> {
        await this.wrapFtpClientCall(() => this.basicFtpClient.uploadFrom(ptStream, path));
    }

    private async wrapFtpClientCall<T>(fn: () => T | Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (e: any) {
            if (e instanceof FTPError) {
                switch (e.code) {
                    case 530:
                        throw new BrigError(BRIG_ERROR_CODE.FTP_INVALID_CREDENTIALS, e.message);
                    case 550:
                        throw new BrigError(BRIG_ERROR_CODE.FTP_FAILED_TO_CHANGE_DIRECTORY, e.message);
                    default:
                        throw new BrigError(BRIG_ERROR_CODE.FTP_UNKNOWN_ERROR, e.message);
                }
            } else if (e?.code !== undefined && e.code === '0') {
                throw new BrigError(BRIG_ERROR_CODE.FTP_UNKNOWN_ERROR, (e as Error)?.message);
            } else {
                throw e;
            }
        }
    }
}
