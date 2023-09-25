import { Schema } from 'express-validator';

import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';

export interface IConnectBody {
    password: string;
}

export interface IListBody {
    path?: string;
}

export type ICreateDirBody = {
    path: string;
};
export type ITransferBody = ICreateDirBody;

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
        errorMessage: 'body can contain `path` parameter which must be a string if provided',
        optional: true,
    },
};

export const createDirBodySchema: Schema = {
    path: {
        in: 'body',
        isString: true,
        errorMessage: 'body is expected to contain `path` parameter which must be a string',
    },
};
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
