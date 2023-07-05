import { Request, Response } from 'express';

import { FtpServersService } from '../../service/ftpServers';
import { extractValidatedData } from '../middlewares';
import { buildRequester } from '../utils';
import { IConnectBody, ICreateDirBody, IListBody, ITransferBody } from './FtpServersActionsValidationSchemas';

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
        const { password } = extractValidatedData<IConnectBody>(req, { locations: ['body'] });

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
        const { path } = extractValidatedData<IListBody>(req, { locations: ['body'] });

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

    async createDir(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId } = req.params;
        const { path } = extractValidatedData<ICreateDirBody>(req, { locations: ['body'] });

        await this.ftpServersService.createDir(requester, serverId, path);

        res.sendStatus(201);
    }

    async transfer(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { serverId, destinationServerId } = req.params;
        const { path } = extractValidatedData<ITransferBody>(req, { locations: ['body'] });

        await this.ftpServersService.transfer(requester, serverId, destinationServerId, path);

        res.sendStatus(200);
    }
}
