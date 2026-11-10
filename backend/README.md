# E-Commerce Backend (Node.js + Express + MongoDB)

REST API for the MERN e-commerce project: JWT auth with bcryptjs, role-based access control,
product/order/user CRUD, filtering + search + sorting, and a RapidMiner-driven recommendation system.

## Setup

```bash
npm install
cp .env.example .env     # fill in MONGO_URI and JWT_SECRET
npm run seed             # optional: sample data (admin@example.com / admin123)
npm run dev              # http://localhost:5000
```

## Folder structure

```
config/        dbConnection.js
models/        user, product, order, recommendation
controllers/   authentication, userProfile, productController, orderController, analyticsController
routes/        one router per controller
middleware/    authMiddleware (protect, admin, authorize), errorHandler
rapidminer/    how to run the RapidMiner process
```

## API overview

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | /api/auth/register | public | role is always `user` |
| POST | /api/auth/login | public | returns JWT |
| GET | /api/auth/me | user | token validation |
| GET/PUT/DELETE | /api/users/profile | user | own profile |
| GET | /api/users, /api/users/:id | admin | |
| PUT/DELETE | /api/users/:id | admin | PUT can change role |
| GET | /api/products | public | `search, category, brand, minPrice, maxPrice, minRating, inStock, sort, page, limit` |
| GET | /api/products/categories | public | categories + brands for filters |
| GET | /api/products/:id | public | |
| POST/PUT/DELETE | /api/products(/:id) | admin | |
| POST | /api/orders | user | price + stock checked server-side |
| GET | /api/orders/mine | user | |
| GET | /api/orders/:id | owner/admin | |
| PUT | /api/orders/:id/cancel | owner | pending only, restores stock |
| GET | /api/orders | admin | `?status=` |
| PUT | /api/orders/:id/status | admin | |
| DELETE | /api/orders/:id | admin | |
| GET | /api/analytics/recommendations | public (personalised if logged in) | |
| GET | /api/analytics/recommendations/product/:id | public | |
| GET | /api/analytics/export | admin | CSV for RapidMiner |
| POST | /api/analytics/import-rules | admin | RapidMiner rules (CSV/JSON) |
| POST | /api/analytics/rebuild | admin | co-purchase fallback |
| GET | /api/analytics/summary | admin | |

`sort` values: `newest, oldest, price_asc, price_desc, rating, name_asc, name_desc`.

Errors always return `{ success: false, message }` with a proper HTTP status.

## Deploy on Render

New Web Service -> root `ecommerce-backend`, build `npm install`, start `npm start`.
Environment: `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`, `CLIENT_URL` (your deployed frontend URL), `NODE_ENV=production`.
