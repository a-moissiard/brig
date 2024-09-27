import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IUser } from '../../../types/users/UsersTypes';
import { RootState } from '../../store';
import { revertAll } from '../actions';

interface IUserState {
    value?: IUser;
}

const initialState: IUserState = {
    value: undefined,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
    reducers: {
        setUser: (state, action: PayloadAction<IUser>) => {
            state.value = action.payload;
        },
        unsetUser: (state) => {
            state.value = undefined;
        },
    },
});

export const selectUser = (state: RootState): IUser | undefined => state.user.value;

export const { setUser, unsetUser } = userSlice.actions;

export default userSlice.reducer;
