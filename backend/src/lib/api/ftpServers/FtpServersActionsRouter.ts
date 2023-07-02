import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { FtpServersActionsHandler } from './FtpServersActionsHandler';

interface IFtpServersActionsRouterDependencies {
    ftpServersActionsHandler: FtpServersActionsHandler;
}

export class FtpServersActionsRouter {
    private readonly router: Router;
    private readonly ftpServersActionsHandler: FtpServersActionsHandler;

    constructor(deps: IFtpServersActionsRouterDependencies) {
        this.router = express.Router({ mergeParams: true });
        this.ftpServersActionsHandler = deps.ftpServersActionsHandler;
    }

    public init(): Router {
        this.router.post('/connect', asyncHandler(this.ftpServersActionsHandler.connect.bind(this.ftpServersActionsHandler)));
        this.router.post('/disconnect', asyncHandler(this.ftpServersActionsHandler.disconnect.bind(this.ftpServersActionsHandler)));
        this.router.post('/list', asyncHandler(this.ftpServersActionsHandler.list.bind(this.ftpServersActionsHandler)));
        this.router.post('/pwd', asyncHandler(this.ftpServersActionsHandler.pwd.bind(this.ftpServersActionsHandler)));
        return this.router;
    }
}
