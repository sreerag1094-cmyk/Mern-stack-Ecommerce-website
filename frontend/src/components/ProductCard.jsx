import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { addToCart } from '../redux/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const out = product.countInStock <= 0;

  return (
    <div className="card flex flex-col overflow-hidden transition hover:shadow-md">
      <Link to={`/product/${product._id}`} className="block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image || 'https://placehold.co/600x400?text=No+Image'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">{product.category}</span>
        <Link to={`/product/${product._id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-indigo-600">
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-sm text-amber-500">
          <FiStar className="fill-current" /> {product.rating?.toFixed(1)}
          <span className="text-slate-400">({product.numReviews})</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          <button
            onClick={() => dispatch(addToCart({ product, quantity: 1 }))}
            disabled={out}
            className="btn btn-primary !px-3 !py-1.5"
            aria-label={`Add ${product.name} to cart`}
          >
            <FiShoppingCart /> {out ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
