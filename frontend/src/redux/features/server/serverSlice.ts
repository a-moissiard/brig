import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IServerConnection } from '../../../types/status/StatusTypes';
import { RootState } from '../../store';

interface IServerConnectionsState {
    value: {
        1?: IServerConnection;
        2?: IServerConnection;
    };
}

const initialState: IServerConnectionsState = {
    value: {
        1: undefined,
        2: undefined,
    },
};

export const serverSlice = createSlice({
    name: 'server',
    initialState,
    reducers: {
        setServer: (state, action: PayloadAction<{
            serverNumber: 1 | 2;
            data: IServerConnection;
        }>) => {
            state.value[action.payload.serverNumber] = action.payload.data;
        },
        unsetServer: (state, action: PayloadAction<1 | 2>) => {
            state.value[action.payload] = undefined;
        },
    },
});

export const selectServer1 = (state: RootState): IServerConnection | undefined => state.servers.value[1];
export const selectServer2 = (state: RootState): IServerConnection | undefined => state.servers.value[2];

export const { setServer, unsetServer } = serverSlice.actions;

export default serverSlice.reducer;
