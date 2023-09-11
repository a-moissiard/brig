import { Card, CardContent, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

import './activityCard.scss';

export interface IActivityCardProps {
    downloading: boolean;
}

const ActivityCard: FunctionComponent<IActivityCardProps> = ({ downloading }) => <Card>
    <CardContent className="activityCard">
        <Typography variant="h6">
            Downloads
        </Typography>
        {downloading
            ? <>TODO</>
            : <Typography variant="body2" align='center' sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
            }}>
                No download in progress
            </Typography>}
    </CardContent>
</Card>;

export default ActivityCard;
