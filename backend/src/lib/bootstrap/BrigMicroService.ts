import express, { Express } from 'express';
import path from 'path';

import { IBrigConfig } from '../config';
import { BrigService } from '../service/BrigService';

interface IBrigMicroServiceDependencies {
    config: IBrigConfig;
}

export class BrigMicroService {
    private readonly config: IBrigConfig;
    private readonly expressApp: Express;
    private readonly brigService: BrigService;

    constructor(deps: IBrigMicroServiceDependencies) {
        this.config = deps.config;
        this.brigService = new BrigService({});

        this.expressApp = express();
    }
    
    public startMicroService(): void {
        this.expressApp.use(express.static(path.join(__dirname, '../../../build/frontend')));

        const { port } = this.config.express;

        this.expressApp.listen(port, () => {
            console.log(`server started at http://localhost:${port}`);
        });
    }
}