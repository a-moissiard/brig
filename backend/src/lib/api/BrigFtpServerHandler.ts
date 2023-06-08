import { Request, Response } from 'express';

import { BrigService, IFtpServerCreateModel, IFtpServerUpdateModel } from '../service';

interface IBrigFtpServerHandlerDependencies {
    brigService: BrigService;
}

export class BrigFtpServerHandler {
    private readonly brigService: BrigService;

    constructor(deps: IBrigFtpServerHandlerDependencies) {
        this.brigService = deps.brigService;
    }

    async listServers(req: Request, res: Response): Promise<void> {        
        const servers = await this.brigService.listServers();

        res.send(servers);
    }

    async createServer(req: Request, res: Response): Promise<void> {
        const body = req.body as IFtpServerCreateModel;

        const server = await this.brigService.createServer(body);

        res.status(201).send(server);
    }

    async getServer(req: Request, res: Response): Promise<void> {
        const { serverId } = req.params;

        const server = await this.brigService.getServer(serverId);

        res.send(server);
    }

    async updateServer(req: Request, res: Response): Promise<void> {
        const { serverId } = req.params;
        const body = req.body as IFtpServerUpdateModel;

        const server = await this.brigService.updateServer(serverId, body);

        res.send(server);
    }

    async deleteServer(req: Request, res: Response): Promise<void> {
        const { serverId } = req.params;

        await this.brigService.deleteServer(serverId);

        res.send();
    }
}
