import { createSlice } from '@reduxjs/toolkit';
import { loginUser, registerUser, validateToken } from '../thunks/authThunks';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const token = localStorage.getItem('token');

const initialState = {
  token,
  user: token ? readUser() : null,
  loading: false,
  error: null,
  // true while a stored token is being verified with the backend
  checking: Boolean(token),
};

const persist = (state, { token: t, user }) => {
  state.token = t;
  state.user = user;
  localStorage.setItem('token', t);
  localStorage.setItem('user', JSON.stringify(user));
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      state.checking = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Authentication failed';
    };
    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        persist(state, action.payload);
      })
      .addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        persist(state, action.payload);
      })
      .addCase(registerUser.rejected, rejected)
      .addCase(validateToken.pending, (state) => {
        state.checking = true;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.checking = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(validateToken.rejected, (state, action) => {
        // Only drop the session when the server rejected the token, not on a network blip
        state.checking = false;
        const msg = String(action.payload || '');
        if (/token|authorized|exist/i.test(msg)) {
          state.token = null;
          state.user = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export const selectIsAuthenticated = (s) => Boolean(s.auth.token && s.auth.user);
export const selectIsAdmin = (s) => s.auth.user?.role === 'admin';
export default authSlice.reducer;
