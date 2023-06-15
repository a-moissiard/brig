import * as uuid from 'uuid';

import { UsersDao } from './UsersDao';
import { IUserCreateModel, IUserLightModel, IUserModel } from './UsersTypes';

interface IUsersServiceDependencies {
    usersDao: UsersDao;
}

export class UsersService {
    private readonly usersDao: UsersDao;

    constructor(deps: IUsersServiceDependencies) {
        this.usersDao = deps.usersDao;
    }

    public async listLightUsers(): Promise<IUserLightModel[]> {
        return this.usersDao.listUsersLight();
    }

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

    public async deleteUser(userId: string): Promise<void> {
        return this.usersDao.deleteUser(userId);
    }
}
