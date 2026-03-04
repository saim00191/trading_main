'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

interface UserEmailState {
  email: string | null;
}

const initialState: UserEmailState = {
  email: null,
};

export const userEmailSlice = createSlice({
  name: 'userEmail',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', action.payload);
      }
    },
    clearEmail: (state) => {
      state.email = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userEmail');
      }
    },
    loadEmailFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('userEmail');
        if (saved) state.email = saved;
      }
    },
  },
});

export const { setEmail, clearEmail, loadEmailFromStorage } = userEmailSlice.actions;

export const selectUserEmail = (state: RootState) => state.userEmail.email;

export default userEmailSlice.reducer;