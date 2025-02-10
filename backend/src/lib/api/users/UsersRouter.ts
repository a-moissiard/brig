import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { UsersHandler } from './UsersHandler';

interface IUsersRouterDependencies {
    usersHandler: UsersHandler;
}

export class UsersRouter {
    private readonly router: Router;
    private readonly usersHandler: UsersHandler;

    constructor(deps: IUsersRouterDependencies) {
        this.router = express.Router();
        this.usersHandler = deps.usersHandler;
    }

    public init(): Router {
        this.router.get('/', asyncHandler(this.usersHandler.listUsers.bind(this.usersHandler)));
        this.router.delete('/:userId', asyncHandler(this.usersHandler.deleteUser.bind(this.usersHandler)));
        return this.router;
    }
}
