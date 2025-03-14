import { logger } from '../../logger';

export enum BRIG_ERROR_CODE {
    VALIDATION_ERROR = 1000,

    DB_OPERATION_ERROR = 2000,
    DB_NOT_FOUND = 2001,
    DB_DUPLICATE = 2002,
    DB_UPDATE_ERROR = 2003,

    AUTH_REGISTRATION_CLOSED = 3000,
    AUTH_INVALID_CREDENTIALS = 3001,
    AUTH_USER_NOT_LOGGED_IN = 3002,
    AUTH_REFRESH_TOKEN_ALREADY_REVOKED = 3003,
    AUTH_REFRESH_TOKEN_NOT_ACTIVE = 3004,

    AUTHORIZATIONS_USER_MUST_BE_ADMIN = 4000,
    AUTHORIZATIONS_FORBIDDEN_RESOURCE = 4001,

    FTP_UNKNOWN_ERROR = 5000,
    FTP_NOT_LOGGED_IN = 5001,
    FTP_INVALID_CREDENTIALS = 5002,
    FTP_CLIENT_SLOT_ALREADY_BUSY = 5003,
    FTP_PATH_DOES_NOT_EXIST = 5005,
    FTP_UNSUPPORTED_FILE_TYPE = 5006,
    FTP_NO_STATE = 5007,

    STREAM_CLOSED_WITH_ERROR = 10000,
}

export const ERROR_CODES_TO_HTTP_STATUS_CODES: {[K in BRIG_ERROR_CODE]: number} = {
    [BRIG_ERROR_CODE.VALIDATION_ERROR]: 400,

    [BRIG_ERROR_CODE.DB_OPERATION_ERROR]: 500,
    [BRIG_ERROR_CODE.DB_NOT_FOUND]: 404,
    [BRIG_ERROR_CODE.DB_DUPLICATE]: 409,
    [BRIG_ERROR_CODE.DB_UPDATE_ERROR]: 500,

    [BRIG_ERROR_CODE.AUTH_REGISTRATION_CLOSED]: 405,
    [BRIG_ERROR_CODE.AUTH_INVALID_CREDENTIALS]: 401,
    [BRIG_ERROR_CODE.AUTH_USER_NOT_LOGGED_IN]: 401,
    [BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_ALREADY_REVOKED]: 401,
    [BRIG_ERROR_CODE.AUTH_REFRESH_TOKEN_NOT_ACTIVE]: 401,

    [BRIG_ERROR_CODE.AUTHORIZATIONS_USER_MUST_BE_ADMIN]: 403,
    [BRIG_ERROR_CODE.AUTHORIZATIONS_FORBIDDEN_RESOURCE]: 404, // If user cannot access resource, they don't need to know that this resource exist

    [BRIG_ERROR_CODE.FTP_UNKNOWN_ERROR]: 500,
    [BRIG_ERROR_CODE.FTP_NOT_LOGGED_IN]: 401,
    [BRIG_ERROR_CODE.FTP_INVALID_CREDENTIALS]: 401,
    [BRIG_ERROR_CODE.FTP_CLIENT_SLOT_ALREADY_BUSY]: 500,
    [BRIG_ERROR_CODE.FTP_PATH_DOES_NOT_EXIST]: 404,
    [BRIG_ERROR_CODE.FTP_UNSUPPORTED_FILE_TYPE]: 501,
    [BRIG_ERROR_CODE.FTP_NO_STATE]: 500,

    [BRIG_ERROR_CODE.STREAM_CLOSED_WITH_ERROR]: 500,
};

interface IBrigErrorOptions extends ErrorOptions {
    publicMessage?: string;
    parseMessage?: boolean;
}

export class BrigError extends Error {
    public readonly code: BRIG_ERROR_CODE;
    public readonly options?: IBrigErrorOptions;
    
    constructor(code: BRIG_ERROR_CODE, message: string, options?: IBrigErrorOptions) {
        super(message, options);
        this.name = this.constructor.name;
        this.code = code;
        this.options = options;
        logger.debug(this.cause);
        logger.error(this.stack);
    }
}

export class TLSError extends Error {
    public readonly code!: string;
}

export const isTLSError = (error: any): error is TLSError => error instanceof Error && 'code' in error;
