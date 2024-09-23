import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema } from 'express-validator';

import { validate } from '../middlewares';
import { FtpServersActionsHandler } from './FtpServersActionsHandler';
import { FtpServersActionsRouter } from './FtpServersActionsRouter';
import { FtpServersHandler } from './FtpServersHandler';
import { ftpServersCreateBodySchema, ftpServersUpdateBodySchema } from './FtpServersValidationSchemas';

interface IFtpServersRouterDependencies {
    ftpServersHandler: FtpServersHandler;
    ftpServersActionsHandler: FtpServersActionsHandler;
}

export class FtpServersRouter {
    private readonly router: Router;
    private readonly ftpServersHandler: FtpServersHandler;
    private readonly ftpServersActionsRouter: FtpServersActionsRouter;

    constructor(deps: IFtpServersRouterDependencies) {
        this.router = express.Router();
        this.ftpServersHandler = deps.ftpServersHandler;
        this.ftpServersActionsRouter = new FtpServersActionsRouter({ ftpServersActionsHandler: deps.ftpServersActionsHandler });
    }

    public init(): Router {
        this.router.get('/', asyncHandler(this.ftpServersHandler.listUserServers.bind(this.ftpServersHandler)));
        this.router.post('/', checkSchema(ftpServersCreateBodySchema), validate, asyncHandler(this.ftpServersHandler.createServer.bind(this.ftpServersHandler)));
        this.router.get('/all', asyncHandler(this.ftpServersHandler.listAllServers.bind(this.ftpServersHandler)));
        this.router.get('/connected', asyncHandler(this.ftpServersHandler.listUserConnectedServers.bind(this.ftpServersHandler)));
        this.router.get('/activity', asyncHandler(this.ftpServersHandler.getTransferActivity.bind(this.ftpServersHandler)));
        this.router.post('/clearActivity', asyncHandler(this.ftpServersHandler.clearTransferActivity.bind(this.ftpServersHandler)));
        this.router.get('/trackActivity', asyncHandler(this.ftpServersHandler.trackActivity.bind(this.ftpServersHandler)));
        this.router.get('/:serverId', asyncHandler(this.ftpServersHandler.getServer.bind(this.ftpServersHandler)));
        this.router.put('/:serverId', checkSchema(ftpServersUpdateBodySchema), validate, asyncHandler(this.ftpServersHandler.updateServer.bind(this.ftpServersHandler)));
        this.router.delete('/:serverId', asyncHandler(this.ftpServersHandler.deleteServer.bind(this.ftpServersHandler)));
        this.router.use('/:serverId/actions', this.ftpServersActionsRouter.init());
        return this.router;
    }
}
