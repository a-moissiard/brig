import { logger } from '../logger';

export enum BRIG_ERROR_CODE {
    DB_NOT_FOUND = 1000,
    DB_DUPLICATE = 1001,
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
