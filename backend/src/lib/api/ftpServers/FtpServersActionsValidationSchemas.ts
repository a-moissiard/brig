import { Schema } from 'express-validator';

export interface IConnectBody {
    password: string;
}

export interface IListBody {
    path: string;
}

export type ICreateDirBody = IListBody;

export const connectBodySchema: Schema = {
    password: {
        in: 'body',
        isString: true,
        errorMessage: 'body is expected to contain `password` parameter which must be a string',
    },
};

export const listBodySchema: Schema = {
    path: {
        in: 'body',
        isString: true,
        errorMessage: 'body is expected to contain `path` parameter which must be a string',
    },
};

export const createDirBodySchema = listBodySchema;
