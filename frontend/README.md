# E-Commerce Frontend (React + Vite + Redux Toolkit + Tailwind)

## Setup

```bash
npm install
cp .env.example .env     # set VITE_API_URL to your backend, e.g. http://localhost:5000/api
npm run dev              # http://localhost:5173
npm run build            # production build in /dist
```

## Features

* Product listing with search, category/brand/price/rating/in-stock filters, sorting and pagination (state kept in the URL)
* Product detail page with "Customers also bought" (RapidMiner-based recommendations)
* Home page "Recommended for you" (personalised after login)
* Redux Toolkit global state: `auth` (token + user), `cart` (persisted), `products`, `orders`
* JWT login / register / logout, token validated against `/auth/me` on load, auto-logout on expired token
* Protected routes (`ProtectedRoute`, supports `adminOnly`)
* Checkout creates an order through the API (server recalculates prices and stock)
* Contact form with client-side validation
* Loading and error states with retry on every API call
* Responsive layout with Tailwind CSS (mobile menu, collapsible filters, fluid grids)

## Structure

```
src/
  api/axiosInstance.js     axios instance (VITE_API_URL, token + 401 interceptors)
  redux/                   store, slices/, thunks/
  components/              Navbar, Footer, ProductCard, ProductGrid, CartItem, ProtectedRoute, Loader, ErrorMessage
  hooks/useDebounce.js
  pages/                   Home, ProductDetail, Cart, Orders, Contact, Login, NotFound
```

## Deploy

**Netlify**: build command `npm run build`, publish directory `dist`, env var `VITE_API_URL=https://<your-render-app>.onrender.com/api`. `public/_redirects` handles React Router refreshes.

**Vercel**: framework preset Vite, same env var. `vercel.json` handles rewrites.

Then add the deployed frontend URL to `CLIENT_URL` in the backend environment (CORS).
