import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React, { FunctionComponent, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AuthRequired from './components/lib/authRequired/AuthRequired';
import DashboardPage from './components/pages/dashboard/DashboardPage';
import ErrorPage from './components/pages/error/ErrorPage';
import ManageServersPage from './components/pages/manageServers/ManageServersPage';
import NotFoundPage from './components/pages/notFound/NotFoundPage';
import SignInPage from './components/pages/signIn/SignInPage';
import { IUser } from './types/users/UsersTypes';
import { themeOptions } from './utils/theme/ThemeOptions';

interface IAppProps {}

const App: FunctionComponent<IAppProps> = ({}) => {
    const [user, setUser] = useState<IUser>();

    return <ThemeProvider theme={createTheme(themeOptions)}>
        <CssBaseline />
        <Routes>
            <Route path="/" element={<Navigate to='/dashboard' />} />
            <Route path="/dashboard"
                element={
                    <AuthRequired
                        user={user}
                        setUser={setUser}
                        children={<DashboardPage user={user}/>}
                    />
                }
            />
            <Route path="/servers"
                element={
                    <AuthRequired
                        user={user}
                        setUser={setUser}
                        children={<ManageServersPage user={user}/>}
                    />
                }
            />
            <Route path="/auth" element={<SignInPage/>}/>
            <Route path="/error" element={<ErrorPage/>}/>
            <Route path="/*" element={<NotFoundPage/>}/>
        </Routes>
    </ThemeProvider>;
};

export default App;
