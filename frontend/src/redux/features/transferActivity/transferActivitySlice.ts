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
        setTransferMapping: (state, action: PayloadAction<Record<string, string>>) => {
            if (state.value) {
                state.value.transferMappingRemaining = action.payload;
            }
        },
        setProgress: (state, action: PayloadAction<Omit<ICurrentTransferActivity, 'destinationFilePath'>>) => {
            if (state.value) {
                const sourceFilePath = action.payload.sourceFilePath;

                if (state.value.transferMappingRemaining[sourceFilePath]) {
                    // The transfer is starting
                    state.value.currentTransfer = {
                        ...action.payload,
                        destinationFilePath: state.value.transferMappingRemaining[sourceFilePath],
                    };
                    delete state.value.transferMappingRemaining[sourceFilePath];
                } else {
                    state.value.currentTransfer = {
                        ...action.payload,
                        destinationFilePath: state.value.currentTransfer?.destinationFilePath || '',
                    };
                }

                if (action.payload.fileProgress === 100) {
                    state.value.transferMappingSuccessful[sourceFilePath] = state.value.currentTransfer.destinationFilePath;
                    state.value.currentTransfer = undefined;
                }
            }
        },
        setTransferStatus: (state, action: PayloadAction<TRANSFER_STATUS>) => {
            if (state.value) {
                state.value.status = action.payload;
                state.value.refreshNeeded = true;
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
    setTransferMapping,
    setProgress,
    setTransferStatus,
    setRefreshment,
    unsetActivity,
} = transferActivitySlice.actions;

export default transferActivitySlice.reducer;
