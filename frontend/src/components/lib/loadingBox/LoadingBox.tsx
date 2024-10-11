import { Box, Container } from '@mui/material';
import { FunctionComponent, ReactElement } from 'react';

import Loader from '../loader/Loader';

import './loadingBox.scss';

interface MainAreaProps {
    loading: boolean;
    children: ReactElement;
    withMargin?: boolean;
}

const LoadingBox: FunctionComponent<MainAreaProps> = ({
    loading,
    children,
    withMargin,
}) => <Box component="main" className={`main${withMargin ? '--withMargin' : ''}`}>
    {loading ? (
        <Container maxWidth='xs' className='loaderContainer'>
            <Loader loading={loading} size={100} />
        </Container>
    ) : (
        children
    )}
</Box>;

export default LoadingBox;
