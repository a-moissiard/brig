import express, { Express } from 'express';
import * as http from 'http';
import path from 'path';

import { BrigApi } from '../api';
import { AuthHandler } from '../api/auth';
import { FtpServersHandler } from '../api/ftpServers';
import { AuthMiddleware, errorMiddleware } from '../api/middlewares';
import { UsersHandler } from '../api/users';
import { IBrigConfig } from '../config';
import { logger } from '../logger';
import { AuthService } from '../service/auth';
import { FtpServersAuthorizationsEnforcer, FtpServersDao, FtpServersService } from '../service/ftpServers';
import { UsersAuthorizationsEnforcer, UsersDao, UsersService } from '../service/users';
import { MongoConnectionManager } from '../utils/mongo';

interface IBrigMicroServiceDependencies {
    config: IBrigConfig;
    mongoConnectionManager: MongoConnectionManager;
}

export class BrigMicroService {
    private readonly config: IBrigConfig;
    private readonly expressApp: Express;
    private server: http.Server | undefined;

    private readonly brigApi: BrigApi;
    private readonly authMiddleware: AuthMiddleware;
    private readonly authService: AuthService;

    private readonly ftpServersDao: FtpServersDao;
    private readonly usersDao: UsersDao;

    constructor(deps: IBrigMicroServiceDependencies) {
        const { config, mongoConnectionManager } = deps;
        this.config = config;

        this.usersDao = new UsersDao({ mongoConnectionManager });
        this.ftpServersDao = new FtpServersDao({ mongoConnectionManager });

        const usersAuthorizationsEnforcer = new UsersAuthorizationsEnforcer({ usersDao: this.usersDao });
        const usersService = new UsersService({ usersAuthorizationsEnforcer, usersDao: this.usersDao });
        const usersHandler = new UsersHandler({ usersService });

        const ftpServersAuthorizationsEnforcer = new FtpServersAuthorizationsEnforcer({ usersDao: this.usersDao, ftpServersDao: this.ftpServersDao });
        const ftpServersService = new FtpServersService({ ftpServersAuthorizationsEnforcer, ftpServersDao: this.ftpServersDao });
        const ftpServersHandler = new FtpServersHandler({ ftpServersService });

        this.authService = new AuthService({ authConfig: config.auth, usersService });
        const authHandler = new AuthHandler({ authService: this.authService });

        this.authMiddleware = new AuthMiddleware({ authConfig: config.auth, authService: this.authService });

        this.brigApi = new BrigApi({ authHandler, usersHandler, ftpServersHandler });

        this.expressApp = express();
    }
    
    public async startMicroService(): Promise<void> {
        await this.initDAOs();

        this.expressApp.use(express.static(path.join(__dirname, '../../../build/frontend')));

        this.authService.init();
        this.authMiddleware.init();

        this.expressApp.use(express.json());
        this.expressApp.use('/api', this.brigApi.init());
        this.expressApp.use(errorMiddleware);

        const { port } = this.config.express;
        this.server = this.expressApp.listen(port, () => {
            logger.info(`Server started at http://localhost:${port}`);
        });
    }

    public async stopMicroService(): Promise<void> {
        await this.authService.shutdown();
        this.server?.close(() => {
            logger.info('Server shut down');
        });
    }

    private async initDAOs(): Promise<void> {
        await this.ftpServersDao.init();
        await this.usersDao.init();
    }
}
