import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
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
    IconButton,
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

import { IFilesListingResponse } from '../../../api/ftpServers/FtpServersActionsTypes';
import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { selectServer1, selectServer2, setServer, unsetServer } from '../../../redux/features/serverConnections/serverConnectionsSlice';
import { selectTransferActivity, setRefreshment } from '../../../redux/features/transferActivity/transferActivitySlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { FileType, IFileInfo, IFtpServer, IServerSlot } from '../../../types/ftp';
import { CONNECTION_STATUS, TRANSFER_STATUS } from '../../../types/status';
import { BRIG_FRONT_ERROR_CODE, BrigFrontError } from '../../../utils/error/BrigFrontError';
import Dialog from '../../lib/dialog/Dialog';
import ServerStatus from '../../lib/serverStatus/ServerStatus';

import './serverCard.scss';

interface IServerCardProps {
    slot: IServerSlot;
    ftpServerList: IFtpServer[];
    canTransfer: boolean;
    onTransfer: (slot: IServerSlot, file: IFileInfo) => Promise<void>;
}

interface IDirCreationState {
    dialogOpen: boolean;
    dirName: string;
}

const initialDirCreationState: IDirCreationState = {
    dialogOpen: false,
    dirName: '',
};

interface IFileDeletionState {
    dialogOpen: boolean;
    file?: IFileInfo;
}

const initialFileDeletionState: IFileDeletionState = {
    dialogOpen: false,
};

const ServerCard: FunctionComponent<IServerCardProps> = ({ slot, ftpServerList, canTransfer, onTransfer }) => {
    const dispatch = useAppDispatch();

    const serverConnection = useAppSelector(slot === 'slotOne' ? selectServer1 : selectServer2);
    const transferActivity = useAppSelector(selectTransferActivity);

    const [selectedServerId, setSelectedServerId] = useState(serverConnection?.server.id || '');
    const [selectedServerPassword, setSelectedServerPassword] = useState('');
    const [error, setError] = useState<string>();
    const [errorTimer, setErrorTimer] = useState<ReturnType<typeof setTimeout>>();
    const [controller, setController] = useState(() => new AbortController());

    const [ongoingAction, setOngoingAction] = useState(false);

    const [dirCreationState, setDirCreationState] = useState<IDirCreationState>(initialDirCreationState);

    const [contextMenu, setContextMenu] = useState<{
        fileId: string;
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const [fileDeletionState, setFileDeletionState] = useState<IFileDeletionState>(initialFileDeletionState);

    const setErrorWithTimeout = (error: string, timeout: number = 10 * 1000): void => {
        clearTimeout(errorTimer);
        setError(error);
        setErrorTimer(setTimeout(() => {
            setError(undefined);
        }, timeout));
    };

    useEffect(() => () => clearTimeout(errorTimer), []);

    useEffect(() => {
        if (serverConnection && selectedServerId === '') {
            setSelectedServerId(serverConnection.server.id);
        }
    }, [serverConnection]);

    useEffect(() => {
        // When transfer starts, we disabled actions to avoid the user to trigger multiple requests at the same time
        // (which is not allowed by ftp protocol when considering a single client instance)
        if (transferActivity?.status === TRANSFER_STATUS.IN_PROGRESS && !ongoingAction) {
            setOngoingAction(true);
        }

        // If refresh needed flag is true, it means the transfer just got completed
        if (transferActivity?.refreshNeeded) {
            if (transferActivity.sourceServerId === serverConnection?.server.id) {
                setOngoingAction(false);
            } else {
                dispatch(setRefreshment(false));
                requestInducingListRefresh(() => FtpServersApi.list(selectedServerId, undefined, {
                    signal: controller.signal,
                })).catch((e) => setErrorWithTimeout(`Unknown error: ${JSON.stringify(e, null, 2)}`, 60 * 1000));
                setOngoingAction(false);
            }
        }
    }, [transferActivity, ongoingAction]);

    const onConnect = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const password = selectedServerPassword;
        setSelectedServerPassword('');
        if (error) {
            setError(undefined);
        }
        dispatch(setServer({
            slot,
            data: {
                server: ftpServerList.find((server) => server.id === selectedServerId)!,
                status: CONNECTION_STATUS.CONNECTING,
                workingDir: '/',
                files: [],
            },
        }));
        try {
            const { workingDir, list } = await FtpServersApi.connect(selectedServerId, slot, password, {
                signal: controller.signal,
            });
            dispatch(setServer({
                slot,
                data: {
                    server: ftpServerList.find((server) => server.id === selectedServerId)!,
                    status: CONNECTION_STATUS.CONNECTED,
                    workingDir,
                    files: list,
                },
            }));
        } catch (e) {
            dispatch(unsetServer(slot));
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
        dispatch(unsetServer(slot));
    };

    const onDisconnect = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        controller.abort();
        setController(new AbortController());
        await FtpServersApi.disconnect(selectedServerId);
        dispatch(unsetServer(slot));
    };

    const onParentDir = async (): Promise<void> => {
        if (serverConnection?.workingDir !== undefined && serverConnection?.workingDir !== '/') {
            const parentDirWithoutTrailingSlash = serverConnection.workingDir.substring(0, serverConnection.workingDir.lastIndexOf('/'));
            const newPath = `${parentDirWithoutTrailingSlash}/`;
            setOngoingAction(true);
            await requestInducingListRefresh(() => FtpServersApi.list(selectedServerId, newPath, {
                signal: controller.signal,
            }));
            setOngoingAction(false);
        } else {
            setErrorWithTimeout('Cannot change directory if current directory is top directory or undefined');
        }
    };

    const onCreateDir = async (): Promise<void> => {
        setDirCreationState({
            ...dirCreationState,
            dialogOpen: true,
        });
    };

    const onValidateCreateDir = async (): Promise<void> => {
        const dirName = dirCreationState.dirName;
        setDirCreationState(initialDirCreationState);
        setOngoingAction(true);
        await requestInducingListRefresh(() => FtpServersApi.createDir(selectedServerId, dirName));
        setOngoingAction(false);
    };

    const onRefreshList = async (): Promise<void> => {
        setOngoingAction(true);
        await requestInducingListRefresh(() => FtpServersApi.list(selectedServerId, undefined, {
            signal: controller.signal,
        }));
        setOngoingAction(false);
    };

    const onFileDoubleClick = async (file: IFileInfo): Promise<void> => {
        if (file.type === FileType.Directory) {
            if (serverConnection?.workingDir !== undefined) {
                const newPath = serverConnection.workingDir === '/'
                    ? `/${file.name}`
                    : `${serverConnection.workingDir}/${file.name}`;
                setOngoingAction(true);
                await requestInducingListRefresh(() => FtpServersApi.list(selectedServerId, newPath, {
                    signal: controller.signal,
                }));
                setOngoingAction(false);
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
        setFileDeletionState({ dialogOpen: true, file });
    };

    const onValidateDeleteFile = async (): Promise<void> => {
        const file = fileDeletionState.file;
        setFileDeletionState(initialFileDeletionState);
        if (file) {
            setOngoingAction(true);
            await requestInducingListRefresh(() => FtpServersApi.delete(selectedServerId, file.name));
            setOngoingAction(false);
        }
    };

    const transfer = async (file: IFileInfo): Promise<void> => {
        if (!canTransfer) {
            setErrorWithTimeout('Both servers must be connected for transfer');
            return;
        }
        await onTransfer(slot, file);
    };

    const requestInducingListRefresh = async (fn: () =>  Promise<IFilesListingResponse>): Promise<void> => {
        try {
            const { workingDir, list } = await fn();
            dispatch(setServer({
                slot,
                data: {
                    server: ftpServerList.find((server) => server.id === selectedServerId)!,
                    status: CONNECTION_STATUS.CONNECTED,
                    workingDir,
                    files: list,
                },
            }));
        } catch (e) {
            if (e instanceof BrigFrontError) {
                if (e.code !== BRIG_FRONT_ERROR_CODE.REQUEST_CANCELLED) {
                    setErrorWithTimeout(e.message);
                }
            } else {
                setErrorWithTimeout(`Unknown error: ${JSON.stringify(e, null, 2)}`, 60 * 1000);
            }
        }
    };

    return <Card className="serverCard">
        <CardContent className="serverCardContent">
            <Box className="header">
                <Typography variant="h5">
                    Server {slot === 'slotOne' ? '1' : '2'}
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
                                    {server.alias}
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
                        <IconButton
                            className='navigation__button'
                            onClick={onParentDir}
                            disabled={ongoingAction}>
                            <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton
                            className='navigation__button'
                            onClick={onCreateDir}
                            disabled={ongoingAction}>
                            <CreateNewFolderIcon />
                        </IconButton>
                        <IconButton
                            className='navigation__button'
                            onClick={onRefreshList}
                            disabled={ongoingAction}>
                            <RefreshIcon />
                        </IconButton>
                        {ongoingAction && (<CircularProgress className='navigation__loader' size={20}/>)}
                    </Box>
                    <Dialog
                        open={dirCreationState.dialogOpen}
                        onClose={(): void => setDirCreationState(initialDirCreationState)}
                        onValidate={onValidateCreateDir}
                        dialogTitle={'Create directory'}
                        dialogContentText={'Please enter the name of the directory you want to create.'}
                        textField={{
                            label: 'Name',
                            onChange: (event) => setDirCreationState({
                                ...dirCreationState,
                                dirName: event.target.value,
                            }),
                        }}
                        validateButtonLabel={'Create'}
                    />
                    <List dense>
                        <ListSubheader className="listSubHeader">
                            Files
                        </ListSubheader>
                        {serverConnection.files.map((file) => (
                            <ListItemButton
                                key={file.name + '_' + file.size}
                                disabled={ongoingAction}
                                onDoubleClick={(): Promise<void> => onFileDoubleClick(file)}
                                onContextMenu={(event): void => onFileRightClick(event, file)}
                            >
                                <ListItem disableGutters>
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
                    <Dialog
                        open={fileDeletionState.dialogOpen}
                        onClose={(): void => setFileDeletionState(initialFileDeletionState)}
                        onValidate={onValidateDeleteFile}
                        dialogTitle={'Definitely delete file ?'}
                        dialogContentText={`Are you sure you want to delete ${
                            fileDeletionState.file
                                ? `the ${fileDeletionState.file.type === FileType.Directory ? 'directory' : 'file'} \'${fileDeletionState.file.name}\'`
                                : 'this file'
                        }? This action is irreversible.`}
                        validateButtonLabel={'Delete'}
                    />
                </Box>
            )}
        </CardContent>
    </Card>;
};

export default ServerCard;
