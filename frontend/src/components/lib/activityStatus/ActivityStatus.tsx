import { Box, Typography } from '@mui/material';
import { FunctionComponent, useEffect, useState } from 'react';

import { TRANSFER_STATUS } from '../../../types/status';

interface IActivityStatusProps {
    status?: TRANSFER_STATUS;
}

const ActivityStatus: FunctionComponent<IActivityStatusProps> = ({ status }) => {
    const [color, setColor] = useState('error.light');

    useEffect(() => {
        switch (status) {
            case TRANSFER_STATUS.COMPLETED:
                setColor('success.light');
                break;
            case TRANSFER_STATUS.IN_PROGRESS:
                setColor('warning.light');
                break;
            default:
                setColor('error.light');
                break;
        }
    }, [status]);

    return status ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color }}>
            {status}
        </Typography>
    </Box> : null;
};

export default ActivityStatus;
