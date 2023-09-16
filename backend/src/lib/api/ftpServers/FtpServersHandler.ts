import { Request, Response } from 'express';

import { FtpServersService, IFtpServerCreateModel, IFtpServerUpdateModel } from '../../service/ftpServers';
import { extractValidatedData } from '../middlewares';
import { buildRequester } from '../utils';

interface IFtpServersHandlerDependencies {
    ftpServersService: FtpServersService;
}

export class FtpServersHandler {
    private readonly ftpServersService: FtpServersService;

    constructor(deps: IFtpServersHandlerDependencies) {
        this.ftpServersService = deps.ftpServersService;
    }

    async listUserServers(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const servers = await this.ftpServersService.listUserServers(requester);

        res.send(servers);
    }

    async createServer(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const body = extractValidatedData<IFtpServerCreateModel>(req, { locations: ['body'] });

        const server = await this.ftpServersService.createServer(requester, body);

        res.status(201).send(server);
    }

    async listAllServers(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const servers = await this.ftpServersService.listAllServers(requester);

        res.send(servers);
    }

    async listUserConnectedServers(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const userConnectedServers = await this.ftpServersService.getUserConnectedServers(requester);

        res.send(userConnectedServers);
    }

    async getServer(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;

        const server = await this.ftpServersService.getServer(requester, serverId);

        res.send(server);
    }

    async updateServer(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;
        const body = extractValidatedData<IFtpServerUpdateModel>(req, { locations: ['body'] });

        const server = await this.ftpServersService.updateServer(requester, serverId, body);

        res.send(server);
    }

    async deleteServer(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;

        await this.ftpServersService.deleteServer(requester, serverId);

        res.send();
    }
}
