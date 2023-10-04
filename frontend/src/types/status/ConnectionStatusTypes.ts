import { IFileInfo } from '../ftp/FileInfoTypes';

export enum CONNECTION_STATUS {
    CONNECTED = 'Connected',
    CONNECTING = 'Connecting',
    DISCONNECTED = 'Disconnected',
}

export interface IServerConnection {
    id: string;
    status: CONNECTION_STATUS.CONNECTED | CONNECTION_STATUS.CONNECTING;
    workingDir?: string;
    fileList: IFileInfo[];
}
