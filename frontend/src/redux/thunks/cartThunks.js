import { createAsyncThunk } from '@reduxjs/toolkit';
import { createOrder } from './orderThunks';
import { clearCart } from '../slices/cartSlice';

// Sends the cart to the backend as an order, then empties the cart.
// Only product ids + quantities are sent: the server recalculates prices and checks stock.
export const checkout = createAsyncThunk(
  'cart/checkout',
  async ({ shippingAddress, paymentMethod }, { dispatch, getState, rejectWithValue }) => {
    const { items } = getState().cart;
    if (!items.length) return rejectWithValue('Your cart is empty');

    const result = await dispatch(
      createOrder({
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress,
        paymentMethod,
      })
    );
    if (createOrder.rejected.match(result)) return rejectWithValue(result.payload || 'Checkout failed');

    dispatch(clearCart());
    return result.payload;
  }
);
