import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import _ from 'lodash';
import { FunctionComponent, useEffect, useState } from 'react';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2, setServer } from '../../../redux/features/serverConnections/serverConnectionsSlice';
import { setActivity } from '../../../redux/features/transferActivity/transferActivitySlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { IFileInfo } from '../../../types/ftp/FileInfoTypes';
import { IFtpServer } from '../../../types/ftp/FtpServersTypes';
import { CONNECTION_STATUS, TRANSFER_STATUS } from '../../../types/status';
import LoadingBox from '../../lib/loadingBox/LoadingBox';
import ActivityCard from '../../modules/activityCard/ActivityCard';
import ServerCard from '../../modules/serverCard/ServerCard';
import TopBar from '../../modules/topBar/TopBar';

const DashboardPage: FunctionComponent = () => {
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(true);

    const [serverList, setServerList] = useState<IFtpServer[]>([]);

    const server1Connection = useAppSelector(selectServer1);
    const server2Connection = useAppSelector(selectServer2);

    const onTransfer = async (sourceServerNumber: 1 | 2, file: IFileInfo): Promise<void> => {
        if (server1Connection && server2Connection) {
            const [sourceServerId, destinationServerId] = sourceServerNumber === 1
                ? [server1Connection.id, server2Connection.id]
                : [server2Connection.id, server1Connection.id];
            await FtpServersApi.transfer(sourceServerId, file.name, destinationServerId);
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchState = async (): Promise<void> => {
            const [ftpServers, userConnectedServers, transferActivity] = await Promise.all([
                FtpServersApi.getFtpServers({ signal: controller.signal }),
                !server1Connection && !server2Connection ? FtpServersApi.getUserConnectedServers({ signal: controller.signal }) : Promise.resolve([]),
                FtpServersApi.getTransferActivity(),
            ]);

            setServerList(ftpServers);
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
            if (transferActivity && (!_.isEmpty(transferActivity.current) || !_.isEmpty(transferActivity.pending))) {
                dispatch(setActivity({
                    ...transferActivity,
                    status: TRANSFER_STATUS.IN_PROGRESS,
                    refreshNeeded: false,
                }));
            }

            setLoading(false);
        };
        
        fetchState().catch(() => {});

        return () => controller.abort();
    }, []);

    return <Box>
        <TopBar/>
        <LoadingBox loading={loading} withMargin>
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
        </LoadingBox>
    </Box>;
};

export default DashboardPage;
