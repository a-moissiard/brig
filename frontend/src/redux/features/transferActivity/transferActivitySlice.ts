import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ITransferActivity, TRANSFER_STATUS } from '../../../types/status';
import { RootState } from '../../store';

interface ITransferActivityState {
    value?: ITransferActivity;
}

const initialState: ITransferActivityState = {
    value: undefined,
};

export const transferActivitySlice = createSlice({
    name: 'transferActivity',
    initialState,
    reducers: {
        setActivity: (state, action: PayloadAction<ITransferActivity>) => {
            state.value = action.payload;
        },
        setProgress: (state, action: PayloadAction<Omit<ITransferActivity, 'originServer' | 'serverId' | 'status'>>) => {
            if (state.value) {
                state.value.currentFileName = action.payload.currentFileName;
                state.value.currentFileBytes = action.payload.currentFileBytes;
                state.value.currentFileProgress = action.payload.currentFileProgress;
            }
        },
        setTransferStatus: (state, action: PayloadAction<TRANSFER_STATUS>) => {
            if (state.value && !(state.value.status === TRANSFER_STATUS.CANCELED && action.payload === TRANSFER_STATUS.COMPLETED)) {
                state.value.status = action.payload;
            }
        },
        unsetActivity: (state) => {
            state.value = undefined;
        },
    },
});

export const selectTransferActivity = (state: RootState): ITransferActivity | undefined => state.transferActivity.value;

export const {
    setActivity,
    setProgress,
    setTransferStatus,
    unsetActivity,
} = transferActivitySlice.actions;

export default transferActivitySlice.reducer;
