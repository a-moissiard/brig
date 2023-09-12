import { configureStore } from '@reduxjs/toolkit';

import serversReducer from './features/server/serverSlice';
import userReducer from './features/user/userSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        servers: serversReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
