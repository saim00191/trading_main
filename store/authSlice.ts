import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  uid: string;
  username: string;
  email: string;
  phoneNumber?: string;
  token?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt?: string;
}

interface TempSignupData {
  username: string;
  email: string;
  phoneNumber: string;
  password?: string;
  uid?: string;
}

interface AuthState {
  user: User | null;
  userEmail: string | null; // ✅ store email separately
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  tempSignupData?: TempSignupData | null;
}

const initialState: AuthState = {
  user: null,
  userEmail: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  tempSignupData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.userEmail = action.payload.email;
      state.isAuthenticated = true;
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },

    logout: (state) => {
      state.user = null;
      state.userEmail = null;
      state.isAuthenticated = false;
      state.error = null;
      state.tempSignupData = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('tempSignupData');
      }
    },

    setTempSignupData: (state, action: PayloadAction<TempSignupData>) => {
      state.tempSignupData = action.payload;

      if (typeof window !== 'undefined' && action.payload) {
        localStorage.setItem('tempSignupData', JSON.stringify(action.payload));
      }
    },

    clearTempSignupData: (state) => {
      state.tempSignupData = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('tempSignupData');
      }
    },

    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          try {
            const parsedUser: User = JSON.parse(storedUser);
            state.user = parsedUser;
            state.userEmail = parsedUser.email;
            state.isAuthenticated = true;
          } catch (e) {
            state.user = null;
            state.userEmail = null;
            state.isAuthenticated = false;
          }
        }

        const storedTempData = localStorage.getItem('tempSignupData');
        if (storedTempData) {
          try {
            state.tempSignupData = JSON.parse(storedTempData);
          } catch {
            state.tempSignupData = null;
          }
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setUser,
  logout,
  setTempSignupData,
  initializeAuth,
  clearTempSignupData,
} = authSlice.actions;

export default authSlice.reducer;