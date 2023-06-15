import * as bcrypt from 'bcrypt';

import { IUserModel, UsersService } from '../users';

interface IAuthServiceDependencies {
    usersService: UsersService;
}

export class AuthService {
    private readonly usersService: UsersService;

    constructor(deps: IAuthServiceDependencies) {
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
}
