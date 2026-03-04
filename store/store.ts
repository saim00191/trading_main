import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userEmailReducer from './UserLoggedInSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
     userEmail: userEmailReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
