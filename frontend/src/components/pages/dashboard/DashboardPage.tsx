import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';

import { IUser } from '../../../types/users/UsersTypes';
import TopBar from '../../lib/topBar/TopBar';

export interface IDashboardPageProps {
    user?: IUser;
}

const DashboardPage: FunctionComponent<IDashboardPageProps> = ({ user }) => {
    const navigate = useNavigate();
    if (!user) {
        navigate('/auth');
    }

    return <>
        {user && (<TopBar user={user}/>)}
        Dashboard
    </>;
};

export default DashboardPage;
