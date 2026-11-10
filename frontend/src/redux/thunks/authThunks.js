import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../api/axiosInstance';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data; // { token, user }
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Confirms a stored token is still valid on app load
export const validateToken = createAsyncThunk('auth/validate', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});
