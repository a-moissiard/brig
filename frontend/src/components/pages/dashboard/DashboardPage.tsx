import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { FunctionComponent, useEffect, useState } from 'react';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2, setServer } from '../../../redux/features/serverConnections/serverConnectionsSlice';
import { setActivity } from '../../../redux/features/transferActivity/transferActivitySlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { IFileInfo } from '../../../types/ftpServers/FileInfoTypes';
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

    const [serverList, setServerList] = useState<IFtpServer[]>([]);

    const server1Connection = useAppSelector(selectServer1);
    const server2Connection = useAppSelector(selectServer2);

    const onTransfer = async (serverNumber: 1 | 2, file: IFileInfo): Promise<void> => {
        if (server1Connection && server2Connection) {
            if (serverNumber === 1) {
                await FtpServersApi.transfer(server1Connection.id, file.name, server2Connection.id);
            } else {
                await FtpServersApi.transfer(server2Connection.id, file.name, server1Connection.id);
            }
            dispatch(setActivity({
                originServer: serverNumber,
                name: file.name,
            }));
        }
    };

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
                        <ActivityCard />
                    </Grid>
                    <Grid xs={12} lg={6}>
                        <ServerCard
                            serverNumber={1}
                            ftpServerList={serverList}
                            canTransfer={server2Connection?.status === CONNECTION_STATUS.CONNECTED}
                            onTransfer={onTransfer}
                        />
                    </Grid>
                    <Grid xs={12} lg={6}>
                        <ServerCard
                            serverNumber={2}
                            ftpServerList={serverList}
                            canTransfer={server1Connection?.status === CONNECTION_STATUS.CONNECTED}
                            onTransfer={onTransfer}
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    </Box>;
};

export default DashboardPage;
