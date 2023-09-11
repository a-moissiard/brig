import { Typography } from '@mui/material';
import { FunctionComponent, useEffect, useState } from 'react';

import { CONNECTION_STATUS } from '../../../../types/status/StatusTypes';

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

    return <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color }}>
        {status ?? CONNECTION_STATUS.DISCONNECTED}
    </Typography>;
};

export default ServerStatus;
