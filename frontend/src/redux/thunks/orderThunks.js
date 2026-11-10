import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../api/axiosInstance';

export const createOrder = createAsyncThunk('orders/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', payload);
    return data.order;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/mine');
    return data.orders;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/cancel`);
    return data.order;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});
