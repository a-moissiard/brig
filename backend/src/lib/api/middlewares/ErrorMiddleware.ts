import { NextFunction, Request, Response } from 'express';

import { BrigError, ERROR_CODES_TO_HTTP_STATUS_CODES } from '../../utils/error';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof BrigError) {
        const rawErrorMessage = err.options?.publicMessage ?? err.message;
        const errorMessage = err.options?.parseMessage ? JSON.parse(rawErrorMessage) : rawErrorMessage;
        res.status(ERROR_CODES_TO_HTTP_STATUS_CODES[err.code]).send({ error: errorMessage });
    } else {
        next(err);
    }
};
