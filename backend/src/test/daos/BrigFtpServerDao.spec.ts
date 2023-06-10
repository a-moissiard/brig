import 'dotenv/config';
import * as chai from 'chai';

import { logger } from '../../lib/logger';
import { BrigFtpServerDao, IFtpServerModel, IFtpServerUpdateModel } from '../../lib/service';
import { BRIG_ERROR_CODE } from '../../lib/utils/error';
import { BrigMongoConnectionTestManager } from '../../lib/utils/mongo/BrigMongoConnectionTestManager';
import { assertThrowsWithError } from '../../lib/utils/test/TestUtils';
import { testConfig } from '../testConfig';

const assert = chai.assert;

logger.silent = true;

describe('BrigFtpServerDao', () => {
    let mongoConnectionManager: BrigMongoConnectionTestManager;
    let ftpServerDao: BrigFtpServerDao;

    before(async () => {
        mongoConnectionManager = new BrigMongoConnectionTestManager(testConfig);
        await mongoConnectionManager.init();
        ftpServerDao = new BrigFtpServerDao({ mongoConnectionManager });
        await ftpServerDao.init();
    });

    after(async () => {
        await mongoConnectionManager.close();
    });

    afterEach(async ()  => {
        await mongoConnectionManager.cleanDb();
    });

    describe('FTP servers CRUD', function () {
        const server1: IFtpServerModel = {
            id: 'id_1',
            host: 'host_1',
            port: 21,
            username: 'username_1',
        };
        const server2: IFtpServerModel = {
            id: 'id_2',
            host: 'host_2',
            port: 21,
            username: 'username_2',
        };

        describe('Create FTP server', () => {
            it('should create a server', async () => {
                const createdServer = await ftpServerDao.createServer(server1);
                assert.deepEqual(createdServer, server1);
            });

            it('should filter silly properties when creating a server', async () => {
                const sillyServer1: any = {
                    ...server1,
                    hello: '1021',
                };
                const createdServer = await ftpServerDao.createServer(sillyServer1);
                assert.deepEqual(createdServer, server1);
            });

            it('should throw when creating a duplicate server', async () => {
                await ftpServerDao.createServer(server1);
                await assertThrowsWithError(() => ftpServerDao.createServer(server1), BRIG_ERROR_CODE.DB_DUPLICATE);
            });
        });

        describe('Get FTP server', () => {
            it('should get a server', async () => {
                await ftpServerDao.createServer(server1);
                const server = await ftpServerDao.getServer(server1.id);
                assert.deepEqual(server, server1);
            });

            it('should throw when getting a server that does not exist', async () => {
                await assertThrowsWithError(() => ftpServerDao.getServer('id'), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });

        describe('List FTP servers', () => {
            it('should return empty list if there are no servers', async () => {
                const list = await ftpServerDao.listServers();
                assert.deepEqual(list, []);
            });

            it('should return list of servers', async () => {
                await ftpServerDao.createServer(server1);
                await ftpServerDao.createServer(server2);
                const list = await ftpServerDao.listServers();
                assert.equal(list.length, 2);
                assert.deepEqual(list[0], server1);
                assert.deepEqual(list[1], server2);
            });
        });

        describe('Update FTP server', () => {
            it('should throw when updating a server that does not exist', async () => {
                await assertThrowsWithError(() => ftpServerDao.updateServer(server1.id, {}), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });

            it('should partially update a server', async () => {
                await ftpServerDao.createServer(server1);
                const server1Update: IFtpServerUpdateModel = {
                    host: 'new_host',
                };
                const updatedServer = await ftpServerDao.updateServer(server1.id, server1Update);
                assert.deepEqual(updatedServer, {
                    ...server1,
                    ...server1Update,
                });
            });

            it('should update a server', async () => {
                await ftpServerDao.createServer(server1);
                const server1Update: IFtpServerUpdateModel = {
                    host: 'new_host',
                    port: 1021,
                    username: 'new_username',
                };
                const updatedServer = await ftpServerDao.updateServer(server1.id, server1Update);
                assert.deepEqual(updatedServer, {
                    id: server1.id,
                    ...server1Update,
                });
            });

            it('should filter silly properties when updating a server', async () => {
                await ftpServerDao.createServer(server1);
                const server1Update: any = {
                    hello: '1021',
                };
                const updatedServer = await ftpServerDao.updateServer(server1.id, server1Update);
                assert.deepEqual(updatedServer, server1);
            });

            it('should throw when updating a server with properties that break index unicity', async () => {
                await ftpServerDao.createServer(server1);
                await ftpServerDao.createServer(server2);
                const server1Update: IFtpServerUpdateModel = {
                    host: server2.host,
                    port: server2.port,
                    username: server2.username,
                };
                await assertThrowsWithError(() => ftpServerDao.updateServer(server1.id, server1Update), BRIG_ERROR_CODE.DB_DUPLICATE);
            });
        });

        describe('Delete FTP server', () => {
            it('should throw when deleting a server that does not exist', async () => {
                await assertThrowsWithError(() => ftpServerDao.deleteServer(server1.id), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });

            it('should delete a server', async () => {
                await ftpServerDao.createServer(server1);
                await ftpServerDao.deleteServer(server1.id);
                await assertThrowsWithError(() => ftpServerDao.getServer(server1.id), BRIG_ERROR_CODE.DB_NOT_FOUND);
            });
        });
    });
});
