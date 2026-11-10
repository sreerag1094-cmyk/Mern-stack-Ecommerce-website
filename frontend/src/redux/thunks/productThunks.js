import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../api/axiosInstance';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.product;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/categories');
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// "Recommended for you" (RapidMiner rules + user's order history)
export const fetchRecommendations = createAsyncThunk('products/fetchRecommendations', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/analytics/recommendations', { params: { limit: 4 } });
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// "Customers also bought"
export const fetchRelated = createAsyncThunk('products/fetchRelated', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/analytics/recommendations/product/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});
