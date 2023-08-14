import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';

import { IUser } from '../../../types/users/UsersTypes';
import TopBar from '../../lib/topBar/TopBar';

interface IManageServersPageProps {
    user?: IUser;
}

const ManageServersPage: FunctionComponent<IManageServersPageProps> = ({ user }) => {
    const navigate = useNavigate();
    if (!user) {
        navigate('/auth');
    }

    return <>
        {user && (<TopBar user={user}/>)}
        Servers
    </>;
};

export default ManageServersPage;
