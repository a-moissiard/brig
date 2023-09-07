import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, IconButton, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
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

    const onLogout = async (): Promise<void> => {
        dispatch(unsetUser());
        await AuthApi.logout();
        navigate('/auth');
    };

    return <AppBar position='sticky' className='topBar' enableColorOnDark={true}>
        {user && (<Box className='topBar__menuContainer'>
            <IconButton color='info' className='topBar__menuButton' onClick={(): void => {}}>
                <MenuIcon />
            </IconButton>
        </Box>)}
        <Typography variant="h5" className="topBar__logo">BRIG</Typography>
        {user ? (
            <>
                <Box className='topBar__links'>
                    <Button color='info' onClick={(): void => navigate('/dashboard')}>Dashboard</Button>
                    <Button color="info" onClick={(): void => navigate('/servers')}>Servers</Button>
                    {user.admin && (<Button color="info" onClick={(): void => navigate('/admin')}>Admin</Button>)}
                </Box>
                <Button
                    variant="outlined"
                    color="info"
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
