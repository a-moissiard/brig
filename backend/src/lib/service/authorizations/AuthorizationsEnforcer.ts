import * as _ from 'lodash';

import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';
import { UsersDao } from '../users';
import { BYPASS_REQUESTER, IRequester } from './RequesterTypes';

interface IAuthorizationsEnforcerDependencies {
    usersDao: UsersDao;
}

export class AuthorizationsEnforcer {
    private readonly usersDao: UsersDao;

    constructor(deps: IAuthorizationsEnforcerDependencies) {
        this.usersDao = deps.usersDao;
    }
    
    public async assertIsAdmin(requester: IRequester): Promise<void> {
        if (requester.id === BYPASS_REQUESTER) {
            return;
        }
        const user = await this.usersDao.getUser(requester.id);
        if(_.isUndefined(user.admin) || !user.admin) {
            throw new BrigError(BRIG_ERROR_CODE.AUTH_USER_MUST_BE_ADMIN, 'Forbidden');
        }
    }
}
