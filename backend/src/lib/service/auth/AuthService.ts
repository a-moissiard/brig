import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as schedule from 'node-schedule';
import * as uuid from 'uuid';

import { IBrigAuthConfig } from '../../config';
import { IUserModel, UsersService } from '../users';

interface IAuthServiceDependencies {
    authConfig: IBrigAuthConfig;
    usersService: UsersService;
}

export class AuthService {
    private readonly authConfig: IBrigAuthConfig;
    private readonly usersService: UsersService;

    private readonly invalidatedJwtIds: Map<string, number>;

    constructor(deps: IAuthServiceDependencies) {
        this.authConfig = deps.authConfig;
        this.usersService = deps.usersService;

        this.invalidatedJwtIds = new Map();
    }

    public init(): void {
        schedule.scheduleJob('0 * * * *', this.cleanInvalidatedJwt.bind(this));
    }

    public async shutdown(): Promise<void> {
        return schedule.gracefulShutdown();
    }

    public async register(username: string, password: string): Promise<IUserModel> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        return this.usersService.createUser({
            username,
            hash,
        });
    }

    public async checkCredentials(username: string, password: string): Promise<IUserModel | undefined> {
        const user = await this.usersService.getUserByUsername(username);
        return (await bcrypt.compare(password, user.hash)) ? user : undefined;
    }

    public async createJwt(payload: string | Buffer | object): Promise<string> {
        const { jwtSigningSecret, jwtValidityPeriod } = this.authConfig;
        return jwt.sign(payload, jwtSigningSecret, {
            expiresIn: jwtValidityPeriod,
            jwtid: uuid.v4(),
        });
    }

    public invalidateJwt(jwtId: string, exp: number): void {
        this.invalidatedJwtIds.set(jwtId, exp);
    }

    public isJwtInvalidated(jwtId: string): boolean {
        return this.invalidatedJwtIds.has(jwtId);
    }

    public cleanInvalidatedJwt(): void {
        this.invalidatedJwtIds.forEach((exp, jwtId) => {
            if (exp < (Date.now() / 1000)) {
                this.invalidatedJwtIds.delete(jwtId);
            }
        });
    }
}
