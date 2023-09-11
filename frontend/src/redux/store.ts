import { configureStore } from '@reduxjs/toolkit';

import serverReducer from './features/server/serverSlice';
import userReducer from './features/user/userSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        server1: serverReducer,
        server2: serverReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
