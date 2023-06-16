import { NextFunction, Request, Response } from 'express';

import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof BrigError) {
        switch (err.code) {
            case BRIG_ERROR_CODE.DB_NOT_FOUND:
                res.status(404);
                break;
            case BRIG_ERROR_CODE.DB_DUPLICATE:
                res.status(409);
                break;
            case BRIG_ERROR_CODE.DB_OPERATION_ERROR:
                res.status(500);
                break;
            case BRIG_ERROR_CODE.AUTH_INVALID_CREDENTIALS:
            case BRIG_ERROR_CODE.AUTH_TOKEN_REVOKED:
                res.status(401);
                break;
            default:
                res.status(400);
                break;
        }
        res.send({ error: err.message });
    } else {
        next(err);
    }
};
