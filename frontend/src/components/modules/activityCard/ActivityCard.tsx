import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import _ from 'lodash';
import { FunctionComponent } from 'react';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { selectTransferActivity, setTransferStatus, unsetActivity } from '../../../redux/features/transferActivity/transferActivitySlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { TRANSFER_STATUS } from '../../../types/status';
import ActivityStatus from '../../lib/activityStatus/ActivityStatus';
import LinearProgress from '../../lib/linearProgress/linearProgress';
import TransferMapping from '../../lib/transferMapping/TransferMapping';

import './activityCard.scss';

export interface IActivityCardProps {}

const ActivityCard: FunctionComponent<IActivityCardProps> = () => {
    const dispatch = useAppDispatch();
    const transferActivity = useAppSelector(selectTransferActivity);

    const onClear = (): void => {
        dispatch(unsetActivity());
    };

    const onCancel = async (): Promise<void> => {
        if (transferActivity) {
            await FtpServersApi.cancelTransfer(transferActivity.originServerId);
            dispatch(setTransferStatus(TRANSFER_STATUS.CANCELED));
        }
    };

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
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Direction</Box>
                        {`: Server ${transferActivity.originServerNumber} `}
                        <ArrowCircleRightOutlinedIcon className='direction__icon'/>
                        {` Server ${3 - transferActivity.originServerNumber}`}
                    </Typography>
                    <Typography variant="body1" align="left" sx={{ color: 'text.primary' }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Transfer target</Box>
                        {`: ${transferActivity.transferTargetName}`}
                    </Typography>
                    {transferActivity.currentTransfer && (
                        <Card className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Transferring
                                </Typography>
                                <Typography variant="body1">
                                    {`${transferActivity.currentTransfer.sourceFilePath} --> ${transferActivity.currentTransfer.destinationFilePath}`}
                                </Typography>
                                <LinearProgress className='transferProgressBar' color='primary' value={transferActivity.currentTransfer.fileProgress || 0}/>
                            </CardContent>
                        </Card>
                    )}
                    {Object.keys(transferActivity.transferMappingRemaining).length > 0 && (
                        <Card className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Pending
                                </Typography>
                                <TransferMapping transferMapping={transferActivity.transferMappingRemaining}/>
                            </CardContent>
                        </Card>
                    )}
                    {Object.keys(transferActivity.transferMappingSuccessful).length > 0 && (
                        <Card className='activitySubCard' raised>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Successful
                                </Typography>
                                <TransferMapping transferMapping={transferActivity.transferMappingSuccessful}/>
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
                                onClick={onClear}>
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
