import * as uuid from 'uuid';

import { IRequester } from '../authorizations';
import { UsersAuthorizationsEnforcer } from './UsersAuthorizationsEnforcer';
import { UsersDao } from './UsersDao';
import { IUserCreateModel, IUserLightModel, IUserModel } from './UsersTypes';

interface IUsersServiceDependencies {
    usersDao: UsersDao;
    usersAuthorizationsEnforcer: UsersAuthorizationsEnforcer;
}

export class UsersService {
    private readonly usersDao: UsersDao;
    private readonly usersAuthorizationsEnforcer: UsersAuthorizationsEnforcer;

    constructor(deps: IUsersServiceDependencies) {
        this.usersDao = deps.usersDao;
        this.usersAuthorizationsEnforcer = deps.usersAuthorizationsEnforcer;
    }

    // Internal usages, no need for requester
    public async createUser(user: IUserCreateModel): Promise<IUserModel> {
        const id = uuid.v4();
        return this.usersDao.createUser({
            id,
            ...user,
        });
    }

    public async getUser(userId: string): Promise<IUserModel> {
        return this.usersDao.getUser(userId);
    }

    public async getUserByUsername(username: string): Promise<IUserModel> {
        return this.usersDao.getUserByUsername(username);
    }

    // API usages, requester required for authorizations
    public async listLightUsers(requester: IRequester): Promise<IUserLightModel[]> {
        await this.usersAuthorizationsEnforcer.assertIsAdmin(requester);
        return this.usersDao.listUsersLight();
    }

    public async deleteUser(requester: IRequester, userId: string): Promise<void> {
        await this.usersAuthorizationsEnforcer.assertIsAdmin(requester);
        return this.usersDao.deleteUser(userId);
    }
}
