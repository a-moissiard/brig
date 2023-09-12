import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { FunctionComponent, useRef, useState } from 'react';

import { FtpServersApi } from '../../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2, setServer, unsetServer } from '../../../../redux/features/server/serverSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { IFtpServer } from '../../../../types/ftpServers/FtpServersTypes';
import { CONNECTION_STATUS } from '../../../../types/status/StatusTypes';
import { BrigFrontError } from '../../../../utils/error/BrigFrontError';
import ServerStatus from './ServerStatus';

import './serverCard.scss';

interface IServerCardProps {
    serverNumber: 1 | 2;
    ftpServerList: IFtpServer[];
}

const ServerCard: FunctionComponent<IServerCardProps> = ({ serverNumber, ftpServerList }) => {
    const dispatch = useAppDispatch();

    const serverConnection = useAppSelector(serverNumber === 1 ? selectServer1 : selectServer2);
    const [selectedServerId, setSelectedServerId] = useState('');
    const [selectedServerPassword, setSelectedServerPassword] = useState('');

    const [error, setError] = useState<string>();
    const controller = useRef(new AbortController());

    const onConnect = async (): Promise<void> => {
        const password = selectedServerPassword;
        setSelectedServerPassword('');
        setError(undefined);
        dispatch(setServer({
            serverNumber,
            data: {
                id: selectedServerId,
                status: CONNECTION_STATUS.CONNECTING,
            },
        }));
        try {
            const fileList = await FtpServersApi.connect(selectedServerId, password, {
                signal: controller.current.signal,
            });
            // TODO: use filelist
            dispatch(setServer({
                serverNumber,
                data: {
                    id: selectedServerId,
                    status: CONNECTION_STATUS.CONNECTED,
                },
            }));
        } catch (e) {
            dispatch(unsetServer(serverNumber));
            if (e instanceof BrigFrontError) {
                setError(e.message);
            } else {
                setError(`Unknown error: ${JSON.stringify(e, null, 2)}`);
            }
        }
    };

    const onCancel = (): void => {
        controller.current.abort();
        dispatch(unsetServer(serverNumber));
    };

    const onDisconnect = async (): Promise<void> => {
        await FtpServersApi.disconnect(selectedServerId);
        dispatch(unsetServer(serverNumber));
    };

    const selectServer = (event: SelectChangeEvent): void => {
        setSelectedServerId(event.target.value);
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
                <FormControl className="serverCard__serverConnectionSelect">
                    <InputLabel>Server</InputLabel>
                    <Select
                        value={selectedServerId}
                        label="Server"
                        onChange={selectServer}
                        disabled={serverConnection !== undefined}
                    >
                        {ftpServerList.map(server => (
                            <MenuItem key={server.id} value={server.id}>
                                {`${server.username}@${server.host}:${server.port}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    className="serverCard__serverConnectionPassword"
                    label="Password"
                    type="password"
                    required
                    value={selectedServerPassword}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                        setSelectedServerPassword(event.target.value);
                    }}
                />
                {serverConnection?.status === CONNECTION_STATUS.CONNECTED
                    ? (<Button
                        className="serverCard__serverConnectionButton"
                        variant='contained'
                        onClick={onDisconnect}>
                        Disconnect
                    </Button>)
                    : serverConnection?.status === CONNECTION_STATUS.CONNECTING
                        ? (<Button
                            className="serverCard__serverConnectionButton"
                            variant='contained'
                            onClick={onCancel}>
                            Cancel
                        </Button>)
                        : (<Button
                            className="serverCard__serverConnectionButton"
                            variant='contained'
                            disabled={selectedServerId === ''}
                            onClick={onConnect}>
                                Connect
                        </Button>)}
            </Box>
            {error && (<Typography component='h6' color='red'>{error}</Typography>)}
        </CardContent>
    </Card>;
};

export default ServerCard;
