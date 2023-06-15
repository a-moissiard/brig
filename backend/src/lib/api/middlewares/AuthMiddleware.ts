import passport from 'passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../../service/auth';

interface IAuthMiddlewareDependencies {
    authService: AuthService;
}

export class AuthMiddleware {
    private readonly authService: AuthService;
    constructor(deps: IAuthMiddlewareDependencies) {
        this.authService = deps.authService;
    }

    public init(): void {
        passport.use('register', new Strategy({
            usernameField: 'username',
            passwordField: 'password',
        }, async (username, password, done) => {
            try {
                const user = await this.authService.register(username, password);
                return done(null, { id: user.id, username });
            } catch (e) {
                done(e);
            }
        }));
    }
}

