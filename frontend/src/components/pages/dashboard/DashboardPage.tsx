import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import _ from 'lodash';
import { FunctionComponent, useEffect, useState } from 'react';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2, setServer } from '../../../redux/features/serverConnections/serverConnectionsSlice';
import { setActivity } from '../../../redux/features/transferActivity/transferActivitySlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { IFileInfo, IFtpServer, IFtpServerSlotsModel, IServerSlot } from '../../../types/ftp';
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

    const onTransfer = async (slot: IServerSlot, file: IFileInfo): Promise<void> => {
        if (server1Connection && server2Connection) {
            const [sourceServerId, destinationServerId] = slot === 'slotOne'
                ? [server1Connection.server.id, server2Connection.server.id]
                : [server2Connection.server.id, server1Connection.server.id];
            await FtpServersApi.transfer(sourceServerId, file.name, destinationServerId);
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchState = async (): Promise<void> => {
            const [ftpServers, userConnectedServers, transferActivity] = await Promise.all([
                FtpServersApi.getFtpServers({ signal: controller.signal }),
                !server1Connection && !server2Connection ? FtpServersApi.getUserConnectedServers({ signal: controller.signal }) : Promise.resolve({} as IFtpServerSlotsModel),
                FtpServersApi.getTransferActivity(),
            ]);

            setServerList(ftpServers);
            const { slotOne, slotTwo } = userConnectedServers;
            if (slotOne) {
                dispatch(setServer({
                    slot: 'slotOne',
                    data: {
                        ...slotOne,
                        status: CONNECTION_STATUS.CONNECTED,
                    },
                }));
            }
            if (slotTwo) {
                dispatch(setServer({
                    slot: 'slotTwo',
                    data: {
                        ...slotTwo,
                        status: CONNECTION_STATUS.CONNECTED,
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
                        slot={'slotOne'}
                        ftpServerList={serverList}
                        canTransfer={server2Connection?.status === CONNECTION_STATUS.CONNECTED}
                        onTransfer={onTransfer}
                    />
                </Grid>
                <Grid xs={12} lg={6}>
                    <ServerCard
                        slot={'slotTwo'}
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
