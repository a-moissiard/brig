interface IFtpServerBaseModel {
    host: string;
    port: number;
    username: string;
}

export type IFtpServerCreateModel = IFtpServerBaseModel;
export type IFtpServerUpdateModel = Partial<IFtpServerBaseModel>;

export interface IFtpServerModel extends IFtpServerBaseModel {
    id: string;
}