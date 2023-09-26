import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IServerConnection } from '../../../types/status/StatusTypes';
import { RootState } from '../../store';

interface IServerConnectionsState {
    1?: IServerConnection;
    2?: IServerConnection;
}

const initialState: IServerConnectionsState = {
    1: undefined,
    2: undefined,
};

export const serverConnectionsSlice = createSlice({
    name: 'serverConnections',
    initialState,
    reducers: {
        setServer: (state, action: PayloadAction<{
            serverNumber: 1 | 2;
            data: IServerConnection;
        }>) => {
            state[action.payload.serverNumber] = action.payload.data;
        },
        unsetServer: (state, action: PayloadAction<1 | 2>) => {
            state[action.payload] = undefined;
        },
    },
});

export const selectServer1 = (state: RootState): IServerConnection | undefined => state.serverConnections[1];
export const selectServer2 = (state: RootState): IServerConnection | undefined => state.serverConnections[2];

export const { setServer, unsetServer } = serverConnectionsSlice.actions;

export default serverConnectionsSlice.reducer;
