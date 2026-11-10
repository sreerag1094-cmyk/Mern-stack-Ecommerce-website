import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';

export default function CartItem({ item }) {
  const dispatch = useDispatch();

  return (
    <div className="card flex items-center gap-4 p-3 sm:p-4">
      <img src={item.image || 'https://placehold.co/120x120'} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <Link to={`/product/${item.product}`} className="block truncate font-semibold hover:text-indigo-600">
          {item.name}
        </Link>
        <p className="text-sm text-slate-500">${item.price.toFixed(2)} each</p>
        <div className="mt-2 inline-flex items-center rounded-lg border border-slate-300">
          <button
            className="p-2 hover:bg-slate-100 disabled:opacity-40"
            disabled={item.quantity <= 1}
            onClick={() => dispatch(updateQuantity({ id: item.product, quantity: item.quantity - 1 }))}
            aria-label="Decrease quantity"
          >
            <FiMinus />
          </button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <button
            className="p-2 hover:bg-slate-100 disabled:opacity-40"
            disabled={item.quantity >= item.countInStock}
            onClick={() => dispatch(updateQuantity({ id: item.product, quantity: item.quantity + 1 }))}
            aria-label="Increase quantity"
          >
            <FiPlus />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
        <button onClick={() => dispatch(removeFromCart(item.product))} className="text-red-500 hover:text-red-700" aria-label={`Remove ${item.name}`}>
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
