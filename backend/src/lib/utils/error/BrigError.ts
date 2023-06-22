import { logger } from '../../logger';

export enum BRIG_ERROR_CODE {
    DB_OPERATION_ERROR = 1000,
    DB_NOT_FOUND = 1001,
    DB_DUPLICATE = 1002,

    AUTH_REGISTRATION_CLOSED = 2000,
    AUTH_INVALID_CREDENTIALS = 2001,
    AUTH_TOKEN_REVOKED = 2002,
    AUTH_USER_NOT_LOGGED_IN = 2003,
}

export const ERROR_CODES_TO_HTTP_STATUS_CODES: {[K in BRIG_ERROR_CODE]: number} = {
    [BRIG_ERROR_CODE.DB_OPERATION_ERROR]: 500,
    [BRIG_ERROR_CODE.DB_NOT_FOUND]: 404,
    [BRIG_ERROR_CODE.DB_DUPLICATE]: 409,

    [BRIG_ERROR_CODE.AUTH_REGISTRATION_CLOSED]: 405,
    [BRIG_ERROR_CODE.AUTH_INVALID_CREDENTIALS]: 401,
    [BRIG_ERROR_CODE.AUTH_TOKEN_REVOKED]: 401,
    [BRIG_ERROR_CODE.AUTH_USER_NOT_LOGGED_IN]: 401,
};

export class BrigError extends Error{
    public readonly code: BRIG_ERROR_CODE;
    constructor(code: BRIG_ERROR_CODE, message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = this.constructor.name;
        this.code = code;
        logger.debug(this.cause);
        logger.error(this.stack);
    }
}
