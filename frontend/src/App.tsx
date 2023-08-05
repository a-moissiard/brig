import React, { FunctionComponent } from 'react';
import { Route, Routes } from 'react-router-dom';

import AuthRequired from './components/lib/authRequired/AuthRequired';
import DashboardPage from './components/pages/dashboard/DashboardPage';
import ErrorPage from './components/pages/error/ErrorPage';
import NotFoundPage from './components/pages/notFound/NotFoundPage';
import SignInPage from './components/pages/signIn/SignInPage';

interface IAppProps {
}

const App: FunctionComponent<IAppProps> = ({}) => <Routes>
    <Route path="/" element={<AuthRequired children={<DashboardPage />}/>} />
    <Route path="/auth" element={<SignInPage />} />
    <Route path="/error" element={<ErrorPage />} />
    <Route path="/*" element={<NotFoundPage />} />
</Routes>;

export default App;
