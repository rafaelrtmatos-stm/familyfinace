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

- `index.html` — entire app (HTML + CSS + JS, ~5700 lines)
- `package.json` — dependencies and start script
- `logo.png` — transparent logo for in-app display
- `apple-touch-icon.png` — icon with background for iPhone home screen

## Architecture decisions

- Single-file app: all HTML, CSS, and JavaScript are inline in `index.html`
- Uses Supabase for authentication (email/password) and data persistence
- **Supabase is the single source of truth** — `bills` data is never read from or written to localStorage; `loadFromSupa()` uses Supabase exclusively; `sdb()` schedules a Supabase upsert with 400ms debounce
- `_pendingDeletes` is an in-memory Set per session (no localStorage) to prevent deleted bills from flickering before Supabase confirms
- Mobile-first UI with a 390×844 phone shell wrapper for desktop viewing
- Hardcoded user profiles (Rafael/admin, Ingrid/user) with role-based permissions; `rafaelrtmatos@gmail.com` is always forced to admin role at login regardless of Supabase profile value
- Chat messages stored in `app_settings` table with key `cpro4_chat` as JSON array; delivered via Supabase Realtime (`postgres_changes` on UPDATE, channel `chat-rt`); 30 s polling as fallback; presence (last-seen + readTs) in key `cpro4_presence` per user id; presence heartbeat every 30 s
- Chat supports text, audio (base64 WebM via MediaRecorder), and system messages (isSystem:true, centered display)
- Themes (Default/Rose/Dark) apply CSS vars to `:root` at runtime; persisted in `localStorage` as `cpro4_theme`
- Add form is a 3-step wizard (amount → category/type → details); step state in `addStep` var, controlled by `goAddStep()`
- `selPM()` scoped to `.pm-row` parent to avoid cross-step chip deselection
- Cofre (caixa) values synced to Supabase via key `cpro4_cofre` (object of localStorage keys → values); loaded on login, saved on every deposit/saque/edit/delete/zero
- Realtime sync: `bills` → `startBillsRealtime()` (INSERT/UPDATE/DELETE); `profiles` → `startProfilesRealtime()` (INSERT/UPDATE — cofre sync + new users); `app_settings` → `startAppSettingsRealtime()` (INSERT/UPDATE/DELETE — cats, couple, settings sync). All three start on login, stop on logout. All require `REPLICA IDENTITY FULL` and RLS policy `FOR ALL TO authenticated USING (true)`.
- New user creation uses a temp Supabase client (`{auth:{persistSession:false}}`) for `signUp` so the admin session is preserved; profile is upserted into `profiles` table with the new auth UUID.
- Non-admin users default to `dashView='mine'` and `billsView='mine'` on login, showing only their own bills. Admin defaults to `'all'`.
- `changePass()` calls `getSupa().auth.updateUser({password})` to sync the new password to Supabase Auth.

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
- In-app chat: unread dot badge, 8 s polling, online presence / "Visto por último HH:MM", read receipts (✓ / ✓✓ green)
- Late bills from previous months are summed into the daily ("diária") value; tapping it opens a detail modal
- Edit bill sheet supports changing bill type (À vista / Parcelada / Recorrente)
- Add form: `inputmode="numeric"` on day fields; step-by-step wizard with Avançar/Voltar navigation
- "Novo Usuário" creates account in Supabase Auth (email + password) + profile row; user can log in immediately

## Gotchas

- Supabase credentials are embedded in the HTML (no env vars used)
- The app requires a Supabase project with `profiles`, `bills`, `holidays`, `app_settings` tables
- RLS fix SQL: `CREATE POLICY "bills_full_access" ON bills FOR ALL TO authenticated USING (true) WITH CHECK (true);` + same for `app_settings`
- `ALTER TABLE bills REPLICA IDENTITY FULL;` required for Realtime events to deliver cross-user
- `app_settings` must allow upsert by key; chat uses `cpro4_chat`; presence uses `cpro4_presence`
- favicon.ico is missing (harmless 404 in logs)
- `stopChatPoll()` / `startChatPoll()` and all three realtime channels (`stopBillsRealtime`, `stopProfilesRealtime`, `stopAppSettingsRealtime`) must be called on logout to avoid ghost listeners
- `showPicker()` on month inputs uses try/catch to handle cross-origin iframe SecurityError in dev preview
- `getLateBillsPrevMonths()` respects the current `dashView` user filter (mine/all/custom)
- Admin password reset via app only updates local/profile; Supabase Auth password reset for other users requires service role key (not available client-side)

## Pointers

- Supabase JS: https://supabase.com/docs/reference/javascript
- Chart.js: https://www.chartjs.org/docs/latest/
