import { logger } from '../../logger';

export enum BRIG_ERROR_CODE {
    DB_OPERATION_ERROR = 1000,
    DB_NOT_FOUND = 1001,
    DB_DUPLICATE = 1002,

    AUTH_REGISTRATION_CLOSED = 2000,
    AUTH_INVALID_CREDENTIALS = 2001,
    AUTH_TOKEN_REVOKED = 2002,
    AUTH_USER_NOT_LOGGED_IN = 2003,

    AUTHORIZATIONS_USER_MUST_BE_ADMIN = 3000,
    AUTHORIZATIONS_FORBIDDEN_RESOURCE = 3001,
}

export const ERROR_CODES_TO_HTTP_STATUS_CODES: {[K in BRIG_ERROR_CODE]: number} = {
    [BRIG_ERROR_CODE.DB_OPERATION_ERROR]: 500,
    [BRIG_ERROR_CODE.DB_NOT_FOUND]: 404,
    [BRIG_ERROR_CODE.DB_DUPLICATE]: 409,

    [BRIG_ERROR_CODE.AUTH_REGISTRATION_CLOSED]: 405,
    [BRIG_ERROR_CODE.AUTH_INVALID_CREDENTIALS]: 401,
    [BRIG_ERROR_CODE.AUTH_TOKEN_REVOKED]: 401,
    [BRIG_ERROR_CODE.AUTH_USER_NOT_LOGGED_IN]: 401,

    [BRIG_ERROR_CODE.AUTHORIZATIONS_USER_MUST_BE_ADMIN]: 403,
    [BRIG_ERROR_CODE.AUTHORIZATIONS_FORBIDDEN_RESOURCE]: 404, // If user cannot access resource, they don't need to know that this resource exist
};

interface IBrigErrorOptions extends ErrorOptions {
    publicMessage?: string;
}

export class BrigError extends Error{
    public readonly code: BRIG_ERROR_CODE;
    public readonly publicMessage?: string;
    
    constructor(code: BRIG_ERROR_CODE, message: string, options?: IBrigErrorOptions) {
        super(message, options);
        this.name = this.constructor.name;
        this.code = code;
        this.publicMessage = options?.publicMessage;
        logger.debug(this.cause);
        logger.error(this.stack);
    }
}
