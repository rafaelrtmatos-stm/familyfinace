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

- `index.html` — entire app (HTML + CSS + JS, ~6100 lines)
- `package.json` — dependencies and start script
- `logo.png` — transparent logo for in-app display
- `apple-touch-icon.png` — icon with background for iPhone home screen

## Architecture decisions

- Single-file app: all HTML, CSS, and JavaScript are inline in `index.html`
- **Single login**: username `adm` / password `qwertyui` — maps internally to Supabase auth with Rafael's email; offline fallback if Supabase unreachable
- **Supabase is the single source of truth** — `bills` data is never read from or written to localStorage; `loadFromSupa()` uses Supabase exclusively; `sdb()` schedules a Supabase upsert with 400ms debounce
- `_pendingDeletes` is an in-memory Set per session (no localStorage) to prevent deleted bills from flickering before Supabase confirms
- Mobile-first UI with a 390×844 phone shell wrapper for desktop viewing
- View filter (`dashView`/`billsView`) values: `'all'` | `'rafael'` | `'ingrid'`; filtering resolves user by name/role from `db.users`; no "Minha" or "Custom" views
- Themes (Default/Rose/Dark) apply CSS vars to `:root` at runtime; persisted in `localStorage` as `cpro4_theme`
- Add form is a 3-step wizard (amount → category/type → details); step state in `addStep` var, controlled by `goAddStep()`
- Cofre (caixa) values synced to Supabase via key `cpro4_cofre`; loaded on login, saved on every deposit/saque/edit/delete/zero
- Realtime sync: `bills` → `startBillsRealtime()` (INSERT/UPDATE/DELETE); `profiles` → `startProfilesRealtime()`; `app_settings` → `startAppSettingsRealtime()`. All start on login, stop on logout. Require `REPLICA IDENTITY FULL` and RLS `FOR ALL TO authenticated USING (true)`.
- 15-second polling fallback (`startBillsPoll`) detects remote `updated_at` changes and reloads if ahead of local
- Bottom nav: Início / Contas / [+FAB] / Gráficos / Usuários (chat removed)

## Product

- Multi-user expense and income tracking (designed for a couple)
- Category-based budgeting with donut charts
- Recurring bills management with "Todos" shared-responsible option
- Period filtering (monthly/weekly/daily views)
- WhatsApp export integration
- View filter in home header: Rafa / Todas / Guigui (same filter applies to Contas and Dashboard screens)
- Home header shows 3 balance cards: Saldo Total / 👤 Rafa / 👤 Guigui (per-user includes shared "todos" bills)
- Add bill form uses toggle buttons (Rafa / Guigui / Todos) instead of a dropdown to select responsável
- PWA support: `manifest.json` meta tags, `apple-touch-icon.png`, session persistence ("Permanecer logado")
- Pull-to-refresh: swipe down from top reloads data from Supabase
- Three visual themes: Padrão (blue/green), Rosa, Dark — picker in Usuários screen
- Late bills from previous months are summed into the daily ("diária") value; tapping it opens a detail modal
- Edit bill sheet supports changing bill type (À vista / Parcelada / Recorrente)

## Gotchas

- Supabase credentials are embedded in the HTML (no env vars used)
- The app requires a Supabase project with `profiles`, `bills`, `holidays`, `app_settings` tables
- RLS required: `ALTER TABLE bills ENABLE ROW LEVEL SECURITY; CREATE POLICY "bills_full_access" ON bills FOR ALL TO authenticated USING (true) WITH CHECK (true);` — same for `app_settings` and `profiles`
- `ALTER TABLE bills REPLICA IDENTITY FULL;` required for Realtime events to deliver cross-user
- `bills` must be in `supabase_realtime` publication: `ALTER PUBLICATION supabase_realtime ADD TABLE bills;`
- favicon.ico is missing (harmless 404 in logs)
- All three realtime channels (`stopBillsRealtime`, `stopProfilesRealtime`, `stopAppSettingsRealtime`) + `stopBillsPoll()` must be called on logout
- `showPicker()` on month inputs uses try/catch to handle cross-origin iframe SecurityError in dev preview
- `getLateBillsPrevMonths()` respects the current `dashView` user filter (rafael/ingrid/all)

## Pointers

- Supabase JS: https://supabase.com/docs/reference/javascript
- Chart.js: https://www.chartjs.org/docs/latest/
