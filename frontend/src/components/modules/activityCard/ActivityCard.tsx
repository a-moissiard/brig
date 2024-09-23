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
    const [sourceServerNumber, setSourceServerNumber] = useState(0);

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
            setSourceServerNumber(transferActivity.sourceServerId === server1Connection.id
                ? 1
                : transferActivity.sourceServerId === server2Connection.id
                    ? 2
                    : 0, // should not happen
            );
        }
    }, [transferActivity, server1Connection, server2Connection]);

    return <Card>
        <CardContent className="activityCard">
            <Box className="header">
                <Typography variant="h5">
                    Activity
                </Typography>
                <ActivityStatus status={transferActivity?.status}/>
            </Box>
            {!_.isUndefined(transferActivity)
                ? <Box>
                    <Typography className='direction' variant="body1" align="left" sx={{ color: 'text.primary' }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Source server</Box>
                        {`: Server ${sourceServerNumber} `}
                    </Typography>
                    <Typography variant="body1" align="left" sx={{ color: 'text.primary' }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Transfer target</Box>
                        {`: ${transferActivity.target}`}
                    </Typography>
                    {transferActivity.currentProgress && (
                        <Card className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Transferring
                                </Typography>
                                <Typography variant="body1">
                                    {`${Object.keys(transferActivity.current)[0]} --> ${Object.values(transferActivity.current)[0]}`}
                                </Typography>
                                <LinearProgress className='transferProgressBar' color='primary' value={transferActivity.currentProgress.fileProgress || 0}/>
                            </CardContent>
                        </Card>
                    )}
                    {Object.keys(transferActivity.pending).length > 0 && (
                        <Card className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Pending
                                </Typography>
                                <TransferMapping transferMapping={transferActivity.pending}/>
                            </CardContent>
                        </Card>
                    )}
                    {Object.keys(transferActivity.success).length > 0 && (
                        <Card className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Successful
                                </Typography>
                                <TransferMapping transferMapping={transferActivity.success}/>
                            </CardContent>
                        </Card>
                    )}
                    {Object.keys(transferActivity.failed).length > 0 && (
                        <Card className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
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
                : <Typography variant="body2" align="center" sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
                }}>
                    No download in progress
                </Typography>}
        </CardContent>
    </Card>;
};

export default ActivityCard;
