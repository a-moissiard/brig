import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';
import { IMongoConnectionManager } from '../../utils/mongo';
import { BrigAbstractDao } from '../BrigAbstractDao';
import { IUserAuthTokenInfoModel, IUserAuthTokensModel } from './UserAuthTokensTypes';

interface IUserAuthTokenInfoDb {
    tokenId: string;
    expirationDate: number;
}

interface IUserAuthTokensDb {
    userId: string;
    activeRefreshTokenInfos: IUserAuthTokenInfoDb[];
    revokedRefreshTokenInfos: IUserAuthTokenInfoDb[];
}

interface IUserAuthTokensDaoDependencies {
    mongoConnectionManager: IMongoConnectionManager;
}

export class UserAuthTokensDao extends BrigAbstractDao<IUserAuthTokensDb>{
    public static readonly collectionName = 'userAuthTokens';
    public static readonly elementName = 'User\'s auth refresh tokens';

    constructor(deps: IUserAuthTokensDaoDependencies) {
        super({ mongoConnectionManager: deps.mongoConnectionManager, collectionName: UserAuthTokensDao.collectionName, elementName: UserAuthTokensDao.elementName });
    }

    private static mapDbToModel(db: IUserAuthTokensDb): IUserAuthTokensModel {
        return {
            userId: db.userId,
            activeRefreshTokenInfos: db.activeRefreshTokenInfos.map(UserAuthTokensDao.mapTokenInfoDbToModel),
            revokedRefreshTokenInfos: db.revokedRefreshTokenInfos.map(UserAuthTokensDao.mapTokenInfoDbToModel),
        };
    }

    private static mapTokenInfoDbToModel(db: IUserAuthTokenInfoDb): IUserAuthTokenInfoModel {
        return {
            tokenId: db.tokenId,
            expirationDate: db.expirationDate,
        };
    }

    private static mapModelToDb(model: IUserAuthTokensModel): IUserAuthTokensDb {
        return {
            userId: model.userId,
            activeRefreshTokenInfos: model.activeRefreshTokenInfos.map(UserAuthTokensDao.mapTokenInfoModelToDb),
            revokedRefreshTokenInfos: model.revokedRefreshTokenInfos.map(UserAuthTokensDao.mapTokenInfoModelToDb),
        };
    }

    private static mapTokenInfoModelToDb(model: IUserAuthTokenInfoModel): IUserAuthTokenInfoDb {
        return {
            tokenId: model.tokenId,
            expirationDate: model.expirationDate,
        };
    }

    public async init(): Promise<void> {
        await this.createIndexes([
            {
                userId: 1,
            },
        ], {
            unique: true,
        });
    }

    public async getUserAuthTokensDocument(userId: string): Promise<IUserAuthTokensModel> {
        return UserAuthTokensDao.mapDbToModel(await this.get({ userId }));
    }

    public async storeRefreshTokenInfo(userId: string, tokenInfo: IUserAuthTokenInfoModel): Promise<IUserAuthTokensModel> {
        try {
            await this.getUserAuthTokensDocument(userId);
        } catch (e) {
            if (e instanceof BrigError && e.code === BRIG_ERROR_CODE.DB_NOT_FOUND) {
                return UserAuthTokensDao.mapDbToModel(await this.createUserAuthTokensDocument({
                    userId,
                    activeRefreshTokenInfos: [UserAuthTokensDao.mapTokenInfoModelToDb(tokenInfo)],
                    revokedRefreshTokenInfos: [],
                }));
            }
            throw e;
        }
        return UserAuthTokensDao.mapDbToModel(await this.update({ userId }, {
            $push: { activeRefreshTokenInfos: UserAuthTokensDao.mapTokenInfoModelToDb(tokenInfo) },
        }));
    }

    public async revokeRefreshToken(userId: string, tokenId: string): Promise<IUserAuthTokensModel> {
        const userAuthTokens = await this.getUserAuthTokensDocument(userId);
        const tokenInfo = userAuthTokens.activeRefreshTokenInfos.find(token => token.tokenId === tokenId);
        if (!tokenInfo) {
            throw new BrigError(BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_NOT_ACTIVE, 'Refresh token not active');
        }
        return UserAuthTokensDao.mapDbToModel(await this.update({ userId }, {
            $pull: { activeRefreshTokenInfos: { tokenId: { $eq: tokenId } } },
            $push: { revokedRefreshTokenInfos: { tokenId, expirationDate: tokenInfo.expirationDate } },
        }, {
            returnDocument: 'after',
        }));
    }

    private async createUserAuthTokensDocument(entry: IUserAuthTokensModel): Promise<IUserAuthTokensModel> {
        return UserAuthTokensDao.mapDbToModel(await this.insert(UserAuthTokensDao.mapModelToDb(entry)));
    }
}
