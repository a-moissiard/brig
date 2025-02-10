import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { FunctionComponent, useState } from 'react';

import { useAppDispatch } from '../../../redux/hooks';
import { IUser } from '../../../types/users/UsersTypes';

import './userList.scss';

interface IUserListProps {
    userList: IUser[];
}

const UserList: FunctionComponent<IUserListProps> = ({ userList: _userList }) => {
    const dispatch = useAppDispatch();
    const [userList, setUserList] = useState<IUser[]>(() => (_userList));

    return <Card variant="outlined">
        <CardHeader title="Users"/>
        <CardContent className="userListContent">
            <div className="userListContent__subList">
                <Typography variant="h6">
                    Admins
                </Typography>
            </div>
            <div className="userListContent__subList">
                <Typography variant="h6">
                    Regular
                </Typography>
            </div>
        </CardContent>
    </Card>;
};

export default UserList;
