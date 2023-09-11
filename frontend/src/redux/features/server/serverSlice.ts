import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CONNECTION_STATUS, IServerConnection } from '../../../types/status/StatusTypes';
import { RootState } from '../../store';

interface IServerConnectionState {
    value?: IServerConnection;
}

const initialState: IServerConnectionState = {
    value: undefined,
};

export const serverSlice = createSlice({
    name: 'server',
    initialState,
    reducers: {
        setServer: (state, action: PayloadAction<IServerConnection>) => {
            state.value = action.payload;
        },
        setServerConnectionStatus: (state, action: PayloadAction<CONNECTION_STATUS>) => {
            if (state.value) {
                state.value.status = action.payload;
            }
        },
        unsetServer: (state) => {
            state.value = undefined;
        },
    },
});

export const selectServer1 = (state: RootState): IServerConnection | undefined => state.server1.value;
export const selectServer2 = (state: RootState): IServerConnection | undefined => state.server2.value;

export const { setServer, setServerConnectionStatus, unsetServer } = serverSlice.actions;

export default serverSlice.reducer;
