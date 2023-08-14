import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, IconButton, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthApi } from '../../../api/auth';
import { IUser } from '../../../types/users/UsersTypes';

import './topBar.scss';

interface ITopBarProps {
    user: IUser;
}

const TopBar: FunctionComponent<ITopBarProps> = ({ user }) => {
    const navigate = useNavigate();

    const onLogout = async (): Promise<void> => {
        await AuthApi.logout();
        navigate('/auth');
    };

    return <AppBar position='sticky' className='topBar'>
        <Box className='topBar__menuContainer'>
            <IconButton color='info' className='topBar__menuButton' onClick={(): void => {}}>
                <MenuIcon />
            </IconButton>
        </Box>
        <Typography variant='h5' className='topBar__logo'>BRIG</Typography>
        <Box className='topBar__links'>
            <Button color='info' onClick={(): void => navigate('/dashboard')}>Dashboard</Button>
            <Button color='info' onClick={(): void => navigate('/servers')}>Servers</Button>
        </Box>
        <Button variant='outlined' color='info' onClick={onLogout} className='topBar__logoutButton'>Logout</Button>
    </AppBar>;
};

export default TopBar;
