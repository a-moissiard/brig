import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../store';

interface ITransferActivityData {
    originServer: 1 | 2;
    name: string;
    bytes?: number;
    progress?: number;
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
        setProgress: (state, action: PayloadAction<{ bytes: number; progress?: number }>) => {
            if (state.value) {
                state.value.bytes = action.payload.bytes;
                state.value.progress = action.payload.progress;
            }
        },
        unsetActivity: (state) => {
            state.value = undefined;
        },
    },
});

export const selectTransferActivity = (state: RootState): ITransferActivityData | undefined => state.transferActivity.value;

export const { setActivity, setProgress, unsetActivity } = transferActivitySlice.actions;

export default transferActivitySlice.reducer;
