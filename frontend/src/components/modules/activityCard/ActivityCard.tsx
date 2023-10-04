import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
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
            await FtpServersApi.cancelTransfer(transferActivity.serverId);
            dispatch(setTransferStatus(TRANSFER_STATUS.CANCELED));
        }
    };

    return <Card>
        <CardContent className="activityCard">
            <Box className="header">
                <Typography variant="h6">
                    Activity
                </Typography>
                <ActivityStatus status={transferActivity?.status}/>
            </Box>
            {!_.isUndefined(transferActivity)
                ? <Box>
                    <Typography className='direction' variant="body1" align="left" sx={{ color: 'text.primary' }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Direction</Box>
                        {': Server 1 '}{transferActivity.originServer === 1
                            ? <ArrowCircleRightOutlinedIcon className='direction__icon'/>
                            : <ArrowCircleLeftOutlinedIcon className='direction__icon'/>
                        }{' Server 2'}
                    </Typography>
                    <Typography variant="body1" align="left" sx={{ color: 'text.primary' }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>File name</Box>
                        {`: ${transferActivity.currentFileName}`}
                    </Typography>
                    <LinearProgress color='primary' value={transferActivity.currentFileProgress || 0}/>
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
