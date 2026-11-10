import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { fetchMyOrders, cancelOrder } from '../redux/thunks/orderThunks';

const BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-200 text-slate-600',
};

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((s) => s.orders);

  const load = () => dispatch(fetchMyOrders());
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onCancel = (id) => {
    if (window.confirm('Cancel this order?')) dispatch(cancelOrder(id));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">My orders</h1>
      <ErrorMessage message={error} onRetry={load} />
      {loading ? (
        <Loader label="Loading orders..." />
      ) : orders.length === 0 && !error ? (
        <div className="card p-10 text-center text-slate-500">
          You have no orders yet. <Link to="/" className="text-indigo-600 hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs text-slate-500">Order #{o._id.slice(-8)}</p>
                  <p className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${BADGE[o.status]}`}>{o.status}</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {o.items.map((i) => (
                  <li key={i.product} className="flex items-center gap-3 py-2 text-sm">
                    <img src={i.image || 'https://placehold.co/60x60'} alt="" className="h-12 w-12 rounded object-cover" />
                    <Link to={`/product/${i.product}`} className="flex-1 hover:text-indigo-600">{i.name}</Link>
                    <span className="text-slate-500">{i.quantity} × ${i.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-3">
                <span className="font-bold">Total: ${o.totalPrice.toFixed(2)}</span>
                {o.status === 'pending' && (
                  <button onClick={() => onCancel(o._id)} className="btn btn-outline !py-1 text-red-600">Cancel order</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
