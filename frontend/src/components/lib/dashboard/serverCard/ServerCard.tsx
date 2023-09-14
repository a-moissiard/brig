import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material';
import { FunctionComponent, useState } from 'react';

import { FtpServersApi } from '../../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2, setServer, unsetServer } from '../../../../redux/features/server/serverSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { FileType, IFileInfo } from '../../../../types/ftpServers/FileInfoTypes';
import { IFtpServer } from '../../../../types/ftpServers/FtpServersTypes';
import { CONNECTION_STATUS } from '../../../../types/status/StatusTypes';
import { BRIG_FRONT_ERROR_CODE, BrigFrontError } from '../../../../utils/error/BrigFrontError';
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
    const [controller, setController] = useState(() => new AbortController());

    const [selectedFile, setSelectedFile] = useState<IFileInfo>();

    const selectServer = (event: SelectChangeEvent): void => {
        setSelectedServerId(event.target.value);
    };

    const onConnect = async (): Promise<void> => {
        const password = selectedServerPassword;
        setSelectedServerPassword('');
        setError(undefined);
        dispatch(setServer({
            serverNumber,
            data: {
                id: selectedServerId,
                status: CONNECTION_STATUS.CONNECTING,
                fileList: [],
            },
        }));
        try {
            const { workingDir, list } = await FtpServersApi.connect(selectedServerId, password, {
                signal: controller.signal,
            });
            dispatch(setServer({
                serverNumber,
                data: {
                    id: selectedServerId,
                    status: CONNECTION_STATUS.CONNECTED,
                    workingDir,
                    fileList: list,
                },
            }));
        } catch (e) {
            dispatch(unsetServer(serverNumber));
            if (e instanceof BrigFrontError) {
                if (e.code !== BRIG_FRONT_ERROR_CODE.REQUEST_CANCELLED) {
                    setError(e.message);
                }
            } else {
                setError(`Unknown error: ${JSON.stringify(e, null, 2)}`);
            }
        }
    };

    const onCancel = (): void => {
        controller.abort();
        setController(new AbortController());
        dispatch(unsetServer(serverNumber));
    };

    const onDisconnect = async (): Promise<void> => {
        await FtpServersApi.disconnect(selectedServerId);
        dispatch(unsetServer(serverNumber));
    };

    return <Card>
        <CardContent className="serverCard">
            <Box className="header">
                <Typography variant="h6">
                    Server {serverNumber}
                </Typography>
                <ServerStatus status={serverConnection?.status}/>
            </Box>
            <Box className="connection">
                <Box className="connectionParams">
                    <FormControl className="connectionParams__select">
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
                        label="Password"
                        type="password"
                        required
                        value={selectedServerPassword}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                            setSelectedServerPassword(event.target.value);
                        }}
                        disabled={serverConnection !== undefined}
                    />
                    {serverConnection?.status === CONNECTION_STATUS.CONNECTED
                        ? (<Button
                            className="connectionParams__button"
                            variant='contained'
                            onClick={onDisconnect}>
                        Disconnect
                        </Button>)
                        : serverConnection?.status === CONNECTION_STATUS.CONNECTING
                            ? (<Button
                                className="connectionParams__button"
                                variant='contained'
                                onClick={onCancel}>
                            Cancel
                            </Button>)
                            : (<Button
                                className="connectionParams__button"
                                variant='contained'
                                disabled={selectedServerId === ''}
                                onClick={onConnect}>
                                Connect
                            </Button>)
                    }
                </Box>
                {error && (
                    <Typography
                        className="connectionError"
                        component='h6'
                        color='error'>
                        {error}
                    </Typography>
                )}
            </Box>
            {serverConnection && serverConnection.status === CONNECTION_STATUS.CONNECTED && (
                <Box className="listing">
                    <Divider className="divider" variant="middle" />
                    <TextField variant='standard' label='Current Directory' value={serverConnection.workingDir} disabled />
                    <List dense>
                        <ListSubheader className="listSubHeader">
                            Files
                        </ListSubheader>
                        {serverConnection.fileList.map((file) => (
                            <ListItemButton
                                key={file.name + '_' + file.size}
                                selected={selectedFile === file}
                                onClick={(): void => setSelectedFile(file)}>
                                <ListItem>
                                    <ListItemIcon>
                                        {file.type === FileType.Directory ? (<FolderIcon />) : (<DescriptionIcon />)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file.name}
                                    />
                                </ListItem>
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            )}
        </CardContent>
    </Card>;
};

export default ServerCard;
