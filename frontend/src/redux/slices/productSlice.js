import { createSlice } from '@reduxjs/toolkit';
import {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchRecommendations,
  fetchRelated,
} from '../thunks/productThunks';

const initialState = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
  categories: [],
  brands: [],
  selected: null,
  selectedLoading: false,
  selectedError: null,
  recommended: [],
  recommendedStrategy: null,
  related: [],
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.selectedError = null;
      state.related = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.products;
        state.total = payload.total;
        state.page = payload.page;
        state.pages = payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Failed to load products';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
        state.selected = null;
      })
      .addCase(fetchProductById.fulfilled, (state, { payload }) => {
        state.selectedLoading = false;
        state.selected = payload;
      })
      .addCase(fetchProductById.rejected, (state, { payload }) => {
        state.selectedLoading = false;
        state.selectedError = payload || 'Failed to load product';
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.categories = payload.categories;
        state.brands = payload.brands;
      })
      .addCase(fetchRecommendations.fulfilled, (state, { payload }) => {
        state.recommended = payload.products;
        state.recommendedStrategy = payload.strategy;
      })
      .addCase(fetchRelated.fulfilled, (state, { payload }) => {
        state.related = payload.products;
      });
  },
});

export const { clearSelected } = productSlice.actions;
export default productSlice.reducer;
