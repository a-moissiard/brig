import 'dotenv/config';
import * as chai from 'chai';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

import { logger } from '../../lib/logger';
import { AuthService } from '../../lib/service/auth';
import { AuthorizationsEnforcer } from '../../lib/service/authorizations';
import { UsersDao, UsersService } from '../../lib/service/users';
import { BRIG_ERROR_CODE } from '../../lib/utils/error';
import { MongoConnectionTestManager } from '../../lib/utils/mongo/MongoConnectionTestManager';
import { assertThrowsWithError } from '../../lib/utils/test';
import { testAuthConfig, testMongoConfig } from '../testConfig';

const assert = chai.assert;

logger.silent = true;

describe('AuthService', () => {
    let mongoConnectionManager: MongoConnectionTestManager;
    let usersDao: UsersDao;
    let authorizationsEnforcer: AuthorizationsEnforcer;
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
        authorizationsEnforcer = new AuthorizationsEnforcer({ usersDao });
        usersService = new UsersService({ authorizationsEnforcer, usersDao });
        authService = new AuthService({ authConfig: testAuthConfig, usersService });
        await usersDao.init();
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

    describe('Create JWT',  () => {
        it('should return a valid JWT', async () => {
            const token = await authService.createJwt({ id: 'id', username: username1 });
            const payload = jwt.verify(token, testAuthConfig.jwt.jwtSigningSecret);
            assert.equal(typeof payload, 'object');
            assert.equal((payload as JwtPayload).id, 'id');
            assert.equal((payload as JwtPayload).username, 'username1');
            assert.isDefined((payload as JwtPayload).jti);
        });
    });

    describe('Invalidate JWT', () => {
        it('should invalidate a JWT', async () => {
            const token = await authService.createJwt({ id: 'id', username: username1 });
            const payload = jwt.verify(token, testAuthConfig.jwt.jwtSigningSecret) as JwtPayload;
            authService.invalidateJwt(payload.jti!, payload.exp!);
            const isJwtInvalidated = authService.isJwtInvalidated(payload.jti!);
            assert.equal(isJwtInvalidated, true);
        });
    });
});
