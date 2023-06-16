import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import { IBrigAuthConfig } from '../../config';
import { AuthService } from '../../service/auth';
import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';

interface IAuthMiddlewareDependencies {
    authConfig: IBrigAuthConfig;
    authService: AuthService;
}

export class AuthMiddleware {
    private readonly authConfig: IBrigAuthConfig;
    private readonly authService: AuthService;
    constructor(deps: IAuthMiddlewareDependencies) {
        this.authConfig = deps.authConfig;
        this.authService = deps.authService;
    }

    public init(): void {
        passport.use('register', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
        }, async (username, password, done) => {
            try {
                const user = await this.authService.register(username, password);
                return done(null, { id: user.id, username });
            } catch (e) {
                return done(e);
            }
        }));

        passport.use('login', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
        }, async (username, password, done) => {
            try {
                const user = await this.authService.checkCredentials(username, password);
                if (user) {
                    return done(null, { id: user.id, username: user.username });
                }
                return done(new BrigError(BRIG_ERROR_CODE.AUTH_INVALID_CREDENTIALS, 'Invalid credentials'));
            } catch (e) {
                return done(e);
            }
        }));

        passport.use('verifyJwt', new JwtStrategy({
            secretOrKey: this.authConfig.jwtSigningSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        }, async (token, done) => {
            try {
                return done(null, { id: token.id, username: token.username });
            } catch (e) {
                return done(e);
            }
        }));
    }
}

