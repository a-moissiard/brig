import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import ms from 'ms';
import * as schedule from 'node-schedule';
import * as uuid from 'uuid';

import { IBrigAuthConfig } from '../../config';
import { logger } from '../../logger';
import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';
import { IUserModel, IUserWithHashModel, UsersService } from '../users';
import { IEncodedAuthTokens } from './AuthTokensTypes';
import { UserAuthTokensDao } from './UserAuthTokensDao';

interface IAuthServiceDependencies {
    authConfig: IBrigAuthConfig;
    usersService: UsersService;
    userAuthTokensDao: UserAuthTokensDao;
}

export class AuthService {
    private readonly authConfig: IBrigAuthConfig;
    private readonly usersService: UsersService;
    private readonly userAuthTokensDao: UserAuthTokensDao;

    constructor(deps: IAuthServiceDependencies) {
        this.authConfig = deps.authConfig;
        this.usersService = deps.usersService;
        this.userAuthTokensDao = deps.userAuthTokensDao;
    }

    public init(): void {
        schedule.scheduleJob('* * * * *', this.cleanExpiredTokens.bind(this));
    }

    public async shutdown(): Promise<void> {
        return schedule.gracefulShutdown();
    }

    public async register(username: string, password: string): Promise<IUserWithHashModel> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        return this.usersService.createUser({
            username,
            hash,
            admin: false,
        });
    }

    public async checkCredentials(username: string, password: string): Promise<IUserModel | undefined> {
        const user = await this.usersService.getUserWithHashByUsername(username);
        return (await bcrypt.compare(password, user.hash)) ? user : undefined;
    }

    public async generateTokens(userId: string, _username?: string): Promise<IEncodedAuthTokens> {
        let username = _username;
        if (!username) {
            username = (await this.usersService.getUser(userId)).username;
        }

        const { accessToken: accessTokenConfig, refreshToken: refreshTokenConfig } = this.authConfig.tokens;

        const accessTokenId = uuid.v4();
        const accessToken = await this.generateJwt({ id: userId, username }, accessTokenId, accessTokenConfig.signingSecret, accessTokenConfig.validityPeriod);

        const refreshTokenId = uuid.v4();
        const refreshToken = await this.generateJwt({ id: userId }, refreshTokenId, refreshTokenConfig.signingSecret, refreshTokenConfig.validityPeriod);
        await this.userAuthTokensDao.storeRefreshTokenInfo(userId, {
            tokenId: refreshTokenId,
            expirationDate: Date.now() + ms(refreshTokenConfig.validityPeriod),
        });

        return {
            accessToken,
            refreshToken,
        };
    }
    
    public async assertRefreshTokenIsActive(userId: string, tokenId: string): Promise<void> {
        const userAuthTokens = await this.userAuthTokensDao.getUserAuthTokensDocument(userId);
        if (userAuthTokens.revokedRefreshTokenInfos.find(tokenInfo => tokenInfo.tokenId === tokenId)) {
            // Refresh token reuse detected
            await this.invalidateAllRefreshTokensOfUser(userId);
            throw new BrigError(BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_ALREADY_REVOKED, 'Refresh token already revoked');
        } else if (!userAuthTokens.activeRefreshTokenInfos.find(tokenInfo => tokenInfo.tokenId === tokenId)) {
            // Refresh token probably expired and cleaned by periodical clean
            throw new BrigError(BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_NOT_ACTIVE, 'Refresh token not active');
        }
    }

    public async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
        await this.userAuthTokensDao.revokeRefreshToken(userId, tokenId);
    }

    private async generateJwt(payload: string | Buffer | object, tokenId: string, signingSecret: string, validityPeriod: string): Promise<string> {
        return jwt.sign(payload, signingSecret, {
            expiresIn: validityPeriod,
            jwtid: tokenId,
        });
    }

    private async invalidateAllRefreshTokensOfUser(userId: string): Promise<void> {
        logger.warn(`Refresh token reuse detected, revoking all refresh tokens of user ${userId}`);
        const userAuthTokens = await this.userAuthTokensDao.getUserAuthTokensDocument(userId);
        for (const activeRefreshToken of userAuthTokens.activeRefreshTokenInfos) {
            await this.userAuthTokensDao.revokeRefreshToken(userId, activeRefreshToken.tokenId);
            logger.info(`Token ${activeRefreshToken} of user ${userId} revoked`);
        }
    }

    private async cleanExpiredTokens(): Promise<void> {
        try {
            await this.userAuthTokensDao.cleanExpiredTokens();
        } catch (e) {
            logger.warn('Error while cleaning expired refresh tokens: ' + (e as Error).stack);
        }
    }
}
