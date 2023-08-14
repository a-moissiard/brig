import 'dotenv/config';
import * as chai from 'chai';

import { logger } from '../../lib/logger';
import { IUserModel, IUserWithHashModel, UsersDao } from '../../lib/service/users';
import { BRIG_ERROR_CODE } from '../../lib/utils/error';
import { MongoConnectionTestManager } from '../../lib/utils/mongo/MongoConnectionTestManager';
import { assertThrowsWithError } from '../../lib/utils/test';
import { testMongoConfig } from '../testConfig';

const assert = chai.assert;

logger.silent = true;

describe('UsersDao', () => {
    let mongoConnectionManager: MongoConnectionTestManager;
    let usersDao: UsersDao;

    before(async () => {
        mongoConnectionManager = new MongoConnectionTestManager(testMongoConfig);
        await mongoConnectionManager.init();
        usersDao = new UsersDao({ mongoConnectionManager });
        await usersDao.init();
    });

    after(async () => {
        await mongoConnectionManager.close();
    });

    afterEach(async ()  => {
        await mongoConnectionManager.cleanDb();
    });

    describe('Users CRUD', function () {
        const user1: IUserWithHashModel = {
            id: 'id_1',
            username: 'username_1',
            hash: 'hash_1',
            admin: true,
        };
        const user2: IUserWithHashModel = {
            id: 'id_2',
            username: 'username_2',
            hash: 'hash_2',
            admin: false,
        };
        describe('Create user', () => {
            it('should create a user', async () => {
                const createdUser = await usersDao.createUser(user1);
                assert.deepEqual(createdUser, user1);
            });

            it('should filter silly properties when creating a user', async () => {
                const sillyUser1: any = {
                    ...user1,
                    hello: '1021',
                };
                const createdUser = await usersDao.createUser(sillyUser1);
                assert.deepEqual(createdUser, user1);
            });

            it('should throw when creating a duplicate user', async () => {
                await usersDao.createUser(user1);
                await assertThrowsWithError(() => usersDao.createUser(user1), BRIG_ERROR_CODE.DB_DUPLICATE);
            });
        });

        describe('Get user', () => {
            it('should get a user', async () => {
                await usersDao.createUser(user1);
                const user = await usersDao.getUser(user1.id);
                const expected: IUserModel = {
                    id: user1.id,
                    username: user1.username,
                    admin: user1.admin,
                };
                assert.deepEqual(user, expected);
            });

            it('should throw when getting a user that does not exist', async () => {
                await assertThrowsWithError(() => usersDao.getUserWithHashByUsername('id'), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });

        describe('Get user with hash by username', () => {
            it('should get a user by username', async () => {
                await usersDao.createUser(user1);
                const user = await usersDao.getUserWithHashByUsername(user1.username);
                assert.deepEqual(user, user1);
            });

            it('should throw when getting a user that does not exist', async () => {
                await assertThrowsWithError(() => usersDao.getUserWithHashByUsername('username'), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });

        describe('Delete user', () => {
            it('should throw when deleting a user that does not exist', async () => {
                await assertThrowsWithError(() => usersDao.deleteUser(user1.id), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });

            it('should delete a user', async () => {
                await usersDao.createUser(user1);
                await usersDao.deleteUser(user1.id);
                await assertThrowsWithError(() => usersDao.getUserWithHashByUsername(user1.username), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });
    });
});
