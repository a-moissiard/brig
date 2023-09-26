import { configureStore } from '@reduxjs/toolkit';

import serverConnectionsReducer from './features/serverConnections/serverConnectionsSlice';
import userReducer from './features/user/userSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        serverConnections: serverConnectionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
