import express, { Router } from 'express';

import { AuthHandler, AuthRouter } from './auth';
import { FtpServersHandler, FtpServersRouter } from './ftpServers';
import { UsersHandler, UsersRouter } from './users';

interface IBrigApiDependencies {
    authHandler: AuthHandler;
    ftpServersHandler: FtpServersHandler;
    usersHandler: UsersHandler;
}

export class BrigApi {
    private readonly router: Router;
    private readonly authRouter: AuthRouter;
    private readonly ftpServersRouter: FtpServersRouter;
    private readonly usersRouter: UsersRouter;

    constructor(deps: IBrigApiDependencies) {
        this.router = express.Router();
        this.authRouter = new AuthRouter({ authHandler: deps.authHandler });
        this.ftpServersRouter = new FtpServersRouter({ ftpServersHandler: deps.ftpServersHandler });
        this.usersRouter = new UsersRouter({ usersHandler: deps.usersHandler });
    }

    public init(): Router {
        this.router.use('/auth', this.authRouter.init());
        this.router.use('/servers', this.ftpServersRouter.init());
        this.router.use('/users', this.usersRouter.init());
        this.router.use('*', (req, res) => res.status(404).end());
        return this.router;
    }
}
