import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import passport from 'passport';

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
        this.router.post('/register', passport.authenticate('register', { session: false }), asyncHandler(this.authHandler.register.bind(this.authHandler)));
        this.router.post('/login', passport.authenticate('login', { session: false }), asyncHandler(this.authHandler.login.bind(this.authHandler)));
        return this.router;
    }
}
