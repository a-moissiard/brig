import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
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
import _ from 'lodash';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';

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

    const [selectedServerId, setSelectedServerId] = useState(serverConnection?.id || '');
    const [selectedServerPassword, setSelectedServerPassword] = useState('');
    const [error, setError] = useState<string>();
    const [controller, setController] = useState(() => new AbortController());

    const [selectedFile, setSelectedFile] = useState<IFileInfo>();
    const [loadingFiles, setLoadingFiles] = useState(false);

    useEffect(() => {
        if (serverConnection && selectedServerId === '') {
            setSelectedServerId(serverConnection.id);
        }
    }, [serverConnection]);

    const selectServer = (event: SelectChangeEvent): void => {
        setSelectedServerId(event.target.value);
    };

    const onConnect = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
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

    const onCancel = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        controller.abort();
        setController(new AbortController());
        dispatch(unsetServer(serverNumber));
    };

    const onDisconnect = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        controller.abort();
        setController(new AbortController());
        await FtpServersApi.disconnect(selectedServerId);
        dispatch(unsetServer(serverNumber));
    };

    const onFileItemDoubleClick = async (file: IFileInfo): Promise<void> => {
        if (file.type === FileType.Directory) {
            if (serverConnection?.workingDir !== undefined) {
                const newPath = serverConnection.workingDir === '/'
                    ? `/${file.name}`
                    : `${serverConnection.workingDir}/${file.name}`;
                await listFiles(newPath);
            } else {
                setError('Cannot change directory if current directory is undefined'); // Should never happen
            }
        } else {
            setError('Not implemented yet');
        }
    };

    const onParentDirClick = async (): Promise<void> => {
        if (serverConnection?.workingDir !== undefined && serverConnection?.workingDir !== '/') {
            const parentDirWithoutTrailingSlash = serverConnection.workingDir.substring(0, serverConnection.workingDir.lastIndexOf('/'));
            const newPath = `${parentDirWithoutTrailingSlash}/`;
            await listFiles(newPath);
        } else {
            setError('Cannot change directory if current directory is top directory or undefined');
        }
    };

    const listFiles = async (path: string): Promise<void> => {
        try {
            setLoadingFiles(true);
            const { workingDir, list } = await FtpServersApi.list(selectedServerId, path, {
                signal: controller.signal,
            });
            setSelectedFile(undefined);
            dispatch(setServer({
                serverNumber,
                data: {
                    id: selectedServerId,
                    status: CONNECTION_STATUS.CONNECTED,
                    workingDir,
                    fileList: list,
                },
            }));
            setLoadingFiles(false);
        } catch (e) {
            if (e instanceof BrigFrontError) {
                if (e.code !== BRIG_FRONT_ERROR_CODE.REQUEST_CANCELLED) {
                    setError(e.message);
                }
            } else {
                setError(`Unknown error: ${JSON.stringify(e, null, 2)}`);
            }
            setLoadingFiles(false);
        }
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
                    <Box component="form"
                        className="connectionParams__form"
                        onSubmit={serverConnection?.status === CONNECTION_STATUS.CONNECTED
                            ? onDisconnect
                            : serverConnection?.status === CONNECTION_STATUS.CONNECTING
                                ? onCancel : onConnect}>
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
                        <Button
                            type='submit'
                            className="connectionParams__formButton"
                            variant='contained'>
                            {serverConnection?.status === CONNECTION_STATUS.CONNECTED
                                ? 'Disconnect'
                                : serverConnection?.status === CONNECTION_STATUS.CONNECTING
                                    ? 'Cancel' : 'Connect'}
                        </Button>
                    </Box>
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
                    <Box className="navigation">
                        <TextField variant='standard' label='Current Directory' value={serverConnection.workingDir} disabled />
                        <Button className='navigation__button' onClick={onParentDirClick} sx={{ color: 'text.primary' }}>
                            <ArrowUpwardIcon />
                        </Button>
                        {loadingFiles && (
                            <CircularProgress className='navigation__loader' size={20} sx={{ color: 'text.primary' }}/>
                        )}
                    </Box>
                    <List dense>
                        <ListSubheader className="listSubHeader">
                            Files
                        </ListSubheader>
                        {serverConnection.fileList.map((file) => (
                            <ListItemButton
                                key={file.name + '_' + file.size}
                                selected={_.isEqual(selectedFile, file)}
                                disabled={loadingFiles}
                                onClick={(): void => setSelectedFile(file)}
                                onDoubleClick={(): Promise<void> => onFileItemDoubleClick(file)}
                            >
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
