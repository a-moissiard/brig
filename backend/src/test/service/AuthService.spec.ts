import 'dotenv/config';
import * as chai from 'chai';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

import { logger } from '../../lib/logger';
import { AuthService } from '../../lib/service/auth';
import { UserAuthTokensDao } from '../../lib/service/auth/UserAuthTokensDao';
import { UsersAuthorizationsEnforcer, UsersDao, UsersService } from '../../lib/service/users';
import { BRIG_ERROR_CODE } from '../../lib/utils/error';
import { MongoConnectionTestManager } from '../../lib/utils/mongo/MongoConnectionTestManager';
import { assertThrowsWithError } from '../../lib/utils/test';
import { testAuthConfig, testMongoConfig } from '../testConfig';

const assert = chai.assert;

logger.silent = true;

describe('AuthService', () => {
    let mongoConnectionManager: MongoConnectionTestManager;
    let usersDao: UsersDao;
    let userAuthTokensDao: UserAuthTokensDao;
    let usersAuthorizationsEnforcer: UsersAuthorizationsEnforcer;
    let usersService: UsersService;
    let authService: AuthService;

    const username1 = 'username1';
    const password1 = 'password1';
    const username2 = 'username2';
    const password2 = 'password2';

    before(async () => {
        mongoConnectionManager = new MongoConnectionTestManager(testMongoConfig);
        await mongoConnectionManager.init();
        usersDao = new UsersDao({ mongoConnectionManager });
        userAuthTokensDao = new UserAuthTokensDao({ mongoConnectionManager });
        usersAuthorizationsEnforcer = new UsersAuthorizationsEnforcer({ usersDao });
        usersService = new UsersService({ usersAuthorizationsEnforcer, usersDao });
        authService = new AuthService({ authConfig: testAuthConfig, usersService, userAuthTokensDao });
        await usersDao.init();
        await userAuthTokensDao.init();
    });

    after(async () => {
        await mongoConnectionManager.close();
    });

    afterEach(async ()  => {
        await mongoConnectionManager.cleanDb();
    });

    describe('Register', () => {
        it('should register a user', async () => {
            const user = await authService.register(username1, password1);
            assert.equal(user.username, username1);
            assert.notEqual(user.hash, password1);
            assert.equal(user.admin, false);
        });

        it('should throw when registering a user with a username that already exists', async () => {
            await authService.register(username1, password1);
            await assertThrowsWithError(() => authService.register(username1, password2), BRIG_ERROR_CODE.DB_DUPLICATE);
        });

        it('should create different hashes if two users register with the same password', async () => {
            const user1 = await authService.register(username1, password1);
            const user2 = await authService.register(username2, password1);

            assert.notEqual(user1.hash, user2.hash);
        });
    });

    describe('Check credentials', () => {
        it('should return user if credentials are correct', async () => {
            await authService.register(username1, password1);
            const user = await authService.checkCredentials(username1, password1);
            assert.isDefined(user);
            assert.equal(user?.username, username1);
        });

        it('should not return user if password is incorrect', async () => {
            await authService.register(username1, password1);
            const user = await authService.checkCredentials(username1, password2);
            assert.isUndefined(user);
        });

        it('should throw if username doesn\'t match an existing user', async () => {
            await authService.register(username1, password1);
            await assertThrowsWithError(() => authService.checkCredentials(username2, password1), BRIG_ERROR_CODE.DB_NOT_FOUND);
        });
    });

    describe('Generate tokens',  () => {
        it('should return two valid tokens, an accessToken and a refreshToken', async () => {
            const { accessToken, refreshToken } = await authService.generateTokens('id', username1);

            const accessTokenPayload = jwt.verify(accessToken, testAuthConfig.tokens.accessToken.signingSecret);
            assert.equal(typeof accessTokenPayload, 'object');
            assert.equal((accessTokenPayload as JwtPayload).id, 'id');
            assert.equal((accessTokenPayload as JwtPayload).username, 'username1');
            assert.isDefined((accessTokenPayload as JwtPayload).jti);

            const refreshTokenPayload = jwt.verify(refreshToken, testAuthConfig.tokens.refreshToken.signingSecret);
            assert.equal(typeof refreshTokenPayload, 'object');
            assert.equal((refreshTokenPayload as JwtPayload).id, 'id');
            assert.isDefined((refreshTokenPayload as JwtPayload).jti);
        });
    });

    describe('Check refresh token is active', () => {
        it('should throw if no tokens are stored for this user', async () => {
            await assertThrowsWithError(() => authService.assertRefreshTokenIsActive('id', 'whatever'), BRIG_ERROR_CODE.DB_NOT_FOUND);
        });

        it('should not throw if refresh token is active', async () => {
            const { refreshToken } = await authService.generateTokens('id', username1);
            const refreshTokenPayload = jwt.verify(refreshToken, testAuthConfig.tokens.refreshToken.signingSecret);
            await authService.assertRefreshTokenIsActive('id', (refreshTokenPayload as JwtPayload).jti!);
        });

        it('should throw if refresh token is revoked', async () => {
            const { refreshToken } = await authService.generateTokens('id', username1);
            const refreshTokenPayload = jwt.verify(refreshToken, testAuthConfig.tokens.refreshToken.signingSecret);
            await authService.revokeRefreshToken('id', (refreshTokenPayload as JwtPayload).jti!);
            await assertThrowsWithError(() => authService.assertRefreshTokenIsActive('id', (refreshTokenPayload as JwtPayload).jti!), BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_ALREADY_REVOKED);
        });

        it('should revoke all active refresh tokens if refresh token reuse is detected', async () => {
            const { refreshToken: refreshToken1 } = await authService.generateTokens('id', username1);
            const refreshToken1Payload = jwt.verify(refreshToken1, testAuthConfig.tokens.refreshToken.signingSecret);
            const { refreshToken: refreshToken2 } = await authService.generateTokens('id', username1);
            const refreshToken2Payload = jwt.verify(refreshToken2, testAuthConfig.tokens.refreshToken.signingSecret);
            const { refreshToken: refreshToken3 } = await authService.generateTokens('id', username1);
            const refreshToken3Payload = jwt.verify(refreshToken3, testAuthConfig.tokens.refreshToken.signingSecret);

            await authService.revokeRefreshToken('id', (refreshToken1Payload as JwtPayload).jti!);
            // The below check trigger token reuse detection mechanism, hence all tokens are revoked
            await assertThrowsWithError(() => authService.assertRefreshTokenIsActive('id', (refreshToken1Payload as JwtPayload).jti!), BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_ALREADY_REVOKED);

            // The following check will throw because all tokens have been revoked
            await assertThrowsWithError(() => authService.assertRefreshTokenIsActive('id', (refreshToken2Payload as JwtPayload).jti!), BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_ALREADY_REVOKED);
            await assertThrowsWithError(() => authService.assertRefreshTokenIsActive('id', (refreshToken3Payload as JwtPayload).jti!), BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_ALREADY_REVOKED);
        });
    });
});
