import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { BrigFtpServerHandler } from './BrigFtpServerHandler';

interface IBrigFtpServerRouterDependencies {
    brigFtpServerHandler: BrigFtpServerHandler;
}

export class BrigFtpServerRouter {
    private readonly router: Router;
    private readonly brigFtpServerHandler: BrigFtpServerHandler;

    constructor(deps: IBrigFtpServerRouterDependencies) {
        this.router = express.Router();
        this.brigFtpServerHandler = deps.brigFtpServerHandler;
    }

    public init(): Router {
        this.router.get('/', asyncHandler(this.brigFtpServerHandler.listServers.bind(this.brigFtpServerHandler)));
        this.router.post('/', asyncHandler(this.brigFtpServerHandler.createServer.bind(this.brigFtpServerHandler)));
        this.router.get('/:serverId', asyncHandler(this.brigFtpServerHandler.getServer.bind(this.brigFtpServerHandler)));
        this.router.put('/:serverId', asyncHandler(this.brigFtpServerHandler.updateServer.bind(this.brigFtpServerHandler)));
        this.router.delete('/:serverId', asyncHandler(this.brigFtpServerHandler.deleteServer.bind(this.brigFtpServerHandler)));
        return this.router;
    }
}
