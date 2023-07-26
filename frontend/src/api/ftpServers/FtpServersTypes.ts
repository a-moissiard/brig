interface IFtpServerBase {
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
