import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

// Usage: <ProtectedRoute><Orders /></ProtectedRoute>   or   <ProtectedRoute adminOnly>...</ProtectedRoute>
export default function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);
  const checking = useSelector((s) => s.auth.checking);
  const user = useSelector((s) => s.auth.user);

  if (checking) return <Loader label="Verifying your session..." />;
  if (!isAuth) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
