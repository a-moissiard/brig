import { Schema } from 'express-validator';

import { IServerSlot } from '../../service/ftpServers';
import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';

export interface IConnectBody {
    slot: IServerSlot;
    password: string;
}

export interface IListBody {
    path?: string;
}

export type ICreateDirBody = {
    path: string;
};
export type IDeleteBody = ICreateDirBody;
export type ITransferBody = ICreateDirBody;

export const connectBodySchema: Schema = {
    slot: {
        in: 'body',
        isIn: {
            options: [['slotOne', 'slotTwo']],
            errorMessage: 'body is expected to contain `slot` parameter which must be equal to \'slotOne\' or \'slotTwo\'',
        },
    },
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

export const deleteBodySchema = createDirBodySchema;

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
