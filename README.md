# Mathieu Konstruct Solutions — Real Admin Security Starter

This starter adds a real backend admin system for the Mathieu Konstruct Solutions website.

## What is included

- Node.js + Express backend
- SQLite database
- Server-side admin login
- bcrypt password hashing
- HTTP-only cookie session using signed JWT
- CSRF protection for write requests
- Login rate limiting
- Protected site-data, product, gallery, and password-change endpoints
- Backend admin dashboard at `/admin`
- Static `site-data.js` export endpoint for GitHub Pages
- Optional GitHub Pages public API loader

## Why this is needed

GitHub Pages is static hosting. It can host your public website, but it cannot run a private server-side admin login. Real admin security needs a backend, database, and server-side authentication.

## Quick Start

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

Use the `ADMIN_USERNAME` and `ADMIN_PASSWORD` you placed in `.env`.

## Deployment

See `docs/DEPLOYMENT.md`.

## Security

See `docs/SECURITY-NOTES.md`.
