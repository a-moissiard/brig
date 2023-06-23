import { BrigAbstractAuthorizationsEnforcer } from '../authorizations';
import { UsersDao } from '../users';

interface IUsersAuthorizationsEnforcerDependencies {
    usersDao: UsersDao;
}

export class UsersAuthorizationsEnforcer extends BrigAbstractAuthorizationsEnforcer {
    constructor(deps: IUsersAuthorizationsEnforcerDependencies) {
        super(deps);
    }
}
