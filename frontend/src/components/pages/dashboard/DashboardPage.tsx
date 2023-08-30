import { FunctionComponent } from 'react';

import TopBar from '../../lib/topBar/TopBar';

export interface IDashboardPageProps {
}

const DashboardPage: FunctionComponent<IDashboardPageProps> = ({}) => <>
    <TopBar />
        Dashboard
</>;

export default DashboardPage;
