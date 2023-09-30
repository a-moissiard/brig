import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormEvent, FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthApi } from '../../../api/auth';
import { setUser } from '../../../redux/features/user/userSlice';
import { useAppDispatch } from '../../../redux/hooks';
import { AuthFacade } from '../../../utils/auth/AuthFacade';
import { BrigFrontError } from '../../../utils/error/BrigFrontError';
import { ProgressTracking } from '../../../utils/sse/ProgressTracking';

interface ISignInPageProps {}

const SignInPage: FunctionComponent<ISignInPageProps> = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username');
        const password = data.get('password');
        if (typeof username === 'string' && typeof password === 'string') {
            try {
                setError(undefined);
                await AuthApi.login(username, password);
                const loggedUser = await AuthFacade.getLoggedUser();
                dispatch(setUser(loggedUser));
                ProgressTracking.setupProgressTracking(dispatch);
                navigate('/dashboard');
            } catch (e) {
                if (e instanceof BrigFrontError) {
                    setError(e.message);
                } else {
                    setError(`Unknown error: ${JSON.stringify(e, null, 2)}`);
                }
            }
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.dark' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                        Sign in
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        error={error !== undefined}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        error={error !== undefined}
                    />
                    {error && (<Typography component='h6' color='error'>{error}</Typography>)}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, bgcolor: 'primary.dark' }}
                    >
                            Sign In
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default SignInPage;
