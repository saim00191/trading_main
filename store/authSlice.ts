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

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  tempSignupData?: {
    username: string;
    email: string;
    phoneNumber: string;
    password?: string;
    uid?: string;
  };
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  tempSignupData: undefined,
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
      state.isAuthenticated = true;
      state.error = null;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.tempSignupData = undefined;
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('tempSignupData');
      }
    },
    setTempSignupData: (state, action: PayloadAction<AuthState['tempSignupData']>) => {
      state.tempSignupData = action.payload;
      if (typeof window !== 'undefined' && action.payload) {
        localStorage.setItem('tempSignupData', JSON.stringify(action.payload));
      }
    },
    initializeAuth: (state) => {
      // Load user from localStorage on app start
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            state.user = JSON.parse(storedUser);
            state.isAuthenticated = true;
          } catch (e) {
            state.user = null;
            state.isAuthenticated = false;
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
} = authSlice.actions;

export default authSlice.reducer;
