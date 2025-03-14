import { Schema } from 'express-validator';

export const ftpServersCreateBodySchema: Schema = {
    alias: {
        in: 'body',
        isString: true,
        errorMessage: 'body is expected to contain `alias` parameter which must be a string',
    },
    host: {
        in: 'body',
        isString: true,
        errorMessage: 'body is expected to contain `host` parameter which must be a string',
    },
    port: {
        in: 'body',
        isNumeric: true,
        errorMessage: 'body is expected to contain `port` parameter which must be a number',
    },
    username: {
        in: 'body',
        isString: true,
        errorMessage: 'body is expected to contain `username` parameter which must be a string',
    },
    secure: {
        in: 'body',
        isBoolean: true,
        errorMessage: 'body is expected to contain `secure` parameter which must be a boolean',
    },
};

export const ftpServersUpdateBodySchema: Schema = {
    alias: {
        in: 'body',
        isString: true,
        optional: true,
        errorMessage: 'if body contains `alias` parameter, it must be a string',
    },
    host: {
        in: 'body',
        isString: true,
        optional: true,
        errorMessage: 'if body contains `host` parameter, it must be a string',
    },
    port: {
        in: 'body',
        isNumeric: true,
        optional: true,
        errorMessage: 'if body contains `port` parameter, it must be a number',
    },
    username: {
        in: 'body',
        isString: true,
        optional: true,
        errorMessage: 'if body contains `username` parameter, it must be a string',
    },
};
