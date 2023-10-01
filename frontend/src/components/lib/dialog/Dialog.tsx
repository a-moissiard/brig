import { Button, Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { FunctionComponent } from 'react';

interface IDialogProps {
    open: boolean;
    onClose: () => void;
    onValidate: () => void;
    dialogTitle?: string;
    dialogContentText: string;
    textField?: {
        label: string;
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    };
    cancelButtonLabel?: string;
    validateButtonLabel: string;
}

const Dialog: FunctionComponent<IDialogProps> = ({
    open,
    onClose,
    onValidate,
    dialogTitle,
    dialogContentText,
    textField,
    cancelButtonLabel = 'Cancel',
    validateButtonLabel,
}) => <MuiDialog
    open={open}
    onClose={onClose}>
    {dialogTitle && (<DialogTitle>
        {dialogTitle}
    </DialogTitle>)}
    <DialogContent>
        <DialogContentText>
            {dialogContentText}
        </DialogContentText>
        {textField && (<TextField
            autoFocus
            margin="dense"
            label={textField.label}
            fullWidth
            required
            variant="standard"
            onChange={textField.onChange}
        />)}
    </DialogContent>
    <DialogActions>
        <Button onClick={onClose}>{cancelButtonLabel}</Button>
        <Button onClick={onValidate}>{validateButtonLabel}</Button>
    </DialogActions>
</MuiDialog>;

export default Dialog;
