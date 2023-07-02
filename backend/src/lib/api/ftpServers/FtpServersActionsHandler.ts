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
        const { password } = req.body as { password: string };

        await this.ftpServersService.connect(requester, serverId, password);
        const workingDir = await this.ftpServersService.pwd(requester, serverId);
        const list = await this.ftpServersService.list(requester, serverId, workingDir);

        res.send({
            workingDir,
            list,
        });
    }

    async disconnect(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;

        await this.ftpServersService.disconnect(requester, serverId);

        res.send();
    }

    async list(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;
        const { path } = req.body as { path: string };

        const list = await this.ftpServersService.list(requester, serverId, path);
        const workingDir = await this.ftpServersService.pwd(requester, serverId);

        res.send({
            workingDir,
            list,
        });
    }

    async pwd(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;

        const workingDir = await this.ftpServersService.pwd(requester, serverId);

        res.send({
            workingDir,
        });
    }
}
