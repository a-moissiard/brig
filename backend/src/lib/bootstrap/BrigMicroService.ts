import express, { Express } from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';

import { IBrigConfig } from '../config';
import { logger } from '../logger';
import { BrigService } from '../service/BrigService';

interface IBrigMicroServiceDependencies {
    config: IBrigConfig;
    mongoClient: MongoClient;
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
    
    public async startMicroService(): Promise<void> {
        this.expressApp.use(express.static(path.join(__dirname, '../../../build/frontend')));

        const { port } = this.config.express;

        this.expressApp.listen(port, () => {
            logger.info(`server started at http://localhost:${port}`);
        });
    }
}