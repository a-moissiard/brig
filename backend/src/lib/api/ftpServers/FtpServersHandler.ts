import { Request, Response } from 'express';

import { FtpServersService, IFtpServerCreateModel, IFtpServerUpdateModel } from '../../service/ftpServers';
import { extractValidatedData } from '../middlewares';
import { buildRequester, EVENT_TYPE, ServerSentEventsHelper } from '../utils';

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

    async getTransferActivity(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);

        const transferActivity = await this.ftpServersService.getTransferActivity(requester);

        res.send(transferActivity);
    }

    async clearTransferActivity(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);

        await this.ftpServersService.clearTransferActivity(requester);

        res.send();
    }

    async trackActivity(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);

        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const sendEvent = ServerSentEventsHelper.sendEventFactory(res);

        const callbackId = await this.ftpServersService.registerSendEventCallback(requester, sendEvent);

        const intervalId = setInterval(() => {
            sendEvent(EVENT_TYPE.KEEP_ALIVE, {});
        }, 30 * 1000);

        res.on('close', async () => {
            await this.ftpServersService.unregisterSendEventCallback(requester, callbackId);
            clearInterval(intervalId);
            res.end();
        });
    }
}
