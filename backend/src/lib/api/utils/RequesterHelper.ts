import { Request } from 'express';

import { IRequester } from '../../service/authorizations';
import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';

export const buildRequester = (req: Request): IRequester => {
    if (!req.isAuthenticated()) {
        throw new BrigError(BRIG_ERROR_CODE.AUTH_USER_NOT_LOGGED_IN, 'User logged out, authentication required');
    }
    return {
        id: req.user.id,
        username: req.user.username,
    };
};
