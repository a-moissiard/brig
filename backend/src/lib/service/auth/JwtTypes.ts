interface IJwtUserInfo {
    id: string;
    username: string;
}

interface IJwtTokenInfo {
    jti: string;
    iat: number;
    exp: number;
}

export type IJwtModel = IJwtUserInfo & IJwtTokenInfo;
