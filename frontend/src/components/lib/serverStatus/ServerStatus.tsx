import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import { Box, Typography } from '@mui/material';
import { FunctionComponent, ReactElement, useEffect, useState } from 'react';

import { CONNECTION_STATUS } from '../../../types/status';

interface IServerStatusProps {
    status?: CONNECTION_STATUS;
}

const STATUS_TO_ICON: { [K in CONNECTION_STATUS]: ReactElement } = {
    [CONNECTION_STATUS.CONNECTED]: <CheckCircleRoundedIcon />,
    [CONNECTION_STATUS.CONNECTING]: <PendingRoundedIcon />,
    [CONNECTION_STATUS.DISCONNECTED]: <CancelRoundedIcon />,
};

const ServerStatus: FunctionComponent<IServerStatusProps> = ({ status }) => {
    const [color, setColor] = useState('error.light');

    useEffect(() => {
        switch (status) {
            case CONNECTION_STATUS.CONNECTED:
                setColor('success.light');
                break;
            case CONNECTION_STATUS.CONNECTING:
                setColor('warning.light');
                break;
            default:
                setColor('error.light');
                break;
        }
    }, [status]);

    return <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color }}>
            {STATUS_TO_ICON[status ?? CONNECTION_STATUS.DISCONNECTED]}
        </Typography>
    </Box>;
};

export default ServerStatus;
