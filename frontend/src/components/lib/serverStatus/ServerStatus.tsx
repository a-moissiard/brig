import { Box, CircularProgress, Typography } from '@mui/material';
import { FunctionComponent, useEffect, useState } from 'react';

import { CONNECTION_STATUS } from '../../../types/status';

interface IServerStatusProps {
    status?: CONNECTION_STATUS;
}

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
            {status ?? CONNECTION_STATUS.DISCONNECTED}
        </Typography>
        {status === CONNECTION_STATUS.CONNECTING && (
            <CircularProgress size={20} sx={{ ml: '10px', color: 'text.primary' }}/>
        )}
    </Box>;
};

export default ServerStatus;
