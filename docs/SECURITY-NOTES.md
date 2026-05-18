# Security Notes

This upgrade moves authentication and protected data saving to the server side.

Implemented protections:

- Passwords are hashed server-side with bcrypt.
- Login is verified on the backend, not in browser JavaScript.
- Admin session is stored in an HTTP-only cookie.
- Write endpoints require an authenticated admin session.
- CSRF header validation is used for mutating requests.
- Login endpoint has rate limiting.
- CORS is restricted with `FRONTEND_ORIGIN`.
- Secrets are loaded from environment variables.
- Website data is stored in SQLite.

Important limitations:

- SQLite is good for simple admin use, but PostgreSQL/Supabase is better for multi-user or heavy production use.
- If using cookies across domains, you need HTTPS and correct `COOKIE_SECURE`/SameSite settings.
- Do not commit `.env`, database files, or secrets to GitHub.
- GitHub Pages can host the public website, but it cannot run secure admin login by itself.
