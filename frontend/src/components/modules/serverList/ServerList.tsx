import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import { FunctionComponent, SyntheticEvent, useState } from 'react';
import { setError } from 'redux/features/error/errorSlice';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { useAppDispatch } from '../../../redux/hooks';
import { IFtpServer, IFtpServerBase } from '../../../types/ftp';
import { BRIG_FRONT_ERROR_CODE, BrigFrontError } from '../../../utils/error/BrigFrontError';
import Dialog from '../../lib/dialog/Dialog';
import ServerForm from '../serverForm/ServerForm';

import './serverList.scss';

interface IServerListProps {
    ftpServerList: IFtpServer[];
}

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 0,
    },
    '&::before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosIcon sx={{ fontSize: '1rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor: 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(2),
    },
    ...theme.applyStyles('dark', {
        backgroundColor: 'rgba(255, 255, 255, .05)',
    }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    ...theme.applyStyles('dark', {
        backgroundColor: 'rgba(255, 255, 255, .05)',
    }),
}));

interface IServerDeletionState {
    dialogOpen: boolean;
    server?: IFtpServer;
}

const initialServerDeletionState: IServerDeletionState = {
    dialogOpen: false,
};

const ServerList: FunctionComponent<IServerListProps> = ({ ftpServerList }) => {
    const dispatch = useAppDispatch();
    const [serverList, setServerList] = useState<IFtpServer[]>(() => (ftpServerList));
    const [expanded, setExpanded] = useState<string | false>(false);
    const [editing, setEditing] = useState<string | false>(false);
    const [newServer, setNewServer] = useState<IFtpServer | null>(null);
    const [serverDeletionState, setServerDeletionState] = useState<IServerDeletionState>(initialServerDeletionState);

    const onServerClick = (serverId: string) => (event: SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? serverId : false);
    };

    const onAddServer = (): void => {
        const _newServer = { id: 'new', secure: true } as IFtpServer;
        setExpanded(false);
        setNewServer(_newServer);
    };

    const cancelAddServer = (): void => {
        setNewServer(null);
    };

    const validateAddServer = async (server: IFtpServerBase): Promise<void> => {
        try {
            await FtpServersApi.createFtpServer(server);
            setNewServer(null);
            const list = await FtpServersApi.getFtpServers();
            setServerList(list);
        } catch (e: unknown) {
            if (e instanceof BrigFrontError) {
                if (e.code !== BRIG_FRONT_ERROR_CODE.REQUEST_CANCELLED) {
                    dispatch(setError(e.message));
                }
            } else {
                dispatch(setError(`Unknown error: ${JSON.stringify(e, null, 2)}`));
            }
        }
    };

    const onDeleteServer = (server: IFtpServer): void => {
        setServerDeletionState({ dialogOpen: true, server });
    };

    const cancelDeleteServer = (): void => {
        setServerDeletionState(initialServerDeletionState);
    };

    const validateDeleteServer = async (): Promise<void> => {
        const server = serverDeletionState.server;
        setServerDeletionState(initialServerDeletionState);
        if (server) {
            await FtpServersApi.deleteFtpServer(server.id);
            const list = await FtpServersApi.getFtpServers();
            setServerList(list);
        }
    };

    const onEditServer = (server: IFtpServer): void => {
        setEditing(server.id);
    };

    const cancelEditServer = (): void => {
        setEditing(false);
    };

    const validateEditServer = async (server: IFtpServerBase, serverId: string): Promise<void> => {
        try {
            await FtpServersApi.updateFtpServer(serverId, server);
            setEditing(false);
            const list = await FtpServersApi.getFtpServers();
            setServerList(list);
        } catch (e: unknown) {
            if (e instanceof BrigFrontError) {
                if (e.code !== BRIG_FRONT_ERROR_CODE.REQUEST_CANCELLED) {
                    dispatch(setError(e.message));
                }
            } else {
                dispatch(setError(`Unknown error: ${JSON.stringify(e, null, 2)}`));
            }
        }
    };

    return <Card className="serverList">
        <CardContent className="serverListContent">
            <Box className="header">
                <Typography variant="h5">
                    My servers
                </Typography>
                <Button
                    className='addButton'
                    variant='contained'
                    disabled={!!editing}
                    onClick={onAddServer}
                >
                    <AddIcon/>
                </Button>
            </Box>
            <Box className="accordionContainer">
                {serverList.map((ftpServer) => (
                    <Accordion key={ftpServer.id} expanded={expanded === ftpServer.id} onChange={onServerClick(ftpServer.id)}>
                        <AccordionSummary>
                            <Typography variant="h6">{ftpServer.alias}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className="serverDetails">
                            <ServerForm
                                ftpServer={ftpServer}
                                editing={editing === ftpServer.id}
                                cancelForm={cancelEditServer}
                                validateForm={validateEditServer}
                            />
                            {editing !== ftpServer.id && (<div className="serverButtons">
                                <Button variant='outlined' color="error" onClick={(): void => onDeleteServer(ftpServer)}>
                                    Delete
                                </Button>
                                <Button variant='outlined' onClick={(): void => onEditServer(ftpServer)}>
                                    Edit
                                </Button>
                            </div>)}
                            <Dialog
                                open={serverDeletionState.dialogOpen}
                                onClose={cancelDeleteServer}
                                onValidate={validateDeleteServer}
                                dialogTitle={'Definitely delete FTP server ?'}
                                dialogContentText={`Are you sure you want to delete ${
                                    serverDeletionState.server
                                        ? `the FTP server \'${serverDeletionState.server.alias}\'`
                                        : 'this FTP server'
                                }? This action is irreversible.`}
                                validateButtonLabel={'Delete'}
                            />
                        </AccordionDetails>
                    </Accordion>
                ))}
                {newServer && (
                    <Accordion expanded onChange={onServerClick('new')}>
                        <AccordionSummary>
                            <Typography variant="h6">{newServer.alias || ''}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className="serverDetails">
                            <ServerForm
                                ftpServer={newServer}
                                editing
                                cancelForm={cancelAddServer}
                                validateForm={validateAddServer}
                            />
                        </AccordionDetails>
                    </Accordion>
                )}
            </Box>
        </CardContent>
    </Card>;
};

export default ServerList;
