import { FunctionComponent } from 'react';

import TopBar from '../../modules/topBar/TopBar';

interface INotFoundPageProps {}

const NotFoundPage: FunctionComponent<INotFoundPageProps> = () => <>
    <TopBar />
    Page Not Found
</>;

export default NotFoundPage;
