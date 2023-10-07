import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ICurrentTransferActivity, ITransferActivity, TRANSFER_STATUS } from '../../../types/status';
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
        setProgress: (state, action: PayloadAction<ICurrentTransferActivity>) => {
            if (state.value) {
                state.value.currentTransfer = action.payload;
            }
        },
        setTransferStatus: (state, action: PayloadAction<TRANSFER_STATUS>) => {
            if (state.value && !(state.value.status === TRANSFER_STATUS.CANCELED && action.payload === TRANSFER_STATUS.COMPLETED)) {
                state.value.status = action.payload;
                if (action.payload === TRANSFER_STATUS.COMPLETED) {
                    state.value.refreshNeeded = true;
                }
            }
        },
        setRefreshment: (state, action: PayloadAction<boolean>) => {
            if (state.value) {
                state.value.refreshNeeded = action.payload;
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
    setRefreshment,
    unsetActivity,
} = transferActivitySlice.actions;

export default transferActivitySlice.reducer;
