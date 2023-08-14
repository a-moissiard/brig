import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { useAuthMiddleware } from '../middlewares';
import { AuthHandler } from './AuthHandler';

interface IAuthRouterDependencies {
    authHandler: AuthHandler;
}

export class AuthRouter {
    private readonly router: Router;
    private readonly authHandler: AuthHandler;

    constructor(deps: IAuthRouterDependencies) {
        this.router = express.Router();
        this.authHandler = deps.authHandler;
    }

    public init(): Router {
        this.router.post('/register', useAuthMiddleware('register'), asyncHandler(this.authHandler.register.bind(this.authHandler)));
        this.router.post('/login', useAuthMiddleware('login'), asyncHandler(this.authHandler.login.bind(this.authHandler)));
        this.router.get('/getLoggedUser', useAuthMiddleware('isLoggedIn'), asyncHandler(this.authHandler.getLoggedUser.bind(this.authHandler)));
        this.router.get('/refresh', useAuthMiddleware('refresh'), asyncHandler(this.authHandler.refresh.bind(this.authHandler)));
        this.router.post('/logout', useAuthMiddleware('logout'), asyncHandler(this.authHandler.logout.bind(this.authHandler)));
        return this.router;
    }
}
