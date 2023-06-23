import * as _ from 'lodash';

import { BRIG_ERROR_CODE, BrigError } from '../../utils/error';
import { UsersDao } from '../users';
import { BYPASS_REQUESTER, IRequester } from './RequesterTypes';

interface IBrigAbstractAuthorizationsEnforcerDependencies {
    usersDao: UsersDao;
}

export abstract class BrigAbstractAuthorizationsEnforcer {
    private readonly usersDao: UsersDao;

    protected constructor(deps: IBrigAbstractAuthorizationsEnforcerDependencies) {
        this.usersDao = deps.usersDao;
    }

    private async isAdmin(requester: IRequester): Promise<boolean> {
        if (requester.id === BYPASS_REQUESTER) {
            return true;
        }
        const user = await this.usersDao.getUser(requester.id);
        return !_.isUndefined(user.admin) && user.admin;
    }
    
    public async assertIsAdmin(requester: IRequester): Promise<void> {
        if(!(await this.isAdmin(requester))) {
            throw new BrigError(BRIG_ERROR_CODE.AUTHORIZATIONS_USER_MUST_BE_ADMIN,
                `User ${requester.username}=${requester.id} is not admin`,
                { publicMessage: 'Forbidden' },
            );
        }
    }

    protected async assertCanManageResource(requester: IRequester, resourceId: string, resourceOwnerId: string, resourceAlias: string): Promise<void> {
        if((await this.isAdmin(requester))) {
            // If user is admin, they can manage resource
            return;
        } else {
            // If user isn't admin, ensure they own the resource
            if (resourceOwnerId === requester.id) {
                return;
            } else {
                // If user can't manage resource, they shouldn't know that this resource exists
                throw new BrigError(BRIG_ERROR_CODE.AUTHORIZATIONS_FORBIDDEN_RESOURCE,
                    `User ${requester.username}=${requester.id} isn't authorized to access ${resourceAlias}=${resourceId}`,
                    { publicMessage: `${resourceAlias} not found` },
                );
            }
        }
    }
}
