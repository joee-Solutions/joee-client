# Middleware vs API Route: Why Both Extract Subdomain

## Key Difference: They Handle DIFFERENT Request Types

### 🔍 Important Discovery

Looking at the middleware configuration:

```typescript
// middleware.ts line 32
if (
  isValid &&
  !pathName.startsWith("/api") &&  // ⚠️ SKIPS API ROUTES!
  !pathName.startsWith("/_next")
) {
  // URL rewriting logic here
}

// middleware.ts line 62
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|not-found).*)"],
  // This EXCLUDES /api routes from middleware!
};
```

---

## Two Separate Flows

### 1. **Middleware** - Handles PAGE Routes (not API)

**Purpose:** Route rewriting for Next.js pages

**What it does:**
- ✅ Extracts subdomain from Host header
- ✅ Validates tenant exists in backend
- ✅ Rewrites URL: `/login` → `/[tenant]/login` 
- ✅ **SKIPS `/api/*` routes** (doesn't process them)

**Why needed:**
Your Next.js routes are structured as:
```
app/(auth)/[tenant]/login/page.tsx
app/(auth)/[tenant]/verify-otp/page.tsx
app/(dashboard)/[tenant]/dashboard/page.tsx
```

But users visit:
```
teef.localhost:3000/login  (no [tenant] in URL)
```

Middleware rewrites this to match your route structure:
```
teef.localhost:3000/login → /[tenant]/login (where tenant = "teef")
```

---

### 2. **API Route** (`route.ts`) - Handles API Routes Only

**Purpose:** Proxy API requests to backend

**What it does:**
- ✅ Extracts subdomain from Host header
- ✅ Adds `x-tenant-id` header
- ✅ Proxies request to backend API
- ✅ **ONLY handles `/api/*` routes**

**Why needed:**
- Frontend makes requests to `/api/tenant/auth/login`
- This route proxies to backend with tenant ID
- Backend receives `x-tenant-id: "teef"` header

---

## Flow Diagram

### Page Request (Middleware handles this)
```
User visits: teef.localhost:3000/login
  ↓
Middleware extracts subdomain: "teef"
  ↓
Middleware validates tenant exists (calls backend)
  ↓
Middleware rewrites: /login → /[tenant]/login (tenant = "teef")
  ↓
Next.js serves: app/(auth)/[tenant]/login/page.tsx
```

### API Request (route.ts handles this)
```
Frontend makes: /api/tenant/auth/login
  ↓
Middleware SKIPS (path starts with /api)
  ↓
API Route (route.ts) extracts subdomain: "teef"
  ↓
API Route adds header: x-tenant-id: "teef"
  ↓
API Route proxies to backend with tenant header
  ↓
Backend processes request
```

---

## Why Both Need Subdomain Extraction

### Middleware needs it for:
1. **URL Rewriting**: `/login` → `/[tenant]/login`
2. **Tenant Validation**: Check if tenant exists before serving page
3. **Route Matching**: Next.js needs the tenant parameter in the URL

### API Route needs it for:
1. **Backend Communication**: Send tenant ID to backend
2. **Tenant Scoping**: Backend needs to know which tenant the API call is for

---

## Could We Eliminate Middleware Subdomain Extraction?

❌ **No, because:**
- Middleware handles **PAGE routes** (not API routes)
- API route handles **API routes** (not page routes)
- They operate on **different request types**
- Middleware runs **before** API route handler

---

## Could We Use Middleware's Subdomain in API Route?

⚠️ **Possible but not recommended:**
- Middleware sets `x-tenant-id` header (line 36)
- API route could read this header instead of extracting again
- **But**: This creates tight coupling between middleware and API route
- Current approach (extract in both) is more explicit and maintainable

---

## Summary

| Feature | Middleware | API Route (`route.ts`) |
|---------|-----------|----------------------|
| **Request Type** | Page routes (`/login`, `/dashboard`) | API routes (`/api/*`) |
| **Purpose** | URL rewriting, tenant validation | API proxying to backend |
| **Subdomain Extraction** | ✅ Yes (for URL rewriting) | ✅ Yes (for backend header) |
| **Runs On** | ALL routes except `/api/*` | ONLY `/api/*` routes |
| **Dependency** | Independent | Independent |

---

## Conclusion

✅ **Both are needed** because they handle different types of requests:
- **Middleware**: Page routing (URL rewriting for Next.js pages)
- **API Route**: API proxying (sending tenant ID to backend)

The subdomain extraction happens in both places because:
1. They operate independently
2. They serve different purposes
3. They handle different request types
4. They run at different stages of the request lifecycle

**This is actually good architecture** - separation of concerns!


