import { Request, Response } from 'express';

import { UsersService } from '../../service/users';
import { buildRequester } from '../utils';

interface IUsersHandlerDependencies {
    usersService: UsersService;
}

export class UsersHandler {
    private readonly usersService: UsersService;

    constructor(deps: IUsersHandlerDependencies) {
        this.usersService = deps.usersService;
    }

    async listLightUsers(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const users = await this.usersService.listLightUsers(requester);

        res.send(users);
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { userId } = req.params;

        await this.usersService.deleteUser(requester, userId);

        res.send();
    }
}
