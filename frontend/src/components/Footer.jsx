import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-indigo-600">Shop</Link>
          <Link to="/contact" className="hover:text-indigo-600">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
