import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ErrorMessage from '../components/ErrorMessage';
import { loginUser, registerUser } from '../redux/thunks/authThunks';
import { clearAuthError, selectIsAuthenticated } from '../redux/slices/authSlice';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const isAuth = useSelector(selectIsAuthenticated);
  const { loading, error } = useSelector((s) => s.auth);

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [mode, dispatch]);

  if (isAuth) return <Navigate to={from} replace />;

  const validate = () => {
    const e = {};
    if (mode === 'register' && form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const action =
      mode === 'login'
        ? loginUser({ email: form.email, password: form.password })
        : registerUser(form);
    const res = await dispatch(action);
    if (res.meta.requestStatus === 'fulfilled') navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <div className="card w-full p-6">
        <h1 className="text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
        <p className="mb-5 text-sm text-slate-500">
          {mode === 'login' ? 'Log in to view your orders and check out.' : 'Sign up to start shopping.'}
        </p>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} className={`input ${errors.name ? 'input-error' : ''}`} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} className={`input ${errors.email ? 'input-error' : ''}`} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={onChange} className={`input ${errors.password ? 'input-error' : ''}`} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <ErrorMessage message={error} />

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
          <button
            type="button"
            className="font-semibold text-indigo-600 hover:underline"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
