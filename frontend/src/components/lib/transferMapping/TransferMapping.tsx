import { List, ListItem, ListItemText } from '@mui/material';
import { FunctionComponent } from 'react';

interface ITransferMapping {
    transferMapping: Record<string, string>;
}

const TransferMapping: FunctionComponent<ITransferMapping> = ({ transferMapping }) =>
    <List dense>
        {Object.keys(transferMapping).map((sourcePath) => (
            <ListItem key={sourcePath} disableGutters>
                <ListItemText primary={`${sourcePath} --> ${transferMapping[sourcePath]}`}/>
            </ListItem>
        ))}
    </List>;

export default TransferMapping;
