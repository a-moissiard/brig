import * as _ from 'lodash';

import { IMongoConnectionManager } from '../../utils/mongo';
import { BrigAbstractDao } from '../BrigAbstractDao';
import { IUserLightModel, IUserModel, IUserUpdateModel } from './UsersTypes';

interface IUserDb {
    id: string;
    username: string;
    hash: string;
    salt: string;
}

interface IUsersDaoDependencies {
    mongoConnectionManager: IMongoConnectionManager;
}

export class UsersDao extends BrigAbstractDao<IUserDb> {
    public static readonly collectionName = 'users';

    constructor(deps: IUsersDaoDependencies) {
        super({ mongoConnectionManager: deps.mongoConnectionManager, collectionName: UsersDao.collectionName });
    }

    private static mapDbToModelLight(db: IUserDb): IUserLightModel {
        return {
            id: db.id,
            username: db.username,
        };
    }

    private static mapDbToModel(db: IUserDb): IUserModel {
        return {
            ...UsersDao.mapDbToModelLight(db),
            hash: db.hash,
            salt: db.salt,
        };
    }

    private static mapModelToDb(model: IUserModel): IUserDb {
        return {
            id: model.id,
            username: model.username,
            hash: model.hash,
            salt: model.salt,
        };
    }

    public async init(): Promise<void> {
        await this.createIndexes([
            {
                id: 1,
            },
            {
                username: 1,
            },
        ], {
            unique: true,
        });
    }

    public async getUserByUsername(username: string): Promise<IUserModel> {
        return UsersDao.mapDbToModel(await this.get({ username }));
    }

    public async listUsersLight(): Promise<IUserLightModel[]> {
        return (await this.list()).map(UsersDao.mapDbToModelLight);
    }

    public async createUser(user: IUserModel): Promise<IUserModel> {
        return UsersDao.mapDbToModel(await this.insert(UsersDao.mapModelToDb(user)));
    }

    public async updateUser(userId: string, user: IUserUpdateModel): Promise<IUserModel> {
        return UsersDao.mapDbToModel(await this.update({ id: userId }, {
            $set: _.omitBy({
                username: user.username,
                hash: user.hash,
                salt: user.salt,
            }, _.isUndefined),
        }, {
            returnDocument: 'after',
        }));
    }

    public async deleteUser(userId: string): Promise<void> {
        await this.delete({ id: userId });
    }
}
