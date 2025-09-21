import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from '../store/slices/authSlice';
import LoginPage from './LoginPage';
import '../i18n'; // Initialize i18next for tests

// A test utility to create a mock Redux store
const createMockStore = (initialState: Partial<AuthState> = {}) => {
  // Explicitly type the preloaded auth state to prevent type widening and resolve the error.
  const preloadedAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    status: 'idle',
    error: null,
    ...initialState,
  };

  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: preloadedAuthState,
    },
  });
};

describe('LoginPage', () => {
  it('should render login form elements', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    // Assert that the form fields and button are rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });
});