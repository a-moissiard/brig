import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema } from 'express-validator';

import { validate } from '../middlewares';
import { FtpServersActionsHandler } from './FtpServersActionsHandler';
import { connectBodySchema, createDirBodySchema, listBodySchema, transferBodySchema } from './FtpServersActionsValidationSchemas';

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
        this.router.post('/connect',
            checkSchema(connectBodySchema),
            validate,
            asyncHandler(this.ftpServersActionsHandler.connect.bind(this.ftpServersActionsHandler)),
        );
        this.router.post('/disconnect', asyncHandler(this.ftpServersActionsHandler.disconnect.bind(this.ftpServersActionsHandler)));
        this.router.post('/list',
            checkSchema(listBodySchema),
            validate,
            asyncHandler(this.ftpServersActionsHandler.list.bind(this.ftpServersActionsHandler)),
        );
        this.router.post('/pwd', asyncHandler(this.ftpServersActionsHandler.pwd.bind(this.ftpServersActionsHandler)));
        this.router.post('/createDir',
            checkSchema(createDirBodySchema),
            validate,
            asyncHandler(this.ftpServersActionsHandler.createDir.bind(this.ftpServersActionsHandler)),
        );
        this.router.post('/trackProgress', asyncHandler(this.ftpServersActionsHandler.trackProgress.bind(this.ftpServersActionsHandler)));
        this.router.post('/cancelTransfer', asyncHandler(this.ftpServersActionsHandler.cancelTransfer.bind(this.ftpServersActionsHandler)));
        this.router.post('/transfer/:destinationServerId',
            checkSchema(transferBodySchema),
            validate,
            asyncHandler(this.ftpServersActionsHandler.transfer.bind(this.ftpServersActionsHandler)),
        );
        return this.router;
    }
}
