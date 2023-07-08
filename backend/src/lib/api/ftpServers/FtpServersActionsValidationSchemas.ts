import { Schema } from 'express-validator';

import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';

export interface IConnectBody {
    password: string;
}

export interface IListBody {
    path: string;
}

export type ICreateDirBody = IListBody;
export type ITransferBody = IListBody;

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
export const transferBodySchema: Schema = {
    path: {
        in: 'body',
        isString: true,
        custom: {
            options: (input: string) => {
                if (input.includes('/')) {
                    throw new BrigError(BRIG_ERROR_CODE.VALIDATION_ERROR, '\'path\' parameter must not contain \'/\' character');
                }
                return true;
            },
        },
        errorMessage: 'body is expected to contain `path` parameter which must be a string',
    },
};
