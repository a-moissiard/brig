import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ITransferActivity, ITransferCurrentFileProgress, TRANSFER_STATUS } from '../../../types/status';
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
        setProgress: (state, action: PayloadAction<ITransferCurrentFileProgress & { sourceFilePath: string }>) => {
            if (state.value) {
                const sourceFilePath = action.payload.sourceFilePath;

                if (state.value.pending[sourceFilePath]) {
                    // The transfer is starting
                    state.value.current[sourceFilePath] = state.value.pending[sourceFilePath];
                    state.value.currentProgress = {
                        ...action.payload,
                    };
                    delete state.value.pending[sourceFilePath];
                } else {
                    state.value.currentProgress = {
                        ...action.payload,
                    };
                }

                if (action.payload.fileProgress === 100) {
                    state.value.success[sourceFilePath] = state.value.current[sourceFilePath];
                    delete state.value.current[sourceFilePath];
                    state.value.currentProgress = undefined;
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
    setProgress,
    setTransferStatus,
    setRefreshment,
    unsetActivity,
} = transferActivitySlice.actions;

export default transferActivitySlice.reducer;
