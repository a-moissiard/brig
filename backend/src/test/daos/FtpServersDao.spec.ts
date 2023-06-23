import 'dotenv/config';
import * as chai from 'chai';

import { logger } from '../../lib/logger';
import { FtpServersDao, IFtpServerModel, IFtpServerUpdateModel } from '../../lib/service/ftpServers';
import { BRIG_ERROR_CODE } from '../../lib/utils/error';
import { MongoConnectionTestManager } from '../../lib/utils/mongo/MongoConnectionTestManager';
import { assertThrowsWithError } from '../../lib/utils/test';
import { testMongoConfig } from '../testConfig';

const assert = chai.assert;

logger.silent = true;

describe('FtpServersDao', () => {
    let mongoConnectionManager: MongoConnectionTestManager;
    let ftpServersDao: FtpServersDao;

    before(async () => {
        mongoConnectionManager = new MongoConnectionTestManager(testMongoConfig);
        await mongoConnectionManager.init();
        ftpServersDao = new FtpServersDao({ mongoConnectionManager });
        await ftpServersDao.init();
    });

    after(async () => {
        await mongoConnectionManager.close();
    });

    afterEach(async ()  => {
        await mongoConnectionManager.cleanDb();
    });

    describe('FTP servers CRUD', function () {
        const ownerId1 = 'owner_1';
        const ownerId2 = 'owner_2';
        const server1: IFtpServerModel = {
            id: 'id_1',
            host: 'host_1',
            port: 21,
            username: 'username_1',
            ownerId: ownerId1,
        };
        const server2: IFtpServerModel = {
            id: 'id_2',
            host: 'host_2',
            port: 21,
            username: 'username_2',
            ownerId: ownerId2,
        };

        describe('Create FTP server', () => {
            it('should create a server', async () => {
                const createdServer = await ftpServersDao.createServer(server1);
                assert.deepEqual(createdServer, server1);
            });

            it('should filter silly properties when creating a server', async () => {
                const sillyServer1: any = {
                    ...server1,
                    hello: '1021',
                };
                const createdServer = await ftpServersDao.createServer(sillyServer1);
                assert.deepEqual(createdServer, server1);
            });

            it('should throw when creating a duplicate server', async () => {
                await ftpServersDao.createServer(server1);
                await assertThrowsWithError(() => ftpServersDao.createServer(server1), BRIG_ERROR_CODE.DB_DUPLICATE);
            });
        });

        describe('Get FTP server', () => {
            it('should get a server', async () => {
                await ftpServersDao.createServer(server1);
                const server = await ftpServersDao.getServer(server1.id);
                assert.deepEqual(server, server1);
            });

            it('should throw when getting a server that does not exist', async () => {
                await assertThrowsWithError(() => ftpServersDao.getServer('id'), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });

        describe('Get FTP server ownerId', () => {
            it('should get the owner ID of a server', async () => {
                await ftpServersDao.createServer(server1);
                const ownerId = await ftpServersDao.getServerOwnerId(server1.id);
                assert.deepEqual(ownerId, server1.ownerId);
            });

            it('should throw when getting the owner ID of a server that does not exist', async () => {
                await assertThrowsWithError(() => ftpServersDao.getServerOwnerId('id'), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });

        describe('List FTP servers', () => {
            describe('List users servers', () => {
                it('should return empty list if there are no servers', async () => {
                    const list = await ftpServersDao.listUserServers(ownerId1);
                    assert.deepEqual(list, []);
                });

                it('should return empty list if no servers belong to user', async () => {
                    await ftpServersDao.createServer(server1);
                    const list = await ftpServersDao.listUserServers(ownerId2);
                    assert.deepEqual(list, []);
                });

                it('should return list of servers that belong to user', async () => {
                    await ftpServersDao.createServer(server1);
                    await ftpServersDao.createServer(server2);
                    const list = await ftpServersDao.listUserServers(ownerId1);
                    assert.equal(list.length, 1);
                    assert.deepEqual(list[0], server1);
                });
            });

            describe('List all servers', () => {
                it('should return empty list if there are no servers', async () => {
                    const list = await ftpServersDao.listAllServers();
                    assert.deepEqual(list, []);
                });

                it('should return list of all existing servers, regardless of ownership', async () => {
                    await ftpServersDao.createServer(server1);
                    await ftpServersDao.createServer(server2);
                    const list = await ftpServersDao.listAllServers();
                    assert.equal(list.length, 2);
                    assert.deepEqual(list[0], server1);
                    assert.deepEqual(list[1], server2);
                });
            });
        });

        describe('Update FTP server', () => {
            it('should throw when updating a server that does not exist', async () => {
                await assertThrowsWithError(() => ftpServersDao.updateServer(server1.id, {}), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });

            it('should partially update a server', async () => {
                await ftpServersDao.createServer(server1);
                const server1Update: IFtpServerUpdateModel = {
                    host: 'new_host',
                };
                const updatedServer = await ftpServersDao.updateServer(server1.id, server1Update);
                assert.deepEqual(updatedServer, {
                    ...server1,
                    ...server1Update,
                });
            });

            it('should update a server', async () => {
                await ftpServersDao.createServer(server1);
                const server1Update: IFtpServerUpdateModel = {
                    host: 'new_host',
                    port: 1021,
                    username: 'new_username',

                };
                const updatedServer = await ftpServersDao.updateServer(server1.id, server1Update);
                assert.deepEqual(updatedServer, {
                    id: server1.id,
                    ownerId: server1.ownerId,
                    ...server1Update,
                });
            });

            it('should filter silly properties when updating a server', async () => {
                await ftpServersDao.createServer(server1);
                const server1Update: any = {
                    hello: '1021',
                };
                const updatedServer = await ftpServersDao.updateServer(server1.id, server1Update);
                assert.deepEqual(updatedServer, server1);
            });

            it('should throw when updating a server with properties that break index unicity', async () => {
                const server3: IFtpServerModel = {
                    id: 'id_3',
                    host: 'host_3',
                    port: 21,
                    username: 'username_3',
                    ownerId: ownerId1,
                };
                await ftpServersDao.createServer(server1);
                await ftpServersDao.createServer(server3);
                const server1Update: IFtpServerUpdateModel = {
                    host: server3.host,
                    port: server3.port,
                    username: server3.username,
                };
                await assertThrowsWithError(() => ftpServersDao.updateServer(server1.id, server1Update), BRIG_ERROR_CODE.DB_DUPLICATE);
            });
        });

        describe('Delete FTP server', () => {
            it('should throw when deleting a server that does not exist', async () => {
                await assertThrowsWithError(() => ftpServersDao.deleteServer(server1.id), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });

            it('should delete a server', async () => {
                await ftpServersDao.createServer(server1);
                await ftpServersDao.deleteServer(server1.id);
                await assertThrowsWithError(() => ftpServersDao.getServer(server1.id), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });
    });
});
