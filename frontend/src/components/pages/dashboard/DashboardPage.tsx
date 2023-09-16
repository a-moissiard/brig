import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { FunctionComponent, useEffect, useState } from 'react';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2, setServer } from '../../../redux/features/server/serverSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { IFtpServer } from '../../../types/ftpServers/FtpServersTypes';
import { CONNECTION_STATUS } from '../../../types/status/StatusTypes';
import ActivityCard from '../../lib/dashboard/activityCard/ActivityCard';
import ServerCard from '../../lib/dashboard/serverCard/ServerCard';
import Loader from '../../lib/loader/Loader';
import TopBar from '../../lib/topBar/TopBar';

import './dashboard.scss';

export interface IDashboardPageProps {}

const DashboardPage: FunctionComponent<IDashboardPageProps> = ({}) => {
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(true);

    const [downloading, setDownloading] = useState(false);
    const [serverList, setServerList] = useState<IFtpServer[]>([]);

    const server1Connection = useAppSelector(selectServer1);
    const server2Connection = useAppSelector(selectServer2);

    useEffect(() => {
        const controller = new AbortController();

        FtpServersApi.getFtpServers({ signal: controller.signal })
            .then((ftpServers) => {
                setServerList(ftpServers);
                if (!server1Connection && !server2Connection) {
                    FtpServersApi.getUserConnectedServers({ signal: controller.signal })
                        .then((userConnectedServers) => {
                            if (userConnectedServers[0]) {
                                dispatch(setServer({
                                    serverNumber: 1,
                                    data: {
                                        id: userConnectedServers[0].server.id,
                                        status: CONNECTION_STATUS.CONNECTED,
                                        workingDir: userConnectedServers[0].workingDir,
                                        fileList: userConnectedServers[0].files,
                                    },
                                }));
                            }
                            if (userConnectedServers[1]) {
                                dispatch(setServer({
                                    serverNumber: 2,
                                    data: {
                                        id: userConnectedServers[1].server.id,
                                        status: CONNECTION_STATUS.CONNECTED,
                                        workingDir: userConnectedServers[1].workingDir,
                                        fileList: userConnectedServers[1].files,
                                    },
                                }));
                            }
                        }).catch(() => {
                            setLoading(false);
                        });
                }
                setLoading(false);
            }).catch(() => {
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
