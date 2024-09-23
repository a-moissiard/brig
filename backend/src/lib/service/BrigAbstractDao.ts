import {
    Collection,
    CreateIndexesOptions,
    Document,
    Filter,
    FindOneAndUpdateOptions,
    FindOptions,
    IndexSpecification,
    InsertOneResult,
    MongoServerError,
    UpdateFilter,
    UpdateOptions,
    UpdateResult,
    WithId,
} from 'mongodb';

import { logger } from '../logger';
import { BRIG_ERROR_CODE, BrigError } from '../utils/error';
import { IMongoConnectionManager } from '../utils/mongo';

interface IBrigAbstractDaoDependencies {
    mongoConnectionManager: IMongoConnectionManager;
    collectionName: string;
    elementName: string;
}

export abstract class BrigAbstractDao<T extends Document = Document> {
    private readonly mongoConnectionManager: IMongoConnectionManager;
    private readonly collectionName: string;
    private readonly elementName: string;

    protected constructor(deps: IBrigAbstractDaoDependencies) {
        this.mongoConnectionManager = deps.mongoConnectionManager;
        this.collectionName = deps.collectionName;
        this.elementName = deps.elementName;
    }

    protected async createIndexes(indexSpecs: IndexSpecification[], options?: CreateIndexesOptions): Promise<void> {
        await Promise.all(indexSpecs.map(async indexSpec => await this.getCollection().createIndex(indexSpec, options)));
        logger.verbose(`[MONGO] Indexes created for collection ${this.collectionName}`);
    }

    protected async get(filter: Filter<T>, findOptions?: FindOptions): Promise<T> {
        const document = await this.getCollection().findOne(filter, findOptions);
        if (!document) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `${this.elementName} not found with filter=${JSON.stringify(filter)}`, {
                publicMessage: `${this.elementName} not found`,
            });
        }
        return document;
    }
    
    protected async list(filter: Filter<T> = {}, findOptions?: FindOptions): Promise<WithId<T>[]> {
        return this.getCollection().find(filter, findOptions).toArray();
    }

    protected async insert(data: T): Promise<T> {
        let insertionResult: InsertOneResult<T> | null;
        try {
            insertionResult = await this.getCollection().insertOne(data as any);
        } catch (e) {
            if (e instanceof MongoServerError && e.code === 11000) {
                throw new BrigError(BRIG_ERROR_CODE.DB_DUPLICATE, `${this.elementName} insertion failed because duplicate element exists`, {
                    cause: e.stack,
                });
            }
            throw e;
        }
        if (!insertionResult.acknowledged) {
            throw new BrigError(BRIG_ERROR_CODE.DB_OPERATION_ERROR, `${this.elementName} insertion failed`);
        }
        return data;
    }

    protected async update(filter: Filter<T>, update: UpdateFilter<T>, options?: FindOneAndUpdateOptions): Promise<WithId<T>> {
        let updatedDocument: WithId<T> | null;
        try {
            updatedDocument = (await this.getCollection().findOneAndUpdate(filter, update, options)).value;
        } catch (e) {
            if (e instanceof MongoServerError && e.code === 11000) {
                throw new BrigError(BRIG_ERROR_CODE.DB_DUPLICATE, `${this.elementName} update failed because duplicate element exists`, {
                    cause: e.stack,
                });
            }
            throw e;
        }
        if (!updatedDocument) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `${this.elementName} not found with filter=${JSON.stringify(filter)}`, {
                publicMessage: `${this.elementName} not found`,
            });
        }
        return updatedDocument;
    }

    protected async updateMany(filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<void> {
        let updateResult: UpdateResult<T>;
        try {
            updateResult = await this.getCollection().updateMany(filter, update, options);
        } catch (e) {
            if (e instanceof MongoServerError && e.code === 11000) {
                throw new BrigError(BRIG_ERROR_CODE.DB_DUPLICATE, `${this.elementName} update many failed because duplicate element exists`, {
                    cause: e.stack,
                });
            }
            throw e;
        }
        if (!updateResult.acknowledged) {
            throw new BrigError(BRIG_ERROR_CODE.DB_UPDATE_ERROR, 'Update many operation did not succeed');
        }
    }

    protected async delete(filter: Filter<T>): Promise<void> {
        const deletedDocument = (await this.getCollection().findOneAndDelete(filter)).value;
        if (!deletedDocument) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `${this.elementName} not found with filter=${JSON.stringify(filter)}`, {
                publicMessage: `${this.elementName} not found`,
            });
        }
    }

    private getCollection(): Collection<T> {
        return this.mongoConnectionManager.db.collection(this.collectionName);
    }
}
