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

export interface IFtpServerConnectionStateModel {
    server: IFtpServerModel;
    workingDir: string;
    files: IFileInfo[];
}
