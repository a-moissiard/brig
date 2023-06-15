import { IMongoConnectionManager } from '../../utils/mongo';
import { BrigAbstractDao } from '../BrigAbstractDao';
import { IUserLightModel, IUserModel } from './UsersTypes';

interface IUserDb {
    id: string;
    username: string;
    hash: string;
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
        };
    }

    private static mapModelToDb(model: IUserModel): IUserDb {
        return {
            id: model.id,
            username: model.username,
            hash: model.hash,
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

    public async deleteUser(userId: string): Promise<void> {
        await this.delete({ id: userId });
    }
}
