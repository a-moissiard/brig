import { Collection, CreateIndexesOptions, Document, FindOptions, IndexSpecification, InsertOneResult, MongoServerError, WithId } from 'mongodb';

import { logger } from '../logger';
import { BRIG_ERROR_CODE, BrigError } from '../utils/error';
import { IMongoConnectionManager } from '../utils/mongo';

interface IBrigAbstractDaoDependencies {
    mongoConnectionManager: IMongoConnectionManager;
    collectionName: string;
}

export abstract class BrigAbstractDao<T extends Document = Document> {
    private readonly mongoConnectionManager: IMongoConnectionManager;
    private readonly collectionName: string;

    protected constructor(deps: IBrigAbstractDaoDependencies) {
        this.mongoConnectionManager = deps.mongoConnectionManager;
        this.collectionName = deps.collectionName;
    }

    protected async createIndexes(indexSpecs: IndexSpecification[], options?: CreateIndexesOptions): Promise<void> {
        await Promise.all(indexSpecs.map(async indexSpec => await this.getCollection().createIndex(indexSpec, options)));
        logger.verbose(`[MONGO] Indexes created for collection ${this.collectionName}`);
    }

    protected async get(filter: object, findOptions?: FindOptions): Promise<T> {
        const document = await this.getCollection().findOne(filter, findOptions);
        if (!document) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `Element not found with filter=${JSON.stringify(filter)}`);
        }
        return document;
    }
    protected async list(): Promise<WithId<T>[]> {
        return this.getCollection().find().toArray();
    }
    protected async insert(data: T): Promise<T> {
        let insertionResult: InsertOneResult<T> | null;
        try {
            insertionResult = await this.getCollection().insertOne(data as any);
        } catch (e) {
            if (e instanceof MongoServerError && e.code === 11000) {
                throw new BrigError(BRIG_ERROR_CODE.DB_DUPLICATE, 'Insertion failed because duplicate element exists', {
                    cause: e.stack,
                });
            }
            throw e;
        }
        if (!insertionResult.acknowledged) {
            throw new BrigError(BRIG_ERROR_CODE.DB_OPERATION_ERROR, 'Insertion failed');
        }
        return data;
    }

    protected async update(filter: object, data: Partial<T>): Promise<WithId<T>> {
        let updatedDocument: WithId<T> | null;
        try {
            updatedDocument = (await this.getCollection().findOneAndUpdate(filter, {
                $set: { ...data },
            }, {
                returnDocument: 'after',
            })).value;
        } catch (e) {
            if (e instanceof MongoServerError && e.code === 11000) {
                throw new BrigError(BRIG_ERROR_CODE.DB_DUPLICATE, 'Update failed because duplicate element exists', {
                    cause: e.stack,
                });
            }
            throw e;
        }
        if (!updatedDocument) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `Element not found with filter=${JSON.stringify(filter)}`);
        }
        return updatedDocument;
    }

    protected async delete(filter: object): Promise<void> {
        const deletedDocument = (await this.getCollection().findOneAndDelete(filter)).value;
        if (!deletedDocument) {
            throw new BrigError(BRIG_ERROR_CODE.DB_NOT_FOUND, `Element not found with filter=${JSON.stringify(filter)}`);
        }
    }

    private getCollection(): Collection<T> {
        return this.mongoConnectionManager.db.collection(this.collectionName);
    }
}
