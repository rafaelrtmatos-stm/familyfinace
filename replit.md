# Contas Pro (Family Finance)

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

- `index.html` — entire app (HTML + CSS + JS, ~4870 lines)
- `package.json` — dependencies and start script
- `logo.png` — transparent logo for in-app display
- `apple-touch-icon.png` — icon with background for iPhone home screen

## Architecture decisions

- Single-file app: all HTML, CSS, and JavaScript are inline in `index.html`
- Uses Supabase for authentication (email/password) and data persistence
- Falls back to `localStorage` (`cpro4_cache`) for offline/local state
- Mobile-first UI with a 390×844 phone shell wrapper for desktop viewing
- Hardcoded user profiles (Rafael/admin, Ingrid/user) with role-based permissions
- Chat messages stored in `app_settings` table with key `cpro4_chat` as JSON array; polled every 8 s
- Themes (Default/Rose/Dark) apply CSS vars to `:root` at runtime; persisted in `localStorage` as `cpro4_theme`
- Add form is a 3-step wizard (amount → category/type → details); step state in `addStep` var, controlled by `goAddStep()`
- `selPM()` scoped to `.pm-row` parent to avoid cross-step chip deselection

## Product

- Multi-user expense and income tracking (designed for a couple)
- Category-based budgeting with donut charts
- Recurring bills management with "Todos" shared-responsible option
- Period filtering (monthly/weekly/daily views)
- WhatsApp export integration
- Admin vs. user role-based permission system
- PWA support: `manifest.json` meta tags, `apple-touch-icon.png`, session persistence ("Permanecer logado")
- Pull-to-refresh: swipe down from top reloads data from Supabase
- Three visual themes: Padrão (blue/green), Rosa, Dark — picker in Usuários screen
- In-app chat between users via bottom-nav Chat tab; unread dot badge; 8 s polling
- Late bills from previous months are summed into the daily ("diária") value; tapping it opens a detail modal
- Edit bill sheet supports changing bill type (À vista / Parcelada / Recorrente)
- Add form: `inputmode="numeric"` on day fields; step-by-step wizard with Avançar/Voltar navigation

## Gotchas

- Supabase credentials are embedded in the HTML (no env vars used)
- The app requires a Supabase project with `profiles`, `bills`, `holidays`, `app_settings` tables
- `app_settings` must allow upsert by key; chat uses key `cpro4_chat`
- favicon.ico is missing (harmless 404 in logs)
- `stopChatPoll()` / `startChatPoll()` must be called on logout / login to avoid ghost polling
- `showPicker()` on month inputs uses try/catch to handle cross-origin iframe SecurityError in dev preview
- `getLateBillsPrevMonths()` respects the current `dashView` user filter (mine/all/custom)

## Pointers

- Supabase JS: https://supabase.com/docs/reference/javascript
- Chart.js: https://www.chartjs.org/docs/latest/
