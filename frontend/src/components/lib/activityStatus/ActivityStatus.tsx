import { SxProps, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

import { TRANSFER_STATUS } from '../../../types/status';

import './activityStatus.scss';

interface IActivityStatusProps {
    status?: TRANSFER_STATUS;
}

const STATUS_TO_COLOR: { [K in TRANSFER_STATUS]: SxProps } = {
    [TRANSFER_STATUS.COMPLETED]: { color: 'success.light' },
    [TRANSFER_STATUS.IN_PROGRESS]: { color: 'warning.light' },
    [TRANSFER_STATUS.CANCELED]: { color: 'error.light' },
};

const ActivityStatus: FunctionComponent<IActivityStatusProps> = ({ status }) => status
    ? <Typography variant="subtitle1" className="activityStatus" sx={STATUS_TO_COLOR[status]}>
        {status}
    </Typography>
    : null;

export default ActivityStatus;
