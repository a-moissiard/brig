import { BrigService } from '../service/BrigService';

interface IBrigFtpServerHandlerDependencies {
    brigService: BrigService;
}

export class BrigFtpServerHandler {
    private readonly brigService: BrigService;

    constructor(deps: IBrigFtpServerHandlerDependencies) {
        this.brigService = deps.brigService;
    }
}