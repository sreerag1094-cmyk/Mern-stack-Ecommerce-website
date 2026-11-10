import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CartItem from '../components/CartItem';
import ErrorMessage from '../components/ErrorMessage';
import { selectCartTotal } from '../redux/slices/cartSlice';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { clearPlaceError } from '../redux/slices/orderSlice';
import { checkout } from '../redux/thunks/cartThunks';

const EMPTY = { street: '', city: '', state: '', postalCode: '', country: '' };

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);
  const isAuth = useSelector(selectIsAuthenticated);
  const { placing, placeError } = useSelector((s) => s.orders);
  const [address, setAddress] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Add something you like and it will show up here.</p>
        <Link to="/" className="btn btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }

  const change = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    ['street', 'city', 'postalCode', 'country'].forEach((f) => {
      if (!address[f].trim()) e[f] = 'Required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onCheckout = async (e) => {
    e.preventDefault();
    dispatch(clearPlaceError());
    if (!validate()) return;
    const res = await dispatch(checkout({ shippingAddress: address, paymentMethod: 'Cash on Delivery' }));
    if (checkout.fulfilled.match(res)) navigate('/orders');
  };

  const field = (name, label, required = true) => (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}{required && ' *'}</span>
      <input name={name} value={address[name]} onChange={change} className={`input ${errors[name] ? 'input-error' : ''}`} />
      {errors[name] && <span className="text-xs text-red-600">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Shopping cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          {items.map((i) => <CartItem key={i.product} item={i} />)}
        </div>

        <form onSubmit={onCheckout} className="card h-fit space-y-4 p-4" noValidate>
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span>Items ({items.reduce((n, i) => n + i.quantity, 0)})</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>

          {isAuth ? (
            <>
              <h3 className="pt-2 text-sm font-semibold text-slate-500">Shipping address</h3>
              {field('street', 'Street')}
              <div className="grid grid-cols-2 gap-3">
                {field('city', 'City')}
                {field('state', 'State', false)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {field('postalCode', 'Postal code')}
                {field('country', 'Country')}
              </div>
              <p className="text-xs text-slate-500">Payment: Cash on Delivery</p>
              <ErrorMessage message={placeError} />
              <button type="submit" className="btn btn-primary w-full" disabled={placing}>
                {placing ? 'Placing order...' : `Place order · $${total.toFixed(2)}`}
              </button>
            </>
          ) : (
            <Link to="/login" state={{ from: '/cart' }} className="btn btn-primary w-full">
              Login to checkout
            </Link>
          )}
        </form>
      </div>
    </div>
  );
}
