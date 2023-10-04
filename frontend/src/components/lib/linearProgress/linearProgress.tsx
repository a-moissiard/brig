import { Box, LinearProgress as MuiLinearProgress, LinearProgressProps, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

const LinearProgress: FunctionComponent<LinearProgressProps & { value: number }> = (props) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
            <MuiLinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(
                props.value,
            )}%`}</Typography>
        </Box>
    </Box>
);

export default LinearProgress;
