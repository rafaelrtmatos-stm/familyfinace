# Contas Pro

A Portuguese-language personal finance tracking app (mobile-first) that lets users manage shared expenses, income, and bills with Supabase backend.

## Run & Operate

- **Start**: `npm start` (serves static files on port 5000)
- **No build step** — single `index.html` file

## Stack

- Pure HTML/CSS/JavaScript (no framework, no bundler)
- Supabase JS SDK (CDN) for auth and database
- Chart.js (CDN) for donut/bar charts
- Google Fonts (Nunito)
- `serve` package for static file hosting

## Where things live

- `index.html` — entire app (HTML + CSS + JS, ~4200 lines)
- `package.json` — dependencies and start script

## Architecture decisions

- Single-file app: all HTML, CSS, and JavaScript are inline in `index.html`
- Uses Supabase for authentication (email/password) and data persistence
- Falls back to localStorage (`cpro4_cache`) for offline/local state
- Mobile-first UI with a 390×844 phone shell wrapper for desktop viewing
- Hardcoded user profiles (Rafael/admin, Ingrid/user) with role-based permissions

## Product

- Multi-user expense and income tracking (designed for a couple)
- Category-based budgeting with donut charts
- Recurring bills management
- Period filtering (monthly/weekly/daily views)
- WhatsApp export integration
- Admin vs. user role-based permission system

## User preferences

_Populate as you build_

## Gotchas

- Supabase credentials are embedded in the HTML (no env vars used)
- The app requires a Supabase project with `profiles` and related tables
- favicon.ico is missing (harmless 404 in logs)

## Pointers

- Supabase JS: https://supabase.com/docs/reference/javascript
- Chart.js: https://www.chartjs.org/docs/latest/
