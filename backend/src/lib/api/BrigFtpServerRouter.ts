import express, { Router } from 'express';

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
        return this.router;
    }
}