import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiX } from 'react-icons/fi';
import ProductGrid from '../components/ProductGrid';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import useDebounce from '../hooks/useDebounce';
import { fetchProducts, fetchCategories, fetchRecommendations } from '../redux/thunks/productThunks';

const SORT_OPTIONS = [
  ['newest', 'Newest'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['rating', 'Top rated'],
  ['name_asc', 'Name: A-Z'],
];

const FILTER_KEYS = ['search', 'category', 'brand', 'minPrice', 'maxPrice', 'minRating', 'inStock', 'sort', 'page'];

export default function Home() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { items, loading, error, page, pages, total, categories, brands, recommended, recommendedStrategy } =
    useSelector((s) => s.products);
  const token = useSelector((s) => s.auth.token);
  const [showFilters, setShowFilters] = useState(false);

  // Filter values live in the URL so they survive refresh and can be shared
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const [searchText, setSearchText] = useState(filters.search);
  const debouncedSearch = useDebounce(searchText);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  // keep the text box in sync when the navbar search changes the URL
  useEffect(() => setSearchText(filters.search), [filters.search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (debouncedSearch !== filters.search) update({ search: debouncedSearch });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // personalised recommendations; refetch when the user logs in/out
  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch, token]);

  const query = params.toString();
  const load = () => {
    const q = Object.fromEntries([...params.entries()].filter(([, v]) => v));
    dispatch(fetchProducts({ ...q, limit: 8 }));
  };
  useEffect(load, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters = FILTER_KEYS.filter((k) => k !== 'page' && k !== 'sort').some((k) => filters[k]);

  const FilterPanel = (
    <aside className="card space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasFilters && (
          <button onClick={() => { setSearchText(''); setParams({}); }} className="text-sm text-indigo-600 hover:underline">
            Clear all
          </button>
        )}
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Category</span>
        <select className="input" value={filters.category} onChange={(e) => update({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Brand</span>
        <select className="input" value={filters.brand} onChange={(e) => update({ brand: e.target.value })}>
          <option value="">All brands</option>
          {brands.map((b) => <option key={b}>{b}</option>)}
        </select>
      </label>
      <div className="text-sm">
        <span className="mb-1 block font-medium">Price</span>
        <div className="flex gap-2">
          <input type="number" min="0" placeholder="Min" className="input" value={filters.minPrice} onChange={(e) => update({ minPrice: e.target.value })} aria-label="Minimum price" />
          <input type="number" min="0" placeholder="Max" className="input" value={filters.maxPrice} onChange={(e) => update({ maxPrice: e.target.value })} aria-label="Maximum price" />
        </div>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Minimum rating</span>
        <select className="input" value={filters.minRating} onChange={(e) => update({ minRating: e.target.value })}>
          <option value="">Any</option>
          {[4.5, 4, 3, 2].map((r) => <option key={r} value={r}>{r}+ stars</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={filters.inStock === 'true'} onChange={(e) => update({ inStock: e.target.checked ? 'true' : '' })} />
        In stock only
      </label>
    </aside>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-10 text-white sm:px-10">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Find your next favourite thing</h1>
        <p className="mt-2 max-w-xl text-indigo-100">Browse, filter and shop our catalogue, with picks tailored to you.</p>
      </section>

      {recommended.length > 0 && !hasFilters && (
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-bold">
            {recommendedStrategy === 'personalised' ? 'Recommended for you' : 'Popular picks'}
          </h2>
          <ProductGrid products={recommended} />
        </section>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search products..."
          className="input max-w-xs"
          aria-label="Search products"
        />
        <select className="input max-w-[12rem]" value={filters.sort || 'newest'} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort products">
          {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="btn btn-outline lg:hidden" onClick={() => setShowFilters((s) => !s)}>
          {showFilters ? <FiX /> : <FiFilter />} Filters
        </button>
        <span className="ml-auto text-sm text-slate-500">{total} product{total === 1 ? '' : 's'}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>{FilterPanel}</div>

        <div>
          <ErrorMessage message={error} onRetry={load} />
          {loading ? (
            <Loader label="Loading products..." />
          ) : items.length === 0 && !error ? (
            <div className="card p-10 text-center text-slate-500">No products match your filters.</div>
          ) : (
            <ProductGrid products={items} />
          )}

          {pages > 1 && !loading && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button className="btn btn-outline" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Previous</button>
              <span className="text-sm text-slate-600">Page {page} of {pages}</span>
              <button className="btn btn-outline" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
