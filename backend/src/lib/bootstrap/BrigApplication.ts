import { config } from '../config';
import { BrigMicroService } from './BrigMicroService';

export class BrigApplication {
    private readonly brigMicroService: BrigMicroService;

    constructor() {
        this.brigMicroService = new BrigMicroService({ config });
    }

    public async startApp(): Promise<void> {
        await this.brigMicroService.startMicroService();
    }
}