import { logger } from '../../logger';

export enum BRIG_ERROR_CODE {
    DB_OPERATION_ERROR = 1000,
    DB_NOT_FOUND = 1001,
    DB_DUPLICATE = 1002,
}

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
