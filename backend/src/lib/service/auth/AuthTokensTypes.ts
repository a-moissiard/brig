interface IJwtTokenInfo {
    jti: string;
    iat: number;
    exp: number;
}

interface IAccessTokenInfo {
    id: string;
    username: string;
}

interface IRefreshTokenInfo {
    id: string;
}

export type IAccessToken = IAccessTokenInfo & IJwtTokenInfo;

export type IRefreshToken = IRefreshTokenInfo & IJwtTokenInfo;

export interface IEncodedAuthTokens {
    accessToken: string;
    refreshToken: string;
}
