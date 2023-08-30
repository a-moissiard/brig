import { FunctionComponent } from 'react';

import TopBar from '../../lib/topBar/TopBar';

interface IErrorPageProps {}

const ErrorPage: FunctionComponent<IErrorPageProps> = () => <>
    <TopBar />
    Error
</>;

export default ErrorPage;
