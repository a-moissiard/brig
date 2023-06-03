import 'dotenv/config';
import { MongoClient } from 'mongodb';

import { config } from '../config';
import { logger } from '../logger';
import { BrigMicroService } from './BrigMicroService';

export class BrigApplication {
    private readonly mongoClient: MongoClient; 
    private readonly brigMicroService: BrigMicroService;

    constructor() {
        const { user, pass, host, port } = config.mongo.connection;
        const mongoUrl = `mongodb://${user}:${pass}@${host}:${port}`;
        this.mongoClient = new MongoClient(mongoUrl);

        this.brigMicroService = new BrigMicroService({ config, mongoClient: this.mongoClient });
    }

    public async startApp(): Promise<void> {
        await this.mongoClient.connect();
        logger.info('Connection to mongodb succesful');
        await this.brigMicroService.startMicroService();
    }
}