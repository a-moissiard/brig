import { IFtpConnectedServerModel } from '../ftp';

export enum CONNECTION_STATUS {
    CONNECTED = 'Connected',
    CONNECTING = 'Connecting',
    DISCONNECTED = 'Disconnected',
}

export interface IFtpServerConnectionState extends IFtpConnectedServerModel {
    status: CONNECTION_STATUS.CONNECTED | CONNECTION_STATUS.CONNECTING;
}
