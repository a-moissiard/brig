import { NextFunction, Request, Response } from 'express';

import { AuthService } from '../../service/auth';
import { FtpServersService } from '../../service/ftpServers';
import { UsersService } from '../../service/users';
import { buildRequester } from '../utils';

interface IAuthHandlerDependencies {
    authService: AuthService;
    usersService: UsersService;
    ftpServersService: FtpServersService;
}

export class AuthHandler {
    private readonly authService: AuthService;
    private readonly usersService: UsersService;
    private readonly ftpServersService: FtpServersService;

    constructor(deps: IAuthHandlerDependencies) {
        this.authService = deps.authService;
        this.usersService = deps.usersService;
        this.ftpServersService = deps.ftpServersService;
    }

    async register(req: Request, res: Response): Promise<void> {
        res.status(201).json({ message: 'User successfully registered', user: req.user });
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { user } = req;

        if (!user) {
            return next();
        }

        req.login(
            user,
            { session: false },
            async (error) => {
                if (error) {
                    return next(error);
                }
                const { accessToken, refreshToken } = await this.authService.generateTokens(user.id, user.username);
                return res.send({
                    accessToken,
                    refreshToken,
                });
            },
        );
    }

    async getLoggedUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { user } = req;

        if (!user) {
            return next();
        }

        const loggedInUser = await this.usersService.getUser(user.id);
        res.send(loggedInUser);
    }

    async refresh(req: Request, res:Response, next: NextFunction): Promise<void> {
        const { user } = req;

        if (!user) {
            return next();
        }

        const { accessToken, refreshToken } = await this.authService.generateTokens(user.id);
        res.send({
            accessToken,
            refreshToken,
        });
    }

    async logout(req: Request, res: Response): Promise<void> {
        const requester = buildRequester(req);
        await this.ftpServersService.cleanUser(requester);
        res.sendStatus(204);
    }
}
