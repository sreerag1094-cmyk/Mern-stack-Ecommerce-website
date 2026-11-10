import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart, FiStar, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ProductGrid from '../components/ProductGrid';
import { fetchProductById, fetchRelated } from '../redux/thunks/productThunks';
import { clearSelected } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: product, selectedLoading, selectedError, related } = useSelector((s) => s.products);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const load = () => {
    dispatch(fetchProductById(id));
    dispatch(fetchRelated(id));
  };

  useEffect(() => {
    load();
    setQty(1);
    setAdded(false);
    window.scrollTo(0, 0);
    return () => dispatch(clearSelected());
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (selectedLoading) return <Loader label="Loading product..." />;
  if (selectedError)
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <ErrorMessage message={selectedError} onRetry={load} />
        <Link to="/" className="btn btn-outline"><FiArrowLeft /> Back to shop</Link>
      </div>
    );
  if (!product) return null;

  const out = product.countInStock <= 0;

  const onAdd = () => {
    dispatch(addToCart({ product, quantity: qty }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
        <FiArrowLeft /> Back to shop
      </Link>

      <div className="card grid gap-8 p-4 md:grid-cols-2 md:p-6">
        <img src={product.image || 'https://placehold.co/600x400?text=No+Image'} alt={product.name} className="w-full rounded-lg object-cover" />
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{product.category}{product.brand && ` · ${product.brand}`}</span>
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <div className="flex items-center gap-1 text-amber-500">
            <FiStar className="fill-current" /> {product.rating?.toFixed(1)}
            <span className="text-sm text-slate-400">({product.numReviews} reviews)</span>
          </div>
          <p className="text-3xl font-extrabold">${product.price.toFixed(2)}</p>
          <p className="text-slate-600">{product.description}</p>
          <p className={`text-sm font-medium ${out ? 'text-red-600' : 'text-emerald-600'}`}>
            {out ? 'Out of stock' : `${product.countInStock} in stock`}
          </p>

          {!out && (
            <div className="flex flex-wrap items-center gap-3">
              <select className="input !w-24" value={qty} onChange={(e) => setQty(Number(e.target.value))} aria-label="Quantity">
                {Array.from({ length: Math.min(product.countInStock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <button onClick={onAdd} className="btn btn-primary">
                {added ? <><FiCheck /> Added</> : <><FiShoppingCart /> Add to cart</>}
              </button>
              <Link to="/cart" className="btn btn-outline">Go to cart</Link>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold">Customers also bought</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
