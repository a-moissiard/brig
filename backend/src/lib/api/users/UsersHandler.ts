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

    async listUsers(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);

        const userList = await this.usersService.listUsers(requester);

        res.send(userList);
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        const { userId } = req.params;

        await this.usersService.deleteUser(requester, userId);

        res.send();
    }
}
