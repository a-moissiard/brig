import { Request, Response } from 'express';

import { AuthService } from '../../service/auth';

interface IAuthHandlerDependencies {
    authService: AuthService;
}

export class AuthHandler {
    private readonly authService: AuthService;

    constructor(deps: IAuthHandlerDependencies) {
        this.authService = deps.authService;
    }

    async register(req: Request, res: Response): Promise<void> {
        res.status(201).json({ message: 'User successfully registered', user: req.user });
    }
}
