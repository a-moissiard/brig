import { IFileInfo } from '../ftpUtils';

interface IFtpServerBaseModel {
    alias: string;
    host: string;
    port: number;
    username: string;
    secure: boolean;
}

export type IFtpServerCreateModel = IFtpServerBaseModel;
export type IFtpServerUpdateModel = Partial<IFtpServerBaseModel>;

export interface IFtpServerModel extends IFtpServerBaseModel {
    id: string;
    ownerId: string;
    lastPath: string;
}

interface IFtpServerConnectionStateModel {
    server: IFtpServerModel;
    workingDir: string;
    files: IFileInfo[];
}

export interface IFtpConnectedServersModel {
    slotOne?: IFtpServerConnectionStateModel;
    slotTwo?: IFtpServerConnectionStateModel;
}

export type IServerSlot = 'slotOne' | 'slotTwo';
