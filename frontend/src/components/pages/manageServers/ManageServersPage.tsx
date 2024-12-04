import { Container } from '@mui/material';
import { FunctionComponent, useEffect, useState } from 'react';

import { FtpServersApi } from '../../../api/ftpServers/FtpServersApi';
import { IFtpServer } from '../../../types/ftp';
import LoadingBox from '../../lib/loadingBox/LoadingBox';
import ServerList from '../../modules/serverList/ServerList';
import TopBar from '../../modules/topBar/TopBar';

const ManageServersPage: FunctionComponent = () => {
    const [loading, setLoading] = useState(true);

    const [ftpServerList, setFtpServerList] = useState<IFtpServer[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchState = async (): Promise<void> => {
            const ftpServers = await FtpServersApi.getFtpServers({ signal: controller.signal });

            setFtpServerList(ftpServers);
        };

        fetchState().catch(() => {}).finally(() => setLoading(false));

        return () => controller.abort();
    }, []);

    return <>
        <TopBar/>
        <LoadingBox loading={loading} withMargin>
            <Container maxWidth="sm">
                <ServerList ftpServerList={ftpServerList}/>
            </Container>
        </LoadingBox>
    </>;
};

export default ManageServersPage;
