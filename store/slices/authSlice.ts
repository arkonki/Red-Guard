
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
    email: string;
    name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Function to load the initial state from localStorage
const getInitialState = (): AuthState => {
    const token = localStorage.getItem('authToken');
    const userString = localStorage.getItem('authUser');
    const user = userString ? JSON.parse(userString) as User : null;

    if (token && user) {
        return {
            isAuthenticated: true,
            user,
            token,
            status: 'idle',
            error: null
        }
    }

    return {
        isAuthenticated: false,
        user: null,
        token: null,
        status: 'idle',
        error: null,
    }
}

const initialState: AuthState = getInitialState();

// Async thunk for user login, now with a real API call
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: {email: string, pass: string}, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.pass, // The backend expects 'password'
      });
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