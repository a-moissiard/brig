import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormEvent, FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthApi } from '../../../api/auth';
import { BrigFrontError } from '../../../utils/error/BrigFrontError';

interface ISignInPageProps {
}

const SignInPage: FunctionComponent<ISignInPageProps> = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username');
        const password = data.get('password');
        if (typeof username === 'string' && typeof password === 'string') {
            try {
                setError(undefined);
                await AuthApi.login(username, password);
                navigate('/');
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
        <ThemeProvider theme={createTheme()}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
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
                        {error && (<Typography component='h6' color='red'>{error}</Typography>)}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default SignInPage;
