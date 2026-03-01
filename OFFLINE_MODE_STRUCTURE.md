# Offline Mode – Structure & Architecture

This document defines the structure for **offline-first** behaviour (similar to WhatsApp and Google Docs): users can log in with saved credentials when there is no network, navigate all pages, and perform actions that sync when back online.

---

## 1. Goals (WhatsApp / Google Docs style)

| Behaviour | Target |
|-----------|--------|
| **Offline login** | If the user has previously chosen “work offline” / “remember me”, they can open the app when offline and “log in” using stored credentials; we restore the last session (tokens + user) from local storage. |
| **Already logged in → go offline** | If the user was online and logged in, going offline does not log them out. They keep using the app with cached data and see an “offline” indicator. |
| **Navigate all pages** | All dashboard routes (patients, appointments, schedules, notifications, settings, etc.) are available offline and render from cached data when there is no network. |
| **Actions offline** | Create / edit / delete (patients, appointments, schedules, etc.) are allowed offline; changes are queued and sent when back online. |
| **Sync when back online** | When connectivity returns, we sync queued mutations and refresh cache; user sees “Syncing…” then up-to-date data. |

---

## 2. Current State Summary

- **Auth**
  - Login: `processRequestNoAuth` → backend returns tokens + user.
  - Tokens and user stored in **Cookies**: `auth_token`, `refresh_token`, `user`, `otp_verified`, `mfa_token`.
  - No auth in middleware; client (`src/app/page.tsx`) checks `Cookies.get("auth_token")` and redirects to login when missing.
  - Token read via `getToken()` / `getRefreshToken()` from `get-token.ts` (Cookies).

- **API**
  - All calls go through `processRequestAuth` / `processRequestNoAuth` in `src/framework/https.ts` → `/api` Next.js proxy → backend.
  - Dashboard pages call `processRequestAuth("get", ...)` and similar directly; no offline branch.

- **Existing offline pieces**
  - **IndexedDB** (`src/lib/offline-db.ts`): stores `patients`, `employees`, `departments`, `appointments`, `organizations`, `schedules`, `queuedRequests`, `syncQueue`.
  - **useOffline** (`src/hooks/useOffline.ts`): `getCachedData`, `queueRequest`, `addToSyncQueue`, `syncData` on reconnect; not wired into auth or main API layer.
  - **Service worker** (`public/sw.js`): caches static assets and GET API responses; returns 503 for failed API and mentions queuing (generic).
  - **Offline page** (`public/offline.html`): shown when document request fails offline.
  - **offline-https.ts**: currently empty; intended as the offline-aware API layer.

- **Gaps**
  1. No “offline login”: if the user has never logged in on this device while online, there is no way to “log in” when offline.
  2. Auth is not persisted for offline: we need a way to keep “last session” (tokens + user) in a durable store (e.g. IndexedDB) so that after closing the tab we can restore it when offline.
  3. No single API layer that chooses “network vs cache + queue”; pages use `processRequestAuth` directly.
  4. Login page does not offer “Remember me / Use offline” or “Restore last session” when offline.
  5. Service worker does not align with tenant-prefixed API paths and does not integrate with the app’s auth/cache strategy.

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UI (Pages)                                  │
│  Login │ Dashboard │ Patients │ Appointments │ Schedules │ Settings …    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                 │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                    Offline-aware API layer                                │
│  (offline-https / processRequestOfflineAuth / data hooks)                 │
│  • If online  → processRequestAuth / processRequestNoAuth                │
│  • If offline → read from IndexedDB cache + queue mutations               │
└───────────────┬─────────────────────────────────┬───────────────────────┘
                │                                 │
┌───────────────▼──────────────┐    ┌─────────────▼──────────────┐
│  Network (https.ts)           │    │  Offline store             │
│  • processRequestAuth         │    │  • offline-db (IndexedDB)  │
│  • processRequestNoAuth       │    │  • auth store (session)    │
│  • Token refresh              │    │  • queuedRequests          │
│  • /api proxy → backend       │    │  • syncQueue               │
└──────────────────────────────┘    └─────────────────────────────┘
                │                                 │
                └──────────────┬──────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Sync on reconnect   │
                    │  • Replay queue     │
                    │  • Refresh cache    │
                    └────────────────────┘
```

---

## 4. Component Design

### 4.1 Auth & offline login

- **Online login (unchanged)**  
  User submits email/password → backend → we receive tokens + user → we write to **Cookies** (current behaviour) and, for offline support, also write to **auth store** (see below).

- **Auth store (new)**  
  A small, persistent store (e.g. IndexedDB table or dedicated key in existing DB) that holds:
  - **Last session**: `auth_token`, `refresh_token`, `user` (and optionally `tenant`), `expiresAt` (or token exp).
  - **Offline login** (optional, user opt-in):  
    - Either: a **one-time offline token** from the server (e.g. “offline_access” token) stored after successful online login, **or**  
    - **Stored credentials**: “Remember me for offline” stores a secure, client-side representation (e.g. email + encrypted/hashed password or a long-lived device token).  
  Prefer **last session + optional offline token** first; stored password only if product requires “full offline login” with email/password form when offline.

- **Offline login flow**
  1. User opens app while offline (or with “no data”).
  2. If **last session** exists and is not expired (or we accept “use last session” when offline despite expiry), restore it into Cookies (in memory only for the tab) and treat user as logged in; show dashboard from cache.
  3. If we support “offline login” with credentials: show login form; on submit, validate against **stored credentials**; if match, restore **last session** from auth store and proceed. No network call.
  4. If no last session and no stored credentials (or validation fails), show a message: “You need to connect to the internet to sign in” (and optionally “Retry” when online).

- **Where auth is checked**
  - **Client**: Before rendering dashboard (or in a layout), check: `getToken()` or auth store. If offline and no token in Cookies, try restoring from auth store; then allow or redirect to login.
  - **Middleware**: Keep current behaviour; optional: when request is for a dashboard route and we cannot read cookies in middleware, allow the request and let client decide (so offline client can still load the app and restore session from IndexedDB).

### 4.2 Offline-aware data layer

- **Single entry point for authenticated API**
  - New: `processRequestOfflineAuth(method, path, data?, options?)` (or a wrapper in `offline-https.ts`).
  - Behaviour:
    - **Online**: call existing `processRequestAuth`; on success, **update cache** for GET (e.g. normalize and write to `offline-db` by tenant).
    - **Offline**:  
      - **GET**: read from IndexedDB (by path/tenant and entity); return same shape as API (e.g. `{ data: { data: [...] } }`) so pages do not need to change.
      - **POST/PUT/PATCH/DELETE**: write to local cache (optimistic update), push to **syncQueue** or **queuedRequests** with full request (url, method, headers, body); return success to UI.

- **Entity ↔ path mapping**
  - Map API paths to offline stores: e.g. `GET /tenant/patient` → `patients` store; `GET /tenant/appointment` → `appointments`; etc. (use `API_ENDPOINTS` and a small mapping table.)

- **Tenant**
  - All cache keys and auth store entries are scoped by **tenant** (from path or subdomain) so multi-tenant remains correct.

### 4.3 Caching strategy

- **When to write cache**
  - After any successful GET that returns list/detail for patients, appointments, schedules, employees, departments, notifications, backups, etc.
  - Normalize response (e.g. `res.data.data` or `res.data`) into an array and call `offlineDB.cacheData(storeName, array, tenantId)`.

- **When to read from cache**
  - When `navigator.onLine === false` or when a **deliberate “offline mode”** is on (optional).
  - When online but request fails (e.g. timeout), optionally fall back to cache and mark “stale” in UI.

### 4.4 Sync when back online

- **Order**
  1. Replay **queuedRequests** in order (or by dependency if we introduce ordering later).
  2. Then run **syncQueue** (entity-based create/update/delete) if used.
  3. Then refresh critical GETs (e.g. patients, appointments, schedules) and update cache.

- **Conflict handling**
  - First version: “last write wins” (server response overwrites local). Later: optional conflict UI (e.g. “Server has newer version”) if needed.

- **Where sync runs**
  - In `useOffline` when `status.isOnline` flips to `true` (already have `syncData()`); ensure it calls the **same** queue that `processRequestOfflineAuth` writes to, and that replayed requests use `processRequestAuth` (so tokens are attached).

### 4.5 PWA & Service worker

- **Role**
  - **Service worker** (`public/sw.js`): Caches static assets and app shell (HTML, JS, CSS, images) so the app **loads** when the user opens it offline. For `/api/*` the SW returns 503 when offline; the **client** (offline-https + IndexedDB) handles data cache and queue.
  - **Registration**: `ServiceWorkerRegistration` component registers `/sw.js` in the browser (production only) so the SW actually runs.
  - **Manifest** (`public/manifest.json`): Web app manifest for “Add to Home Screen”, app name, theme color, icons. Linked via `metadata.manifest` in the root layout.

- **Why both**
  - **PWA (SW + manifest)**: Ensures the app shell is cached and the URL loads when offline; without it, opening the app while offline can show a browser error page.
  - **Client (IndexedDB + processRequestOfflineAuth)**: Handles cached data and queued mutations; the SW does not have access to IndexedDB in a useful way, so sync runs in the client when back online.

### 4.6 UI behaviour

- **Indicators**
  - Global “You’re offline” banner or header indicator (e.g. in `MainHeader`); optional “Syncing…” when replaying queue after reconnect.

- **Login page**
  - When offline: if we have **last session** in auth store, optionally show “Continue as [user]” and restore; else show “Sign in when online” or “Use saved account” (offline login) if implemented.

- **Dashboard and list pages**
  - Use the **offline-aware API** (e.g. `processRequestOfflineAuth` or hooks that use it). No change to page structure beyond switching from `processRequestAuth` to the new layer.

- **Forms (create/edit)**
  - On submit: call offline-aware layer; if offline, show “Saved locally; will sync when online.”

---

## 5. Data Flow Summary

| Scenario | Flow |
|----------|------|
| **Online, first load** | Request → processRequestOfflineAuth → processRequestAuth → backend → response → update cache → return to UI. |
| **Online, later load** | Same; cache is updated so next offline use has fresh data. |
| **Offline, page load** | processRequestOfflineAuth sees offline → read from IndexedDB → return to UI. |
| **Offline, create/update/delete** | processRequestOfflineAuth → write to cache (optimistic) + add to queue → return success to UI. |
| **Back online** | useOffline detects online → syncData() → replay queue → refresh GETs → update cache; UI can refetch or listen to a “synced” event. |

---

## 6. File / Module Structure (proposed)

```
src/
├── framework/
│   ├── https.ts                    # Keep as-is (network-only)
│   ├── offline-https.ts             # New: processRequestOfflineAuth, path→store mapping, queue writes
│   ├── api-endpoints.ts             # Keep; add optional "entity" map for offline store names
│   └── get-token.ts                 # Keep; optionally read from auth store when cookie missing
├── lib/
│   ├── offline-db.ts                # Extend: add auth store (e.g. lastSession, offlineCredentials)
│   └── auth-store.ts                # Optional: dedicated API for last session + offline login
├── hooks/
│   ├── useOffline.ts                # Keep; ensure sync uses same queue and processRequestAuth
│   └── useOfflineData.ts            # Optional: getCachedData + fetch with offline fallback per entity
├── contexts/
│   └── OfflineProvider.tsx          # Optional: provide isOnline, syncStatus, and offline API
├── app/
│   ├── (auth)/[tenant]/login/
│   │   └── page.tsx                 # Add: offline detection; "Continue as [user]"; optional "Remember for offline"
│   ├── (dashboard)/[tenant]/dashboard/
│   │   └── ...                      # Switch to processRequestOfflineAuth or useOfflineData
│   └── page.tsx                     # Auth check: if offline, try restore from auth store before redirect
├── components/
│   └── shared/
│       └── MainHeader.tsx           # Add offline indicator / syncing indicator
public/
├── sw.js                            # Adjust: don’t cache API body; optional app shell
└── offline.html                     # Keep
```

---

## 7. Security Considerations

- **Stored credentials**  
  If we store anything for “offline login”, use a secure method (e.g. encrypt with a key derived from user gesture or device-bound key). Prefer “last session” + “offline token” over storing raw passwords.

- **Tokens in IndexedDB**  
  Auth store will hold tokens; same-origin policy applies. Prefer not to store refresh token in IndexedDB if we can avoid it; if we do, treat it like cookies (httpOnly equivalent not possible in IDB, so minimise exposure).

- **Logout**  
  Clear Cookies **and** auth store (last session / offline credentials) so offline login is no longer possible until next online login.

---

## 8. Phased Implementation

| Phase | Scope | Outcome |
|-------|--------|--------|
| **1. Structure & auth store** | Add auth store (last session) in IndexedDB; write to it on login; read from it when cookie missing and we’re offline. No “offline login” form yet. | After going offline, already-logged-in users stay “in” and don’t get redirected to login. |
| **2. Offline-aware API layer** | Implement `offline-https.ts`: processRequestOfflineAuth, GET→cache, POST/PUT/DELETE→queue; map paths to stores. | One place to switch between network and cache+queue. |
| **3. Wire dashboard to offline layer** | Replace `processRequestAuth` with `processRequestOfflineAuth` (or hooks that use it) on dashboard and list pages. Ensure GET responses write cache. | All main pages work offline with cached data. |
| **4. Sync and queue replay** | Unify queue format; replay on reconnect using processRequestAuth; refresh cache. | Mutations made offline sync when back online. |
| **5. Offline login (optional)** | Login page: when offline, show “Continue as [name]” from auth store; optional “Remember for offline” to store secure credential for full offline login. | User can open app offline and “log in” without network. |
| **6. Polish** | Offline/syncing indicators, error messages, conflict handling (if any). | Clear UX and robustness. |

---

## 9. Success Criteria

- User can log in while online and continue using the app when offline (no unexpected logout).
- User can open all dashboard pages offline and see last cached data.
- User can create/edit/delete entities offline; changes sync when back online.
- Optionally: user can “log in” when offline using a previously saved session or stored credentials.
- Sync completes after reconnect and UI reflects server state (or clear error if sync fails).

---

## 10. Testing offline

- **Production build (PWA + SW):** Run `npm run build && npm run start`. The service worker registers only in production, so use this to test “open app while offline” (cached app shell).
- **Chrome DevTools:** Application → Service Workers to confirm SW is registered; Application → Storage → IndexedDB to inspect `joee-offline` (authSession, queuedRequests, cached entities).
- **Simulate offline:** DevTools → Network → “Offline”, or use the browser’s offline mode. Then:
  - If already logged in: navigate dashboard; data should come from cache; mutations should queue and header show “You’re offline”.
  - If you open the login page offline and had a previous session: “Continue as [name]” should restore and redirect to dashboard.
- **Sync:** Turn network back on; the “Syncing your changes…” bar should appear briefly and queued requests should replay (check Network tab for POST/PATCH/DELETE).

This structure keeps the existing auth and API behaviour, adds a clear offline path (auth store + offline-https + cache + queue), and aligns with how WhatsApp and Google Docs support offline use and sync.
