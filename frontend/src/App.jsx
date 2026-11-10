import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { validateToken } from './redux/thunks/authThunks';
import { logout } from './redux/slices/authSlice';

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Validate a stored token with the backend when the app loads
  useEffect(() => {
    if (localStorage.getItem('token')) dispatch(validateToken());
  }, [dispatch]);

  // axios interceptor fires this when the server answers 401 (expired/invalid token)
  useEffect(() => {
    const onExpired = () => {
      dispatch(logout());
      navigate('/login', { state: { from: window.location.pathname } });
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
