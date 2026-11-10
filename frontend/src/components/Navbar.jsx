import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart, FiMenu, FiX, FiSearch, FiLogOut, FiUser } from 'react-icons/fi';
import { logout, selectIsAuthenticated } from '../redux/slices/authSlice';
import { selectCartCount } from '../redux/slices/cartSlice';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-600'}`;

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector((s) => s.auth.user);
  const cartCount = useSelector(selectCartCount);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/?search=${encodeURIComponent(q.trim())}` : '/');
    setOpen(false);
  };

  const onLogout = () => {
    dispatch(logout());
    setOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-indigo-600">
          ShopHub
        </Link>

        <form onSubmit={onSearch} className="relative hidden flex-1 md:block md:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="input !pl-9" aria-label="Search products" />
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          {isAuth && <NavLink to="/orders" className={linkClass}>Orders</NavLink>}
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          <NavLink to="/cart" className={linkClass}>
            <span className="relative inline-flex items-center gap-1">
              <FiShoppingCart /> Cart
              {cartCount > 0 && (
                <span className="absolute -right-4 -top-3 rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">{cartCount}</span>
              )}
            </span>
          </NavLink>
          {isAuth ? (
            <div className="ml-4 flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-slate-600"><FiUser /> {user?.name}</span>
              <button onClick={onLogout} className="btn btn-outline !py-1.5"><FiLogOut /> Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary ml-4">Login</Link>
          )}
        </nav>

        <button className="ml-auto rounded-md p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <form onSubmit={onSearch}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="input" aria-label="Search products" />
          </form>
          <div className="flex flex-col" onClick={() => setOpen(false)}>
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            {isAuth && <NavLink to="/orders" className={linkClass}>Orders</NavLink>}
            <NavLink to="/contact" className={linkClass}>Contact</NavLink>
            <NavLink to="/cart" className={linkClass}>Cart ({cartCount})</NavLink>
          </div>
          {isAuth ? (
            <button onClick={onLogout} className="btn btn-outline w-full"><FiLogOut /> Logout ({user?.name})</button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="btn btn-primary w-full">Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
