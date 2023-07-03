import { Handler } from 'express';
import { matchedData, validationResult } from 'express-validator';
import { Request } from 'express-validator/src/base';
import { MatchedDataOptions } from 'express-validator/src/matched-data';

import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';

export const validate: Handler = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return next(new BrigError(BRIG_ERROR_CODE.VALIDATION_ERROR, `Validation error: ${JSON.stringify(result.mapped())}`, {
            publicMessage: JSON.stringify(result.mapped()),
            parseMessage: true,
        }));
    }
    next();
};

export const extractValidatedData = <T>(req: Request, options?: Partial<MatchedDataOptions>) : T => matchedData(req, options) as T;
