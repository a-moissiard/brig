import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import _ from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import LoadingBox from './components/lib/loadingBox/LoadingBox';
import PageGuard from './components/lib/pageGuard/PageGuard';
import AdminPage from './components/pages/admin/AdminPage';
import DashboardPage from './components/pages/dashboard/DashboardPage';
import ErrorPage from './components/pages/error/ErrorPage';
import ManageServersPage from './components/pages/manageServers/ManageServersPage';
import NotFoundPage from './components/pages/notFound/NotFoundPage';
import SignInPage from './components/pages/signIn/SignInPage';
import { setUser } from './redux/features/user/userSlice';
import { useAppDispatch } from './redux/hooks';
import { AuthFacade } from './utils/auth/AuthFacade';
import { ProgressTracking } from './utils/sse/ProgressTracking';
import { themeOptions } from './utils/theme/ThemeOptions';

const App: FunctionComponent = () => {
    const [loading, setLoading] = useState(true);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        AuthFacade.getLoggedUser({ signal: controller.signal })
            .then((loggedUser) => {
                dispatch(setUser(loggedUser));
                ProgressTracking.setupProgressTracking(dispatch);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                navigate('/auth');
            });

        return () => controller.abort();
    }, []);

    return <ThemeProvider theme={createTheme(themeOptions)}>
        <CssBaseline />
        <LoadingBox loading={loading} withMargin={false}>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard"/>} />
                <Route path="/dashboard" element={
                    <PageGuard
                        verify={(user): boolean => !_.isUndefined(user)}
                        guardedChildren={<DashboardPage />}
                        fallbackChildren={<Navigate to={'/auth'}/>}
                    />
                } />
                <Route path="/servers" element={
                    <PageGuard
                        verify={(user): boolean => !_.isUndefined(user)}
                        guardedChildren={<ManageServersPage />}
                        fallbackChildren={<Navigate to={'/auth'}/>}
                    />
                } />
                <Route path="/admin" element={
                    <PageGuard
                        verify={(user): boolean => !_.isUndefined(user) && user.admin}
                        guardedChildren={<AdminPage />}
                        fallbackChildren={<NotFoundPage />}
                    />
                } />
                <Route path="/auth" element={<PageGuard
                    verify={(user): boolean => _.isUndefined(user)}
                    guardedChildren={<SignInPage />}
                    fallbackChildren={<Navigate to={'/dashboard'}/>}
                />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="/*" element={<NotFoundPage />} />
            </Routes>
        </LoadingBox>
    </ThemeProvider>;
};

export default App;
