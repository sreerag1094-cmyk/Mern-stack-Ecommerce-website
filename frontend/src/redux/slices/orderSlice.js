import { createSlice } from '@reduxjs/toolkit';
import { createOrder, fetchMyOrders, cancelOrder } from '../thunks/orderThunks';

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], loading: false, error: null, placing: false, placeError: null, lastOrder: null },
  reducers: {
    clearPlaceError(state) {
      state.placeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.placing = true;
        state.placeError = null;
      })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.placing = false;
        state.lastOrder = payload;
        state.orders.unshift(payload);
      })
      .addCase(createOrder.rejected, (state, { payload }) => {
        state.placing = false;
        state.placeError = payload || 'Could not place order';
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = payload;
      })
      .addCase(fetchMyOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Failed to load orders';
      })
      .addCase(cancelOrder.fulfilled, (state, { payload }) => {
        const i = state.orders.findIndex((o) => o._id === payload._id);
        if (i >= 0) state.orders[i] = payload;
      })
      .addCase(cancelOrder.rejected, (state, { payload }) => {
        state.error = payload || 'Could not cancel order';
      });
  },
});

export const { clearPlaceError } = orderSlice.actions;
export default orderSlice.reducer;
