import { AppBar, Button, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

import './dashboard.scss';

interface IDashboardPageProps {}

const DashboardPage: FunctionComponent<IDashboardPageProps> = () =>
    (<>
        <AppBar position='sticky' className='appBar'>
            <Typography variant='h6'>BRIG</Typography>
            <Button variant='outlined' color='info'>Logout</Button>
        </AppBar>
    </>);

export default DashboardPage;
