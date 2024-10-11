import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Badge, Box, Button, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { FunctionComponent, MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthApi } from '../../../api/auth';
import { revertAll } from '../../../redux/features/actions';
import { selectTransferActivity } from '../../../redux/features/transferActivity/transferActivitySlice';
import { selectUser } from '../../../redux/features/user/userSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { TRANSFER_STATUS } from '../../../types/status';

import './topBar.scss';

const TopBar: FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const user = useAppSelector(selectUser);
    const transferActivity = useAppSelector(selectTransferActivity);

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchor);

    const openMenu = (event: MouseEvent<HTMLButtonElement>): void => {
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = (): void => {
        setMenuAnchor(null);
    };

    const onLogout = async (): Promise<void> => {
        dispatch(revertAll());
        await AuthApi.logout();
        navigate('/auth');
    };

    return <AppBar position='sticky' elevation={1} className='topBar'>
        {user && (<Box className='topBar__menuContainer'>
            <IconButton className='topBar__menuButton' onClick={openMenu}>
                <Badge color="secondary" variant="dot" invisible={!transferActivity || transferActivity.status !== TRANSFER_STATUS.IN_PROGRESS}>
                    <MenuIcon />
                </Badge>
            </IconButton>
            <Menu open={menuOpen} anchorEl={menuAnchor} onClose={closeMenu} className='topBar__menu'>
                <MenuItem onClick={(): void => navigate('/dashboard')}>Dashboard</MenuItem>
                <MenuItem onClick={(): void => navigate('/servers')}>Servers</MenuItem>
                {user.admin && (<MenuItem onClick={(): void => navigate('/admin')}>Admin</MenuItem>)}
            </Menu>
        </Box>)}
        <Typography variant="h5" className="topBar__logo">BRIG</Typography>
        {user ? (
            <>
                <Box className='topBar__links'>
                    <Badge color="secondary" variant="dot" invisible={!transferActivity || transferActivity.status !== TRANSFER_STATUS.IN_PROGRESS}>
                        <Button onClick={(): void => navigate('/dashboard')}>Dashboard</Button>
                    </Badge>
                    <Button onClick={(): void => navigate('/servers')}>Servers</Button>
                    {user.admin && (<Button onClick={(): void => navigate('/admin')}>Admin</Button>)}
                </Box>
                <Tooltip title={ 'Logout' }>
                    <IconButton onClick={onLogout} className="topBar__logoutButton">
                        <LogoutRoundedIcon />
                    </IconButton>
                </Tooltip>
            </>
        ) : (
            <Button
                variant="outlined"
                color="info"
                onClick={(): void => navigate('/auth')}
                className="topBar__loginButton"
            >
                Login
            </Button>
        )}
    </AppBar>;
};

export default TopBar;
