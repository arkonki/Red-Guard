import { describe, it, expect } from 'vitest';
// FIX: Import AuthState type for type safety in test state.
import authReducer, { logout, AuthState } from './authSlice';

describe('authSlice reducer', () => {
  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      isAuthenticated: false,
      user: null,
      token: null,
      status: 'idle',
      error: null,
    });
  });

  it('should handle logout', () => {
    // FIX: Explicitly type the previous state to match AuthState, resolving the type mismatch error on the 'status' property.
    const previousState: AuthState = {
      isAuthenticated: true,
      user: { email: 'test@example.com', name: 'test' },
      token: 'some-token',
      status: 'succeeded',
      error: null,
    };

    const nextState = authReducer(previousState, logout());

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.status).toBe('idle');
  });
});