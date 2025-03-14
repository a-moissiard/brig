import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import _ from 'lodash';
import { FunctionComponent, useEffect, useState } from 'react';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2 } from '../../../redux/features/serverConnections/serverConnectionsSlice';
import { selectTransferActivity, unsetActivity } from '../../../redux/features/transferActivity/transferActivitySlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { TRANSFER_STATUS } from '../../../types/status';
import ActivityStatus from '../../lib/activityStatus/ActivityStatus';
import LinearProgress from '../../lib/linearProgress/linearProgress';
import TransferMapping from '../../lib/transferMapping/TransferMapping';

import './activityCard.scss';

const ActivityCard: FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const transferActivity = useAppSelector(selectTransferActivity);
    const server1Connection = useAppSelector(selectServer1);
    const server2Connection = useAppSelector(selectServer2);
    const [sourceServerName, setSourceServerName] = useState<string>();

    const onClear = async (): Promise<void> => {
        await FtpServersApi.clearTransferActivity();
        dispatch(unsetActivity());
    };

    const onCancel = async (): Promise<void> => {
        if (transferActivity) {
            await FtpServersApi.cancelTransfer(transferActivity.sourceServerId);
        }
    };

    useEffect(() => {
        if (transferActivity && server1Connection && server2Connection) {
            const { sourceServerId } = transferActivity;
            setSourceServerName(sourceServerId === server1Connection.server.id
                ? server1Connection.server.alias
                : sourceServerId === server2Connection.server.id
                    ? server2Connection.server.alias
                    : '', // should not happen
            );
        }
    }, [transferActivity, server1Connection, server2Connection]);

    return <Card variant="outlined">
        <CardContent className="activityCard">
            <Box className="header">
                <Typography variant="h5">
                    Activity
                </Typography>
                <ActivityStatus status={transferActivity?.status}/>
            </Box>
            {!_.isUndefined(transferActivity)
                ? <Box>
                    <Typography variant="body1" align="left">
                        <Box component="span" className="emphasizedText">Source server: </Box>
                        {sourceServerName}
                    </Typography>
                    <Typography variant="body1" align="left">
                        <Box component="span" className="emphasizedText">Transfer target: </Box>
                        {transferActivity.target}
                    </Typography>
                    {transferActivity.currentProgress && (
                        <Card elevation={1} className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" className="emphasizedText">
                                    Transferring
                                </Typography>
                                <Typography variant="body1">
                                    {`${Object.keys(transferActivity.current)[0]} --> ${Object.values(transferActivity.current)[0]}`}
                                </Typography>
                                <LinearProgress color='secondary' value={transferActivity.currentProgress.fileProgress || 0}/>
                            </CardContent>
                        </Card>
                    )}
                    {Object.keys(transferActivity.pending).length > 0 && (
                        <Card elevation={1} className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" className="emphasizedText">
                                    Pending
                                </Typography>
                                <TransferMapping transferMapping={transferActivity.pending}/>
                            </CardContent>
                        </Card>
                    )}
                    {Object.keys(transferActivity.success).length > 0 && (
                        <Card elevation={1} className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" className="emphasizedText">
                                    Successful
                                </Typography>
                                <TransferMapping transferMapping={transferActivity.success}/>
                            </CardContent>
                        </Card>
                    )}
                    {Object.keys(transferActivity.failed).length > 0 && (
                        <Card elevation={1} className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" className="emphasizedText">
                                    Failed
                                </Typography>
                                <TransferMapping transferMapping={transferActivity.failed}/>
                            </CardContent>
                        </Card>
                    )}
                    <Box className='footer'>
                        {transferActivity.status === TRANSFER_STATUS.IN_PROGRESS
                            ? (<Button
                                variant='contained'
                                color='error'
                                onClick={onCancel}>
                                Cancel transfer
                            </Button>)
                            : (<Button
                                variant='outlined'
                                onClick={(): Promise<void> => onClear()}>
                                Clear
                            </Button>)
                        }
                    </Box>
                </Box>
                : <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                    Nothing to display
                </Typography>}
        </CardContent>
    </Card>;
};

export default ActivityCard;
