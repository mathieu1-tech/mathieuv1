# Deployment Guide

## Recommended Architecture

- Public website: GitHub Pages
- Secure admin/backend: Render, Railway, Fly.io, Vercel serverless, Netlify Functions, or another Node-capable host
- Database: SQLite for a simple single-admin setup; PostgreSQL/Supabase is better for larger production use

GitHub Pages is a static site host, so it can publish HTML/CSS/JS but cannot run protected server-side admin routes. The backend in this starter handles server-side login, password hashing, protected API routes, and database saving.

## Local Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Open:

```text
http://localhost:3000/admin
```

## Environment Variables

Set these in `.env` locally and in your host dashboard for production:

```text
NODE_ENV=production
PORT=3000
JWT_SECRET=use_a_long_random_secret
FRONTEND_ORIGIN=https://mathieu1-tech.github.io
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_first_secure_password
DB_PATH=./data/mathieu-admin.sqlite
COOKIE_SECURE=true
```

Do not commit `.env` to GitHub.

## Render Deployment

1. Push the `backend` folder to GitHub.
2. Create a Render Web Service.
3. Use build command: `npm install`.
4. Use start command: `npm start`.
5. Add environment variables from above.
6. Add a persistent disk if using SQLite.
7. Set `DB_PATH` to the persistent disk path, for example `/var/data/mathieu-admin.sqlite`.

## Railway Deployment

1. Create a Railway project.
2. Deploy from GitHub.
3. Add environment variables.
4. Add a volume if using SQLite, or switch to Railway PostgreSQL.

## After Deployment

- Admin URL: `https://YOUR-BACKEND/admin`
- Public data API: `https://YOUR-BACKEND/api/public/site-data`
- Static export JS: `https://YOUR-BACKEND/api/site-data.js`

## Public Website Options

### Option A: Static export
Use admin to download `site-data.js`, then upload it to `assets/js/site-data.js` in GitHub Pages.

### Option B: Runtime API
Add the loader script in `github-pages/backend-site-data-loader.js` and set your backend URL.
