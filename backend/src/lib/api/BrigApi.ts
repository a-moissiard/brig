import express, { Router } from 'express';

import { FtpServersHandler, FtpServersRouter } from './ftpServers';

interface IBrigApiDependencies {
    ftpServersHandler: FtpServersHandler;
}

export class BrigApi {
    private readonly router: Router;
    private readonly ftpServersRouter: FtpServersRouter;

    constructor(deps: IBrigApiDependencies) {
        this.router = express.Router();
        this.ftpServersRouter = new FtpServersRouter({ ftpServersHandler: deps.ftpServersHandler });
    }

    public init(): Router {
        this.router.use('/servers', this.ftpServersRouter.init());
        return this.router;
    }
}
