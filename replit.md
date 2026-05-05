# Contas Pro

A Portuguese-language personal finance tracking app (mobile-first) that lets users manage shared expenses, income, and bills with Supabase backend.

## Run & Operate

- **Start**: `npx serve . -l 5000` (serves static files on port 5000)
- **No build step** — single `index.html` file

## Stack

- Pure HTML/CSS/JavaScript (no framework, no bundler)
- Supabase JS SDK (CDN) for auth and database
- Chart.js (CDN) for donut/bar charts
- Google Fonts (Nunito)

## Where things live

- `index.html` — entire app (HTML + CSS + JS, ~4200 lines)

## Architecture decisions

- Single-file app: all HTML, CSS, and JavaScript are inline in `index.html`
- Uses Supabase for authentication (email/password) and data persistence
- Falls back to localStorage (`db` object) for offline/local state
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

## Pointers

- Supabase JS: https://supabase.com/docs/reference/javascript
- Chart.js: https://www.chartjs.org/docs/latest/
