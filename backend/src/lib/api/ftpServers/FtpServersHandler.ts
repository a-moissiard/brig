import { Request, Response } from 'express';

import { FtpServersService, IFtpServerCreateModel, IFtpServerUpdateModel } from '../../service/ftpServers';

interface IFtpServersHandlerDependencies {
    ftpServersService: FtpServersService;
}

export class FtpServersHandler {
    private readonly ftpServersService: FtpServersService;

    constructor(deps: IFtpServersHandlerDependencies) {
        this.ftpServersService = deps.ftpServersService;
    }

    async listServers(req: Request, res: Response): Promise<void> {        
        const servers = await this.ftpServersService.listServers();

        res.send(servers);
    }

    async createServer(req: Request, res: Response): Promise<void> {
        const body = req.body as IFtpServerCreateModel;

        const server = await this.ftpServersService.createServer(body);

        res.status(201).send(server);
    }

    async getServer(req: Request, res: Response): Promise<void> {
        const { serverId } = req.params;

        const server = await this.ftpServersService.getServer(serverId);

        res.send(server);
    }

    async updateServer(req: Request, res: Response): Promise<void> {
        const { serverId } = req.params;
        const body = req.body as IFtpServerUpdateModel;

        const server = await this.ftpServersService.updateServer(serverId, body);

        res.send(server);
    }

    async deleteServer(req: Request, res: Response): Promise<void> {
        const { serverId } = req.params;

        await this.ftpServersService.deleteServer(serverId);

        res.send();
    }
}
