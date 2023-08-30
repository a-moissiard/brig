import { FunctionComponent, ReactElement } from 'react';

import { selectUser } from '../../../redux/features/user/userSlice';
import { useAppSelector } from '../../../redux/hooks';
import { IUser } from '../../../types/users/UsersTypes';

interface PageGuardProps {
    verify: (user?: IUser) => boolean;
    guardedChildren: ReactElement;
    fallbackChildren: ReactElement;
}

const PageGuard: FunctionComponent<PageGuardProps> = ({
    verify,
    guardedChildren,
    fallbackChildren,
}) => {
    const user = useAppSelector(selectUser);
    
    return verify(user)
        ? guardedChildren
        : fallbackChildren;
};

export default PageGuard;
