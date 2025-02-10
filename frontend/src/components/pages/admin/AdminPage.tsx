import Grid from '@mui/material/Grid2';
import { FunctionComponent, useEffect, useState } from 'react';

import { UsersApi } from '../../../api/users/UsersApi';
import { IUser } from '../../../types/users/UsersTypes';
import LoadingBox from '../../lib/loadingBox/LoadingBox';
import TopBar from '../../modules/topBar/TopBar';
import UserList from '../../modules/userList/UserList';

const AdminPage: FunctionComponent = () => {
    const [loading, setLoading] = useState(true);

    const [userList, setUserList] = useState<IUser[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchState = async (): Promise<void> => {
            const userList = await UsersApi.listUsers({ signal: controller.signal });

            setUserList(userList);
        };

        fetchState().catch(() => {}).finally(() => setLoading(false));

        return () => controller.abort();
    }, []);

    return <>
        <TopBar/>
        <LoadingBox loading={loading} withMargin>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <UserList userList={userList}/>
                </Grid>
            </Grid>
        </LoadingBox>
    </>;
};

export default AdminPage;
