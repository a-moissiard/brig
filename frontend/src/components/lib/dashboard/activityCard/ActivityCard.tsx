import { Card, CardContent, Typography } from '@mui/material';
import _ from 'lodash';
import { FunctionComponent } from 'react';

import { selectTransferActivity } from '../../../../redux/features/transferActivity/transferActivitySlice';
import { useAppSelector } from '../../../../redux/hooks';

import './activityCard.scss';

export interface IActivityCardProps {}

const ActivityCard: FunctionComponent<IActivityCardProps> = () => {
    const transferActivity = useAppSelector(selectTransferActivity);

    return <Card>
        <CardContent className="activityCard">
            <Typography variant="h6">
                Activity
            </Typography>
            {!_.isUndefined(transferActivity)
                ? <Typography variant="body1" align="center" sx={{
                    color: 'text.primary',
                }}>
                    {`Downloading ${transferActivity.currentFileName} (from server ${transferActivity.originServer}) \
                    - Progress: ${transferActivity.currentFileProgress}`}
                </Typography>
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
