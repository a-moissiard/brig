import { Box, LinearProgress as MuiLinearProgress, LinearProgressProps, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

import './linearProgress.scss';

const LinearProgress: FunctionComponent<LinearProgressProps & { value: number }> = ({ color, value }) => (
    <Box className="linearProgress">
        <MuiLinearProgress color={color} value={value} variant="determinate" className="linearProgress__bar" />
        <Typography variant="body2" color="text.secondary" className="linearProgress__value">
            {`${Math.round(value)}%`}
        </Typography>
    </Box>
);

export default LinearProgress;
