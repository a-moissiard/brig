import { configureStore } from '@reduxjs/toolkit';

import errorReducer from './features/error/errorSlice';
import serverConnectionsReducer from './features/serverConnections/serverConnectionsSlice';
import transferActivityReducer from './features/transferActivity/transferActivitySlice';
import userReducer from './features/user/userSlice';

export const store = configureStore({
    reducer: {
        error: errorReducer,
        user: userReducer,
        serverConnections: serverConnectionsReducer,
        transferActivity: transferActivityReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
