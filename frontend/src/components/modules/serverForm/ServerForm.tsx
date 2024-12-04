import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, TextField } from '@mui/material';
import _ from 'lodash';
import { FunctionComponent, useState } from 'react';

import { IFtpServer, IFtpServerBase } from '../../../types/ftp';

import './serverForm.scss';

interface IServerFormProps {
    ftpServer: IFtpServer;
    editing: boolean;
    cancelForm: () => void;
    validateForm: (server: IFtpServerBase, serverId: string) => Promise<void>;
}

const ServerForm: FunctionComponent<IServerFormProps> = ({
    ftpServer,
    editing,
    cancelForm,
    validateForm,
}) => {
    const [formValues, setFormValues] = useState<IFtpServerBase>(ftpServer);
    const [formErrors, setFormErrors] = useState<Partial<{ [K in keyof IFtpServerBase]: string }>>({});

    const onFormTextFieldChange = (field: keyof IFtpServerBase) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [field]: event.target.value });
        setFormErrors({ ...formErrors, [field]: '' });
    };

    const onFormCheckboxChange = (field: keyof IFtpServerBase) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [field]: event.target.checked });
    };

    const isFormValid = (formValues: Partial<IFtpServerBase> | null, newErrors: typeof formErrors): formValues is IFtpServerBase => {
        if (!formValues?.alias) {
            newErrors.alias = 'Alias is required';
        }
        if (!formValues?.host) {
            newErrors.host = 'Host is required';
        }
        if (!formValues?.port) {
            newErrors.port = 'Port is required';
        } else if (isNaN(Number(formValues.port))) {
            newErrors.port = 'Port must be a number';
        } else {
            formValues.port = Number(formValues.port);
        }
        if (!formValues?.username) {
            newErrors.username = 'Username is required';
        }

        return _.isEmpty(newErrors);
    };

    const onCancel = async (): Promise<void> => {
        setFormValues(ftpServer);
        setFormErrors({});
        cancelForm();
    };

    const onValidate = async (): Promise<void> => {
        const newErrors: typeof formErrors = {};
        if (isFormValid(formValues, newErrors)) {
            await validateForm(formValues, ftpServer.id);
        } else {
            setFormErrors(newErrors);
        }
    };

    return <>
        <FormControl className="serverProp" fullWidth margin="normal" error={!!formErrors.alias}>
            <TextField
                id="alias"
                label="Alias"
                value={formValues.alias || ''}
                onChange={onFormTextFieldChange('alias')}
                disabled={!editing}
            />
            {formErrors.alias && <FormHelperText>{formErrors.alias}</FormHelperText>}
        </FormControl>
        <FormControl className="serverProp" fullWidth margin="normal" error={!!formErrors.host}>
            <TextField
                id="host"
                label="Host"
                value={formValues.host || ''}
                onChange={onFormTextFieldChange('host')}
                disabled={!editing}
            />
            {formErrors.host && <FormHelperText>{formErrors.host}</FormHelperText>}
        </FormControl>
        <FormControl className="serverProp" fullWidth margin="normal" error={!!formErrors.port}>
            <TextField
                id="port"
                label="Port"
                value={formValues.port || ''}
                onChange={onFormTextFieldChange('port')}
                disabled={!editing}
            />
            {formErrors.port && <FormHelperText>{formErrors.port}</FormHelperText>}
        </FormControl>
        <FormControl className="serverProp" fullWidth margin="normal" error={!!formErrors.username}>
            <TextField
                id="username"
                label="Username"
                value={formValues.username || ''}
                onChange={onFormTextFieldChange('username')}
                disabled={!editing}
            />
            {formErrors.username && <FormHelperText>{formErrors.username}</FormHelperText>}
        </FormControl>
        <FormControl className="serverProp" margin="normal" disabled={!editing}>
            <FormControlLabel
                control={<Checkbox checked={formValues.secure} onChange={onFormCheckboxChange('secure')}/>}
                label="Secure connection"
            />
        </FormControl>
        {editing && (<div className="serverButtons">
            <Button variant='outlined' color="error" onClick={onCancel}>
                Cancel
            </Button>
            <Button variant='outlined' onClick={onValidate}>
                Save
            </Button>
        </div>)}
    </>;
};

export default ServerForm;
