import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../store';

interface ITransferActivityData {
    originServer: 1 | 2;
    currentFileName: string;
    currentFileBytes?: number;
    currentFileProgress?: number;
    transferCompleted: boolean;
}

interface ITransferActivityState {
    value?: ITransferActivityData;
}

const initialState: ITransferActivityState = {
    value: undefined,
};

export const transferActivitySlice = createSlice({
    name: 'transferActivity',
    initialState,
    reducers: {
        setActivity: (state, action: PayloadAction<ITransferActivityData>) => {
            state.value = action.payload;
        },
        setProgress: (state, action: PayloadAction<Omit<ITransferActivityData, 'originServer' | 'transferCompleted'>>) => {
            if (state.value) {
                state.value.currentFileName = action.payload.currentFileName;
                state.value.currentFileBytes = action.payload.currentFileBytes;
                state.value.currentFileProgress = action.payload.currentFileProgress;
            }
        },
        setTransferCompleted: (state) => {
            if (state.value) {
                state.value.transferCompleted = true;
            }
        },
        unsetActivity: (state) => {
            state.value = undefined;
        },
    },
});

export const selectTransferActivity = (state: RootState): ITransferActivityData | undefined => state.transferActivity.value;

export const {
    setActivity,
    setProgress,
    setTransferCompleted,
    unsetActivity,
} = transferActivitySlice.actions;

export default transferActivitySlice.reducer;
