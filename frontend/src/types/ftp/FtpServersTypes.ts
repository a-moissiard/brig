import { IFileInfo } from './FileInfoTypes';

interface IFtpServerBase {
    alias: string;
    host: string;
    port: number;
    username: string;
}

export type IFtpServerCreate = IFtpServerBase;
export type IFtpServerUpdate = Partial<IFtpServerBase>;

export interface IFtpServer extends IFtpServerBase {
    id: string;
    ownerId: string;
}

export interface IFtpServerConnectionStateModel {
    server: IFtpServer;
    workingDir: string;
    files: IFileInfo[];
}

export interface ITransferActivity {
    sourceServerId: string;
    target: string;
    pending: Record<string, string>;
    current: Record<string, string>;
    success: Record<string, string>;
    failed: Record<string, string>;
}
