import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import { IBrigAuthConfig } from '../../config';
import { AuthService, IJwt } from '../../service/auth';
import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';

interface IAuthMiddlewareDependencies {
    authConfig: IBrigAuthConfig;
    authService: AuthService;
}

export const useAuthMiddleware = (strategyName: string): any => passport.authenticate(strategyName, { session: false });

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
            if (this.authConfig.openToUserRegistration !== 'true') {
                return done(new BrigError(BRIG_ERROR_CODE.AUTH_REGISTRATION_CLOSED, 'Registrations are not opened'));
            }
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
                if (e instanceof BrigError) {
                    return done(new BrigError(BRIG_ERROR_CODE.AUTH_INVALID_CREDENTIALS, 'Invalid credentials', {
                        cause: e.message,
                    }));
                }
                return done(e);
            }
        }));

        passport.use('isLoggedIn', new JwtStrategy({
            secretOrKey: this.authConfig.jwt.jwtSigningSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        }, async (token: IJwt, done) => {
            const isTokenInvalidated = this.authService.isJwtInvalidated(token.jti);
            if (isTokenInvalidated) {
                return done(new BrigError(BRIG_ERROR_CODE.AUTH_TOKEN_REVOKED, 'User logged out, authentication required'));
            }
            try {
                return done(null, { id: token.id, username: token.username });
            } catch (e) {
                return done(e);
            }
        }));

        passport.use('logout', new JwtStrategy({
            secretOrKey: this.authConfig.jwt.jwtSigningSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        }, async (token: IJwt, done) => {
            this.authService.invalidateJwt(token.jti, token.exp);
            try {
                return done(null, { id: token.id, username: token.username });
            } catch (e) {
                return done(e);
            }
        }));
    }
}

