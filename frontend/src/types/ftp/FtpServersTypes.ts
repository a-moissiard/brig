import { IFileInfo } from './FileInfoTypes';

export interface IFtpServerBase {
    alias: string;
    host: string;
    port: number;
    username: string;
    secure: boolean;
}

export interface IFtpServer extends IFtpServerBase {
    id: string;
    ownerId: string;
}

export interface IFtpConnectedServerModel {
    server: IFtpServer;
    workingDir: string;
    files: IFileInfo[];
}

export interface IFtpServerSlotsModel {
    slotOne?: IFtpConnectedServerModel;
    slotTwo?: IFtpConnectedServerModel;
}

export type IServerSlot = 'slotOne' | 'slotTwo';

export interface ITransferActivity {
    sourceServerId: string;
    target: string;
    pending: Record<string, string>;
    current: Record<string, string>;
    success: Record<string, string>;
    failed: Record<string, string>;
}
