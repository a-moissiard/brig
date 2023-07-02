import { Request, Response } from 'express';

import { FtpServersService } from '../../service/ftpServers';
import { buildRequester } from '../utils';

interface IFtpServersActionsHandlerDependencies {
    ftpServersService: FtpServersService;
}

export class FtpServersActionsHandler {
    private readonly ftpServersService: FtpServersService;

    constructor(deps: IFtpServersActionsHandlerDependencies) {
        this.ftpServersService = deps.ftpServersService;
    }

    async connect(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;
        const { password, first } = req.body as { password: string; first: boolean };

        await this.ftpServersService.connect(requester, serverId, first, password);
        const workingDir = await this.ftpServersService.pwd(requester, serverId, first);
        const list = await this.ftpServersService.list(requester, serverId, first, workingDir);

        res.send({
            workingDir,
            list,
        });
    }

    async disconnect(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;
        const { first } = req.body as { first: boolean };

        await this.ftpServersService.disconnect(requester, serverId, first);

        res.send();
    }

    async list(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;
        const { path, first } = req.body as { path: string; first: boolean };

        const list = await this.ftpServersService.list(requester, serverId, first, path);
        const workingDir = await this.ftpServersService.pwd(requester, serverId, first);

        res.send({
            workingDir,
            list,
        });
    }

    async pwd(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;
        const { first } = req.body as { first: boolean };

        const workingDir = await this.ftpServersService.pwd(requester, serverId, first);

        res.send({
            workingDir,
        });
    }
}
