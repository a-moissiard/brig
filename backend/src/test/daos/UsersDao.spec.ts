import 'dotenv/config';
import * as chai from 'chai';
import * as _ from 'lodash';

import { logger } from '../../lib/logger';
import { IUserModel, UsersDao } from '../../lib/service/users';
import { BRIG_ERROR_CODE } from '../../lib/utils/error';
import { MongoConnectionTestManager } from '../../lib/utils/mongo/MongoConnectionTestManager';
import { assertThrowsWithError } from '../../lib/utils/test';
import { testConfig } from '../testConfig';

const assert = chai.assert;

logger.silent = true;

describe('UsersDao', () => {
    let mongoConnectionManager: MongoConnectionTestManager;
    let usersDao: UsersDao;

    before(async () => {
        mongoConnectionManager = new MongoConnectionTestManager(testConfig);
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
        const user1: IUserModel = {
            id: 'id_1',
            username: 'username_1',
            hash: 'hash_1',
        };
        const user2: IUserModel = {
            id: 'id_2',
            username: 'username_2',
            hash: 'hash_2',
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
            it('should get a user by username', async () => {
                await usersDao.createUser(user1);
                const user = await usersDao.getUserByUsername(user1.username);
                assert.deepEqual(user, user1);
            });

            it('should throw when getting a user that does not exist', async () => {
                await assertThrowsWithError(() => usersDao.getUserByUsername('username'), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });

        describe('List light users', () => {
            it('should return empty list if there are no users', async () => {
                const list = await usersDao.listUsersLight();
                assert.deepEqual(list, []);
            });

            it('should return list of users', async () => {
                await usersDao.createUser(user1);
                await usersDao.createUser(user2);
                const list = await usersDao.listUsersLight();
                assert.equal(list.length, 2);
                assert.deepEqual(list[0], _.pick(user1, ['id', 'username']));
                assert.deepEqual(list[1], _.pick(user2, ['id', 'username']));
            });
        });

        describe('Delete user', () => {
            it('should throw when deleting a user that does not exist', async () => {
                await assertThrowsWithError(() => usersDao.deleteUser(user1.id), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });

            it('should delete a user', async () => {
                await usersDao.createUser(user1);
                await usersDao.deleteUser(user1.id);
                await assertThrowsWithError(() => usersDao.getUserByUsername(user1.username), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });
    });
});
