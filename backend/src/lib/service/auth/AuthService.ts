import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
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

    constructor(deps: IAuthServiceDependencies) {
        this.authConfig = deps.authConfig;
        this.usersService = deps.usersService;
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
}
