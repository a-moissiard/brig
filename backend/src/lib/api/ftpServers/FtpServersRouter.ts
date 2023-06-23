import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { FtpServersHandler } from './FtpServersHandler';

interface IFtpServersRouterDependencies {
    ftpServersHandler: FtpServersHandler;
}

export class FtpServersRouter {
    private readonly router: Router;
    private readonly ftpServersHandler: FtpServersHandler;

    constructor(deps: IFtpServersRouterDependencies) {
        this.router = express.Router();
        this.ftpServersHandler = deps.ftpServersHandler;
    }

    public init(): Router {
        this.router.get('/', asyncHandler(this.ftpServersHandler.listUserServers.bind(this.ftpServersHandler)));
        this.router.post('/', asyncHandler(this.ftpServersHandler.createServer.bind(this.ftpServersHandler)));
        this.router.get('/all', asyncHandler(this.ftpServersHandler.listAllServers.bind(this.ftpServersHandler)));
        this.router.get('/:serverId', asyncHandler(this.ftpServersHandler.getServer.bind(this.ftpServersHandler)));
        this.router.put('/:serverId', asyncHandler(this.ftpServersHandler.updateServer.bind(this.ftpServersHandler)));
        this.router.delete('/:serverId', asyncHandler(this.ftpServersHandler.deleteServer.bind(this.ftpServersHandler)));
        return this.router;
    }
}
