import React, { FunctionComponent } from 'react';
import { Route, Routes } from 'react-router-dom';

import Dashboard from './components/dashboard/Dashboard';
import NotFound from './components/notFound/NotFound';
import SignIn from './components/signIn/SignIn';

interface IAppProps {
}

const App: FunctionComponent<IAppProps> = ({}) => <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/auth" element={<SignIn />} />
    <Route path="/*" element={<NotFound />} />
</Routes>;

export default App;
