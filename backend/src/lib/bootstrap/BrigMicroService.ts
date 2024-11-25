import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import path from 'path';

import { BrigApi } from '../api';
import { AuthHandler } from '../api/auth';
import { FtpServersActionsHandler, FtpServersHandler } from '../api/ftpServers';
import { AuthMiddleware, errorMiddleware } from '../api/middlewares';
import { UsersHandler } from '../api/users';
import { IBrigConfig } from '../config';
import { logger } from '../logger';
import { AuthService } from '../service/auth';
import { UserAuthTokensDao } from '../service/auth/UserAuthTokensDao';
import { FtpServersAuthorizationsEnforcer, FtpServersDao, FtpServersService } from '../service/ftpServers';
import { UsersAuthorizationsEnforcer, UsersDao, UsersService } from '../service/users';
import { MongoConnectionManager } from '../utils/mongo';
import { RedisConnectionManager } from '../utils/redis';

interface IBrigMicroServiceDependencies {
    config: IBrigConfig;
    mongoConnectionManager: MongoConnectionManager;
    redisConnectionManager: RedisConnectionManager;
}

export class BrigMicroService {
    private readonly config: IBrigConfig;
    private readonly expressApp: Express;
    private server: http.Server | undefined;

    private readonly brigApi: BrigApi;
    private readonly authMiddleware: AuthMiddleware;
    private readonly authService: AuthService;

    private readonly userAuthTokensDao: UserAuthTokensDao;
    private readonly ftpServersDao: FtpServersDao;
    private readonly usersDao: UsersDao;

    constructor(deps: IBrigMicroServiceDependencies) {
        const { config, mongoConnectionManager, redisConnectionManager } = deps;
        this.config = config;

        this.userAuthTokensDao = new UserAuthTokensDao({ mongoConnectionManager });
        this.usersDao = new UsersDao({ mongoConnectionManager });
        this.ftpServersDao = new FtpServersDao({ mongoConnectionManager });

        const usersAuthorizationsEnforcer = new UsersAuthorizationsEnforcer({ usersDao: this.usersDao });
        const usersService = new UsersService({ usersAuthorizationsEnforcer, usersDao: this.usersDao });
        const usersHandler = new UsersHandler({ usersService });

        const ftpServersAuthorizationsEnforcer = new FtpServersAuthorizationsEnforcer({ usersDao: this.usersDao, ftpServersDao: this.ftpServersDao });
        const ftpServersService = new FtpServersService({
            ftpServersAuthorizationsEnforcer,
            ftpServersDao: this.ftpServersDao,
            redisClient: redisConnectionManager.redisClient,
        });
        const ftpServersHandler = new FtpServersHandler({ ftpServersService });
        const ftpServersActionsHandler = new FtpServersActionsHandler({ ftpServersService });

        this.authService = new AuthService({ authConfig: config.auth, usersService, userAuthTokensDao: this.userAuthTokensDao });
        const authHandler = new AuthHandler({ authService: this.authService, usersService, ftpServersService });

        this.authMiddleware = new AuthMiddleware({ authConfig: config.auth, authService: this.authService });

        this.brigApi = new BrigApi({ authHandler, usersHandler, ftpServersHandler, ftpServersActionsHandler });

        this.expressApp = express();
    }

    public async startMicroService(): Promise<void> {
        await this.initDAOs();

        this.authMiddleware.init();
        this.authService.init();

        const { port, authorizedOrigin } = this.config.express;

        this.expressApp.use(cors({
            origin: [`http://localhost:${authorizedOrigin.port}`, `http://${authorizedOrigin.host}:${authorizedOrigin.port}`],
            allowedHeaders: ['Content-Type', 'Cache-Control', 'Connection', 'Authorization', 'Last-Event-Id'],
            credentials: true,
        }));

        this.expressApp.use(express.json());
        this.expressApp.use('/api', this.brigApi.init());
        this.expressApp.use(errorMiddleware);

        this.expressApp.use(express.static(path.join(__dirname, '../../../build/frontend')));
        this.expressApp.get('/*', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../../../build/frontend', 'index.html'));
        });

        this.server = this.expressApp.listen(port, () => {
            logger.info(`Server started on port ${port}`);
        });
    }

    public async stopMicroService(): Promise<void> {
        await this.authService.shutdown();
        this.server?.close(() => {
            logger.info('Server shut down');
        });
    }

    private async initDAOs(): Promise<void> {
        await this.userAuthTokensDao.init();
        await this.ftpServersDao.init();
        await this.usersDao.init();
    }
}
