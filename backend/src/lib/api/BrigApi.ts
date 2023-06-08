import express, { Router } from 'express';

import { BrigFtpServerHandler } from './BrigFtpServerHandler';
import { BrigFtpServerRouter } from './BrigFtpServerRouter';

interface IBrigApiDependencies {
    brigFtpServerHandler: BrigFtpServerHandler;
}

export class BrigApi {
    private readonly router: Router;
    private readonly brigFtpServerRouter: BrigFtpServerRouter;

    constructor(deps: IBrigApiDependencies) {
        this.router = express.Router();
        this.brigFtpServerRouter = new BrigFtpServerRouter({ brigFtpServerHandler: deps.brigFtpServerHandler });
    }

    public init(): Router {
        this.router.use('/server', this.brigFtpServerRouter.init());
        return this.router;
    }
}
