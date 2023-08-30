import { FunctionComponent } from 'react';

import TopBar from '../../lib/topBar/TopBar';

interface INotFoundPageProps {}

const NotFoundPage: FunctionComponent<INotFoundPageProps> = () => <>
    <TopBar />
    Page Not Found
</>;

export default NotFoundPage;
