import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../store';
import { revertAll } from '../actions';

interface IErrorState {
    value?: string;
}

const initialState: IErrorState = {
    value: undefined,
};

export const errorSlice = createSlice({
    name: 'error',
    initialState,
    extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
    reducers: {
        setError: (state, action: PayloadAction<string>) => {
            state.value = action.payload;
        },
        unsetError: (state) => {
            state.value = undefined;
        },
    },
});

export const selectError = (state: RootState): string | undefined => state.error.value;

export const { setError, unsetError } = errorSlice.actions;

export default errorSlice.reducer;
