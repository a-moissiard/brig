import express, { Router } from 'express';

import { FtpServersHandler, FtpServersRouter } from './ftpServers';
import { UsersHandler, UsersRouter } from './users';

interface IBrigApiDependencies {
    ftpServersHandler: FtpServersHandler;
    usersHandler: UsersHandler;
}

export class BrigApi {
    private readonly router: Router;
    private readonly ftpServersRouter: FtpServersRouter;
    private readonly usersRouter: UsersRouter;

    constructor(deps: IBrigApiDependencies) {
        this.router = express.Router();
        this.ftpServersRouter = new FtpServersRouter({ ftpServersHandler: deps.ftpServersHandler });
        this.usersRouter = new UsersRouter({ usersHandler: deps.usersHandler });
    }

    public init(): Router {
        this.router.use('/servers', this.ftpServersRouter.init());
        this.router.use('/users', this.usersRouter.init());
        return this.router;
    }
}
