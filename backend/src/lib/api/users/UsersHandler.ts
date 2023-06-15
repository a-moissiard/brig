import { Request, Response } from 'express';

import { UsersService } from '../../service/users';

interface IUsersHandlerDependencies {
    usersService: UsersService;
}

export class UsersHandler {
    private readonly usersService: UsersService;

    constructor(deps: IUsersHandlerDependencies) {
        this.usersService = deps.usersService;
    }

    async listLightUsers(req: Request, res: Response): Promise<void> {
        const users = await this.usersService.listLightUsers();

        res.send(users);
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        const { userId } = req.params;

        await this.usersService.deleteUser(userId);

        res.send();
    }
}
