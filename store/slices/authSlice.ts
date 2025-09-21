
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../services/api';

interface User {
    email: string;
    name: string;
}

// FIX: Export AuthState to be used in other files, like tests.
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Function to load the initial state from localStorage
const getInitialState = (): AuthState => {
    try {
        const token = localStorage.getItem('authToken');
        const userString = localStorage.getItem('authUser');

        if (token && userString) {
            const user = JSON.parse(userString) as User;
             if (user) {
                return {
                    isAuthenticated: true,
                    user,
                    token,
                    status: 'idle',
                    error: null
                };
            }
        }
    } catch (e) {
        console.error('Failed to parse auth user from localStorage, clearing auth data.', e);
        // If parsing fails, clear out the corrupted data to prevent future errors
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    }

    return {
        isAuthenticated: false,
        user: null,
        token: null,
        status: 'idle',
        error: null,
    };
}

const initialState: AuthState = getInitialState();

// Async thunk for user login, now using the centralized api service
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: {email: string, password: string}, { rejectWithValue }) => {
    try {
      // Use the 'api' instance which has the base URL configured.
      // The interceptor doesn't apply here, but we use it for consistency.
      const response = await api.post('/auth/login', credentials);
      return response.data as { user: User, token: string };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to login');
      }
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Clear from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      // Reset state
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User, token: string }>) => {
        // Persist session to localStorage
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('authUser', JSON.stringify(action.payload.user));

        // Update state
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;