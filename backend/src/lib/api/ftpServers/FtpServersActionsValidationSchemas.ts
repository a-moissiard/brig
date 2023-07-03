import { Schema } from 'express-validator';

interface IFtpServersActionsBaseBody {
    first: boolean;
}

export interface IConnectBody extends IFtpServersActionsBaseBody{
    password: string;
}

export type IDisconnectBody = IFtpServersActionsBaseBody;

export interface IListBody extends IFtpServersActionsBaseBody{
    path: string;
}

export type IPwdBody = IFtpServersActionsBaseBody;

const ftpServersActionsBaseBodySchema: Schema = {
    first: {
        in: 'body',
        isBoolean: true,
        errorMessage: 'body is expected to contain `first` parameter which must be a boolean value',
    },
};

export const connectBodySchema: Schema = {
    ...ftpServersActionsBaseBodySchema,
    password: {
        in: 'body',
        isString: true,
        errorMessage: 'body is expected to contain `password` parameter which must be a string value',
    },
};

export const disconnectBodySchema = ftpServersActionsBaseBodySchema;

export const listBodySchema: Schema = {
    ...ftpServersActionsBaseBodySchema,
    path: {
        in: 'body',
        isString: true,
        errorMessage: 'body is expected to contain `path` parameter which must be a string value',
    },
};

export const pwdBodySchema = ftpServersActionsBaseBodySchema;
