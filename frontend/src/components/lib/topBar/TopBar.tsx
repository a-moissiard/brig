import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { FunctionComponent, MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectUser, unsetUser } from 'redux/features/user/userSlice';

import { AuthApi } from '../../../api/auth';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

import './topBar.scss';

interface ITopBarProps {}

const TopBar: FunctionComponent<ITopBarProps> = ({}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const user = useAppSelector(selectUser);

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchor);

    const openMenu = (event: MouseEvent<HTMLButtonElement>): void => {
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = (): void => {
        setMenuAnchor(null);
    };

    const onLogout = async (): Promise<void> => {
        dispatch(unsetUser());
        await AuthApi.logout();
        navigate('/auth');
    };

    return <AppBar position='sticky' className='topBar'>
        {user && (<Box className='topBar__menuContainer'>
            <IconButton sx={{ color:'primary.light' }} className='topBar__menuButton' onClick={openMenu}>
                <MenuIcon />
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
                    <Button sx={{ color:'primary.light' }} onClick={(): void => navigate('/dashboard')}>Dashboard</Button>
                    <Button sx={{ color:'primary.light' }} onClick={(): void => navigate('/servers')}>Servers</Button>
                    {user.admin && (<Button sx={{ color:'primary.light' }} onClick={(): void => navigate('/admin')}>Admin</Button>)}
                </Box>
                <Button
                    variant="outlined"
                    sx={{ color:'primary.light', borderColor: 'primary.light' }}
                    onClick={onLogout}
                    className="topBar__logoutButton"
                >
                    Logout
                </Button>
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
