import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { FunctionComponent, useEffect, useState } from 'react';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { IFtpServer } from '../../../types/ftpServers/FtpServersTypes';
import ActivityCard from '../../lib/dashboard/activityCard/ActivityCard';
import ServerCard from '../../lib/dashboard/serverCard/ServerCard';
import Loader from '../../lib/loader/Loader';
import TopBar from '../../lib/topBar/TopBar';

import './dashboard.scss';

export interface IDashboardPageProps {}

const DashboardPage: FunctionComponent<IDashboardPageProps> = ({}) => {
    const [loading, setLoading] = useState(true);

    const [downloading, setDownloading] = useState(false);
    const [serverList, setServerList] = useState<IFtpServer[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        FtpServersApi.getFtpServers({ signal: controller.signal })
            .then((list) => {
                setServerList(list);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    return <Box>
        <TopBar/>
        <Box component="main" className="main">
            {loading ? (
                <Container maxWidth='xs' className='loaderContainer'>
                    <Loader loading={loading} size={100} />
                </Container>
            ) : (
                <Grid container spacing={4}>
                    <Grid xs={12}>
                        <ActivityCard downloading={downloading} />
                    </Grid>
                    <Grid xs={12} lg={5.5}>
                        <ServerCard serverNumber={1} ftpServerList={serverList}/>
                    </Grid>
                    <Grid xs={12} lg={1}>
                        {/* TODO: insert transfer buttons here */}
                    </Grid>
                    <Grid xs={12} lg={5.5}>
                        <ServerCard serverNumber={2} ftpServerList={serverList}/>
                    </Grid>
                </Grid>
            )}
        </Box>
    </Box>;
};

export default DashboardPage;
