import { FunctionComponent } from 'react';

import TopBar from '../../modules/topBar/TopBar';

interface IErrorPageProps {}

const ErrorPage: FunctionComponent<IErrorPageProps> = () => <>
    <TopBar />
    Error
</>;

export default ErrorPage;
