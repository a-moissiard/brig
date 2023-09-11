import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { FunctionComponent, useState } from 'react';

import { selectServer1, selectServer2 } from '../../../../redux/features/server/serverSlice';
import { useAppSelector } from '../../../../redux/hooks';
import { IFtpServer } from '../../../../types/ftpServers/FtpServersTypes';
import { CONNECTION_STATUS } from '../../../../types/status/StatusTypes';
import ServerStatus from './ServerStatus';

import './serverCard.scss';

interface IServerCardProps {
    serverNumber: 1 | 2;
    ftpServerList: IFtpServer[];
}

const ServerCard: FunctionComponent<IServerCardProps> = ({ serverNumber, ftpServerList }) => {
    const [serverId, setServerId] = useState('');
    const serverConnection = useAppSelector(serverNumber === 1 ? selectServer1 : selectServer2);

    const selectServer = (event: SelectChangeEvent): void => {
        setServerId(event.target.value);
    };
    return <Card>
        <CardContent className="serverCard">
            <Box className="serverCard__header">
                <Typography variant="h6">
                    Server {serverNumber}
                </Typography>
                <ServerStatus status={serverConnection?.status}/>
            </Box>
            <Box className="serverCard__serverConnection">
                <FormControl>
                    <InputLabel>Server</InputLabel>
                    <Select
                        className="serverCard__serverConnectionSelect"
                        value={serverId}
                        label="Server"
                        onChange={selectServer}
                        disabled={serverConnection?.status === CONNECTION_STATUS.CONNECTED}
                    >
                        {ftpServerList.map(server => (
                            <MenuItem key={server.id} value={server.id}>
                                {`${server.username}@${server.host}:${server.port}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant='contained' disabled={serverId === ''} className="serverCard__serverConnectionButton">
                    {serverConnection?.status === CONNECTION_STATUS.CONNECTED
                        ? 'Disconnect'
                        : serverConnection?.status === CONNECTION_STATUS.CONNECTING ?
                            'Cancel'
                            : 'Connect'}
                </Button>
            </Box>
        </CardContent>
    </Card>;
};

export default ServerCard;
