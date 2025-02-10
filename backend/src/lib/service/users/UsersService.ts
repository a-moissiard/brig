import * as uuid from 'uuid';

import { IRequester } from '../authorizations';
import { UsersAuthorizationsEnforcer } from './UsersAuthorizationsEnforcer';
import { UsersDao } from './UsersDao';
import { IUserCreateModel, IUserModel, IUserWithHashModel } from './UsersTypes';

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

    public async createUser(user: IUserCreateModel): Promise<IUserWithHashModel> {
        const id = uuid.v4();
        return this.usersDao.createUser({
            id,
            ...user,
        });
    }

    public async listUsers(requester: IRequester): Promise<IUserModel[]> {
        await this.usersAuthorizationsEnforcer.assertIsAdmin(requester);
        return this.usersDao.listUser();
    }

    public async getUser(userId: string): Promise<IUserModel> {
        return this.usersDao.getUser(userId);
    }

    public async getUserWithHashByUsername(username: string): Promise<IUserWithHashModel> {
        return this.usersDao.getUserWithHashByUsername(username);
    }

    public async deleteUser(requester: IRequester, userId: string): Promise<void> {
        await this.usersAuthorizationsEnforcer.assertIsAdmin(requester);
        return this.usersDao.deleteUser(userId);
    }
}
