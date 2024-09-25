import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import { FunctionComponent, ReactElement } from 'react';

import { CONNECTION_STATUS } from '../../../types/status';

interface IServerStatusProps {
    status?: CONNECTION_STATUS;
}

const STATUS_TO_ICON: { [K in CONNECTION_STATUS]: ReactElement } = {
    [CONNECTION_STATUS.CONNECTED]: <CheckCircleRoundedIcon sx={{ color: 'success.light' }}/>,
    [CONNECTION_STATUS.CONNECTING]: <PendingRoundedIcon sx={{ color: 'warning.light' }}/>,
    [CONNECTION_STATUS.DISCONNECTED]: <CancelRoundedIcon sx={{ color: 'error.light' }}/>,
};

const ServerStatus: FunctionComponent<IServerStatusProps> = ({ status }) => STATUS_TO_ICON[status ?? CONNECTION_STATUS.DISCONNECTED];

export default ServerStatus;
