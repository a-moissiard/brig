import { IMongoConnectionManager } from '../../utils/mongo';
import { BrigAbstractDao } from '../BrigAbstractDao';
import { IUserModel, IUserWithHashModel } from './UsersTypes';

interface IUserDb {
    id: string;
    username: string;
    hash: string;
    admin: boolean;
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

    private static mapDbToModel(db: IUserDb): IUserModel {
        return {
            id: db.id,
            username: db.username,
            admin: db.admin,
        };
    }

    private static mapDbToModelWithHash(db: IUserDb): IUserWithHashModel {
        return {
            ...this.mapDbToModel(db),
            hash: db.hash,
        };
    }

    private static mapModelWithHashToDb(model: IUserWithHashModel): IUserDb {
        return {
            id: model.id,
            username: model.username,
            hash: model.hash,
            admin: model.admin,
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

    public async createUser(user: IUserWithHashModel): Promise<IUserWithHashModel> {
        return UsersDao.mapDbToModelWithHash(await this.insert(UsersDao.mapModelWithHashToDb(user)));
    }

    public async listUser(): Promise<IUserModel[]> {
        return (await this.list()).map(UsersDao.mapDbToModel);
    };

    public async getUser(userId: string): Promise<IUserModel> {
        return UsersDao.mapDbToModel(await this.get({ id: userId }));
    }

    public async getUserWithHashByUsername(username: string): Promise<IUserWithHashModel> {
        return UsersDao.mapDbToModelWithHash(await this.get({ username }));
    }

    public async deleteUser(userId: string): Promise<void> {
        await this.delete({ id: userId });
    }
}
