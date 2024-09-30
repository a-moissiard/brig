import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IServerSlot } from '../../../types/ftp';
import { IFtpServerConnectionState } from '../../../types/status';
import { RootState } from '../../store';
import { revertAll } from '../actions';

interface IServerConnectionsState {
    slotOne?: IFtpServerConnectionState;
    slotTwo?: IFtpServerConnectionState;
}

const initialState: IServerConnectionsState = {
    slotOne: undefined,
    slotTwo: undefined,
};

export const serverConnectionsSlice = createSlice({
    name: 'serverConnections',
    initialState,
    extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
    reducers: {
        setServer: (state, action: PayloadAction<{
            slot: IServerSlot;
            data: IFtpServerConnectionState;
        }>) => {
            state[action.payload.slot] = action.payload.data;
        },
        unsetServer: (state, action: PayloadAction<IServerSlot>) => {
            state[action.payload] = undefined;
        },
    },
});

export const selectServer1 = (state: RootState): IFtpServerConnectionState | undefined => state.serverConnections.slotOne;
export const selectServer2 = (state: RootState): IFtpServerConnectionState | undefined => state.serverConnections.slotTwo;

export const { setServer, unsetServer } = serverConnectionsSlice.actions;

export default serverConnectionsSlice.reducer;
