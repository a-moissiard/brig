import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import RefreshIcon from '@mui/icons-material/Refresh';
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
    Menu,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material';
import prettyBytes from 'pretty-bytes';
import { FormEvent, FunctionComponent, MouseEvent, useEffect, useState } from 'react';

import { FtpServersApi } from '../../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2, setServer, unsetServer } from '../../../../redux/features/serverConnections/serverConnectionsSlice';
import { selectTransferActivity } from '../../../../redux/features/transferActivity/transferActivitySlice';
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
    canTransfer: boolean;
    onTransfer: (serverNumber: 1 | 2, file: IFileInfo) => Promise<void>;
}

const ServerCard: FunctionComponent<IServerCardProps> = ({ serverNumber, ftpServerList, canTransfer, onTransfer }) => {
    const dispatch = useAppDispatch();

    const serverConnection = useAppSelector(serverNumber === 1 ? selectServer1 : selectServer2);
    const transferActivity = useAppSelector(selectTransferActivity);

    const [selectedServerId, setSelectedServerId] = useState(serverConnection?.id || '');
    const [selectedServerPassword, setSelectedServerPassword] = useState('');
    const [error, setError] = useState<string>();
    let errorTimer: NodeJS.Timeout;
    const [controller, setController] = useState(() => new AbortController());

    const [loadingFiles, setLoadingFiles] = useState(false);

    const [contextMenu, setContextMenu] = useState<{
        fileId: string;
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const setErrorWithTimeout = (error: string, timeout: number = 10 * 1000): void => {
        setError(error);
        errorTimer = setTimeout(() => {
            setError(undefined);
        }, timeout);
    };

    useEffect(() => () => clearTimeout(errorTimer), []);

    useEffect(() => {
        if (serverConnection && selectedServerId === '') {
            setSelectedServerId(serverConnection.id);
        }
    }, [serverConnection]);

    useEffect(() => {
        if (transferActivity?.originServer !== serverNumber && transferActivity?.transferCompleted) {
            // Wait a bit before refreshing once transfer is completed to avoid timing error
            setTimeout(async () => {
                await listFiles();
            }, 2000);
        }
    }, [transferActivity]);

    const onConnect = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const password = selectedServerPassword;
        setSelectedServerPassword('');
        if (error) {
            setError(undefined);
        }
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
                    setErrorWithTimeout(e.message);
                }
            } else {
                setErrorWithTimeout(`Unknown error: ${JSON.stringify(e, null, 2)}`, 60 * 1000);
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

    const onParentDir = async (): Promise<void> => {
        if (serverConnection?.workingDir !== undefined && serverConnection?.workingDir !== '/') {
            const parentDirWithoutTrailingSlash = serverConnection.workingDir.substring(0, serverConnection.workingDir.lastIndexOf('/'));
            const newPath = `${parentDirWithoutTrailingSlash}/`;
            await listFiles(newPath);
        } else {
            setErrorWithTimeout('Cannot change directory if current directory is top directory or undefined');
        }
    };

    const onRefreshList = async (): Promise<void> => {
        await listFiles();
    };

    const onFileDoubleClick = async (file: IFileInfo): Promise<void> => {
        if (file.type === FileType.Directory) {
            if (serverConnection?.workingDir !== undefined) {
                const newPath = serverConnection.workingDir === '/'
                    ? `/${file.name}`
                    : `${serverConnection.workingDir}/${file.name}`;
                await listFiles(newPath);
            } else {
                setErrorWithTimeout('Cannot change directory if current directory is undefined'); // Should never happen
            }
        } else {
            await transfer(file);
        }
    };
    
    const onFileRightClick = (event: MouseEvent, file: IFileInfo): void => {
        event.preventDefault();
        setContextMenu(contextMenu === null
            ? {
                fileId: `${file.name}_${file.size}`,
                mouseX: event.clientX + 2,
                mouseY: event.clientY - 6,
            }
            : null,
        );
    };

    const onContextMenuTransfer = async (file: IFileInfo): Promise<void> => {
        setContextMenu(null);
        await transfer(file);
    };

    const onContextMenuDelete = async (file: IFileInfo): Promise<void> => {
        setContextMenu(null);
        await FtpServersApi.delete(selectedServerId, file.name);
        await listFiles();
    };

    const transfer = async (file: IFileInfo): Promise<void> => {
        if (!canTransfer) {
            setErrorWithTimeout('Both servers must be connected for transfer');
            return;
        }
        await onTransfer(serverNumber, file);
    };

    const listFiles = async (path?: string): Promise<void> => {
        try {
            setLoadingFiles(true);
            const { workingDir, list } = await FtpServersApi.list(selectedServerId, path, {
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
            setLoadingFiles(false);
        } catch (e) {
            if (e instanceof BrigFrontError) {
                if (e.code !== BRIG_FRONT_ERROR_CODE.REQUEST_CANCELLED) {
                    setErrorWithTimeout(e.message);
                }
            } else {
                setErrorWithTimeout(`Unknown error: ${JSON.stringify(e, null, 2)}`, 60 * 1000);
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
                            onChange={(event: SelectChangeEvent): void => {
                                setSelectedServerId(event.target.value);
                            }}
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
                            onChange={(event): void => {
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
                        <TextField
                            className='navigation__workingDir'
                            variant='standard'
                            label='Current Directory'
                            value={serverConnection.workingDir}
                            fullWidth
                            disabled
                        />
                        <Button
                            className='navigation__button'
                            onClick={onParentDir}
                            disabled={loadingFiles}
                            sx={{ color: 'text.primary' }}>
                            <ArrowUpwardIcon />
                        </Button>
                        <Button
                            className='navigation__button'
                            onClick={onRefreshList}
                            disabled={loadingFiles}
                            sx={{ color: 'text.primary' }}>
                            <RefreshIcon />
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
                                disabled={loadingFiles}
                                onDoubleClick={(): Promise<void> => onFileDoubleClick(file)}
                                onContextMenu={(event): void => onFileRightClick(event, file)}
                            >
                                <ListItem>
                                    <ListItemIcon>
                                        {file.type === FileType.Directory ? (<FolderIcon />) : (<DescriptionIcon />)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file.name}
                                        secondary={file.type === FileType.File ? prettyBytes(file.size) : undefined}
                                    />
                                </ListItem>
                                <Menu
                                    variant='menu'
                                    open={contextMenu !== null && contextMenu.fileId === `${file.name}_${file.size}`}
                                    onClose={(): void => setContextMenu(null)}
                                    anchorReference="anchorPosition"
                                    anchorPosition={
                                        contextMenu !== null
                                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                                            : undefined
                                    }
                                >
                                    <MenuItem onClick={(): Promise<void> => onContextMenuTransfer(file)}>Transfer</MenuItem>
                                    <MenuItem onClick={(): Promise<void> => onContextMenuDelete(file)}>Delete</MenuItem>
                                </Menu>
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            )}
        </CardContent>
    </Card>;
};

export default ServerCard;
