import 'dotenv/config';
import * as chai from 'chai';

import { logger } from '../../lib/logger';
import { UserAuthTokensDao } from '../../lib/service/auth/UserAuthTokensDao';
import { IUserAuthTokenInfoModel } from '../../lib/service/auth/UserAuthTokensTypes';
import { BRIG_ERROR_CODE } from '../../lib/utils/error';
import { MongoConnectionTestManager } from '../../lib/utils/mongo/MongoConnectionTestManager';
import { assertThrowsWithError } from '../../lib/utils/test';
import { testMongoConfig } from '../testConfig';

const assert = chai.assert;

logger.silent = true;

describe('UserAuthTokensDao', () => {
    let mongoConnectionManager: MongoConnectionTestManager;
    let userAuthTokensDao: UserAuthTokensDao;

    before(async () => {
        mongoConnectionManager = new MongoConnectionTestManager(testMongoConfig);
        await mongoConnectionManager.init();
        userAuthTokensDao = new UserAuthTokensDao({ mongoConnectionManager });
        await userAuthTokensDao.init();
    });

    after(async () => {
        await mongoConnectionManager.close();
    });

    afterEach(async ()  => {
        await mongoConnectionManager.cleanDb();
    });

    const userId = 'userId';

    describe('Get user\'s auth tokens document', () => {
        const tokenInfo: IUserAuthTokenInfoModel = {
            tokenId: 'tokenId',
            expirationDate: Date.now() + 100_000,
        };

        it('should throw when getting a document that does not exist', async () => {
            await assertThrowsWithError(() => userAuthTokensDao.getUserAuthTokensDocument(userId), BRIG_ERROR_CODE.DB_NOT_FOUND);
        });

        it('should get the document if a refresh token has been stored for the user', async () => {
            await userAuthTokensDao.storeRefreshTokenInfo(userId, tokenInfo);
            const userAuthTokens = await userAuthTokensDao.getUserAuthTokensDocument(userId);
            assert.equal(userAuthTokens.userId, userId);
            assert.deepEqual(userAuthTokens.activeRefreshTokenInfos, [tokenInfo]);
            assert.deepEqual(userAuthTokens.revokedRefreshTokenInfos, []);
        });
    });

    describe('Revoke refresh token', () => {
        const tokenInfo1: IUserAuthTokenInfoModel = {
            tokenId: 'tokenId1',
            expirationDate: Date.now() + 100_000,
        };
        const tokenInfo2: IUserAuthTokenInfoModel = {
            tokenId: 'tokenId2',
            expirationDate: Date.now() + 100_000,
        };

        it('should throw when revoking a token if there is no entry for user', async () => {
            await assertThrowsWithError(() => userAuthTokensDao.revokeRefreshToken(userId, tokenInfo1.tokenId), BRIG_ERROR_CODE.DB_NOT_FOUND);
        });

        it('should revoke a token', async () => {
            await userAuthTokensDao.storeRefreshTokenInfo(userId, tokenInfo1);
            await userAuthTokensDao.storeRefreshTokenInfo(userId, tokenInfo2);
            const userAuthTokens = await userAuthTokensDao.revokeRefreshToken(userId, tokenInfo1.tokenId);
            assert.equal(userAuthTokens.userId, userId);
            assert.deepEqual(userAuthTokens.activeRefreshTokenInfos, [tokenInfo2]);
            assert.deepEqual(userAuthTokens.revokedRefreshTokenInfos, [tokenInfo1]);
        });
    });
});
