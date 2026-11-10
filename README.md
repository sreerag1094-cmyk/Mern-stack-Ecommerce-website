# MERN E-Commerce Platform

Full-stack e-commerce app for the Module 5 assignment.

* `ecommerce-backend/` Node.js, Express, MongoDB (Mongoose), JWT + bcryptjs, RBAC, RapidMiner recommendations
* `ecommerce-frontend/` React (Vite), React Router, Axios, Redux Toolkit, Tailwind CSS

## Run locally

```bash
# terminal 1
cd ecommerce-backend
npm install
cp .env.example .env      # set MONGO_URI and JWT_SECRET
npm run seed              # sample data: admin@example.com / admin123, user@example.com / user123
npm run dev

# terminal 2
cd ecommerce-frontend
npm install
cp .env.example .env
npm run dev
```

## Git and deployment checklist

1. `git init` in each folder (or one repo for both), commit in small steps, push to GitHub.
2. Database: create a free MongoDB Atlas cluster and copy the connection string.
3. Backend on Render: set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.
4. Frontend on Netlify or Vercel: set `VITE_API_URL=https://<backend>/api`.
5. Update `CLIENT_URL` on Render with the final frontend URL.
6. Place real orders, export them with `GET /api/analytics/export?format=basket`, run the RapidMiner process
   (see `ecommerce-backend/rapidminer/README.md`) and import the rules.

## Assignment coverage

| Rubric item | Where |
|---|---|
| Backend CRUD, Auth, RBAC | `controllers/`, `routes/`, `middleware/authMiddleware.js` |
| MERN integration | `src/api/axiosInstance.js`, thunks |
| React components and hooks | `src/components`, `src/pages`, `src/hooks` |
| Redux Toolkit (cart + auth) | `src/redux` |
| Recommendation system | `controllers/analyticsController.js`, `rapidminer/` |
| UI and responsiveness | Tailwind classes throughout |
| Login and protected routes | `ProtectedRoute.jsx`, `authSlice.js` |
| GitHub and deployment | this README, `_redirects`, `vercel.json` |
"# Mern-stack-Ecommerce-website" 
