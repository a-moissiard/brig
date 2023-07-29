export interface IUserAuthTokenInfoModel {
    tokenId: string;
    expirationDate: number;
}
export interface IUserAuthTokensModel {
    userId: string;
    activeRefreshTokenInfos: IUserAuthTokenInfoModel[];
    revokedRefreshTokenInfos: IUserAuthTokenInfoModel[];
}
