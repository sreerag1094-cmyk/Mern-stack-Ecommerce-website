import { createSlice } from '@reduxjs/toolkit';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: load() },
  reducers: {
    addToCart(state, { payload }) {
      // payload: { product (full product object), quantity }
      const { product, quantity = 1 } = payload;
      const existing = state.items.find((i) => i.product === product._id);
      const max = product.countInStock;
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, max);
        existing.countInStock = max;
      } else {
        state.items.push({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          countInStock: max,
          quantity: Math.min(quantity, max),
        });
      }
    },
    updateQuantity(state, { payload }) {
      const item = state.items.find((i) => i.product === payload.id);
      if (item) item.quantity = Math.max(1, Math.min(payload.quantity, item.countInStock));
    },
    removeFromCart(state, { payload }) {
      state.items = state.items.filter((i) => i.product !== payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export const selectCartCount = (s) => s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartTotal = (s) => s.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export default cartSlice.reducer;
