import * as uuid from 'uuid';

import { AuthorizationsEnforcer, IRequester } from '../authorizations';
import { UsersDao } from './UsersDao';
import { IUserCreateModel, IUserLightModel, IUserModel } from './UsersTypes';

interface IUsersServiceDependencies {
    usersDao: UsersDao;
    authorizationsEnforcer: AuthorizationsEnforcer;
}

export class UsersService {
    private readonly usersDao: UsersDao;
    private readonly authorizationsEnforcer: AuthorizationsEnforcer;

    constructor(deps: IUsersServiceDependencies) {
        this.usersDao = deps.usersDao;
        this.authorizationsEnforcer = deps.authorizationsEnforcer;
    }

    // Internal usages, no need for requester
    public async createUser(user: IUserCreateModel): Promise<IUserModel> {
        const id = uuid.v4();
        return this.usersDao.createUser({
            id,
            ...user,
        });
    }

    public async getUserByUsername(username: string): Promise<IUserModel> {
        return this.usersDao.getUserByUsername(username);
    }

    // API usages, requester required for authorizations
    public async listLightUsers(requester: IRequester): Promise<IUserLightModel[]> {
        await this.authorizationsEnforcer.assertIsAdmin(requester);
        return this.usersDao.listUsersLight();
    }

    public async deleteUser(requester: IRequester, userId: string): Promise<void> {
        await this.authorizationsEnforcer.assertIsAdmin(requester);
        return this.usersDao.deleteUser(userId);
    }
}
