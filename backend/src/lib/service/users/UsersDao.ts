import { IMongoConnectionManager } from '../../utils/mongo';
import { BrigAbstractDao } from '../BrigAbstractDao';
import { IUserLightModel, IUserModel } from './UsersTypes';

interface IUserDb {
    id: string;
    username: string;
    hash: string;
    admin?: boolean;
}

interface IUsersDaoDependencies {
    mongoConnectionManager: IMongoConnectionManager;
}

export class UsersDao extends BrigAbstractDao<IUserDb> {
    private static readonly collectionName = 'users';
    private static readonly elementName = 'User';

    constructor(deps: IUsersDaoDependencies) {
        super({ mongoConnectionManager: deps.mongoConnectionManager, collectionName: UsersDao.collectionName, elementName: UsersDao.elementName });
    }

    private static mapDbToModelLight(db: IUserDb): IUserLightModel {
        return {
            id: db.id,
            username: db.username,
            admin: db.admin,
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
            // We do not map 'admin' on purpose, as we never want to set an admin value from the code
            // To change admin value, manipulate your db
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

    public async getUser(userId: string): Promise<IUserModel> {
        return UsersDao.mapDbToModel(await this.get({ id: userId }));
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
