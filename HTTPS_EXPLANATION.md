# HTTPS.ts Function Explanation

## Overview
The `https.ts` file is the core HTTP client module that handles all API communication for the application. It provides two axios instances (authenticated and non-authenticated) with automatic token management, refresh logic, and file upload support.

## Key Functions

### 1. **getBaseURL()** (Lines 19-32)
- **Purpose**: Dynamically constructs the API base URL based on the current subdomain
- **Logic**:
  - Extracts subdomain from `window.location.hostname`
  - Production: `https://{subdomain}.joee.com.ng/api`
  - Development: `http://{subdomain}.localhost:3600/api`
- **Use Case**: Multi-tenant architecture where each tenant has its own subdomain

### 2. **httpNoAuth** (Lines 38-56)
- **Purpose**: Axios instance for unauthenticated requests
- **Use Cases**: Login, signup, password reset, public endpoints
- **Features**: No authorization header attached

### 3. **httpAuth** (Lines 58-94)
- **Purpose**: Axios instance for authenticated requests
- **Features**:
  - Automatically attaches `Bearer {token}` header
  - Falls back to refresh token if auth token is missing
  - Used for protected endpoints

### 4. **processRequestNoAuth()** (Lines 96-139)
- **Purpose**: Wrapper function for making unauthenticated HTTP requests
- **Methods Supported**: GET, POST, PUT, DELETE
- **Features**:
  - Handles file uploads (converts to FormData)
  - Supports callbacks for success/error handling
  - Request cancellation via AbortController

### 5. **processRequestAuth()** (Lines 141-200)
- **Purpose**: Wrapper function for making authenticated HTTP requests
- **Methods Supported**: GET, POST, PUT, DELETE
- **Features**:
  - Automatic token refresh on 401 errors
  - Retries original request after token refresh
  - Handles file uploads
  - Error handling with callbacks

### 6. **refreshUser()** (Lines 202-228)
- **Purpose**: Refreshes expired authentication tokens
- **Flow**:
  1. Checks if refresh token exists
  2. Calls `/auth/super/refresh-token` endpoint
  3. Updates cookies with new tokens
  4. Clears cookies if refresh fails
- **Prevents**: Infinite refresh loops with `refreshingToking` flag

### 7. **convertToFormData()** (Lines 230-256)
- **Purpose**: Converts JavaScript objects and files to FormData for multipart uploads
- **Supports**:
  - Single files
  - File arrays
  - File objects with multiple keys
- **Format**: Uses `file[]` notation for backend array parsing

## Bug Fixes Needed

1. **Typeof Check Bug** (Lines 37, 59)
   - Current: `typeof window !== undefined`
   - Issue: `typeof` returns a string, so comparing to `undefined` (value) is always true
   - Fix: Should be `typeof window !== "undefined"`

2. **Cookie Name Inconsistency** (Line 214)
   - Current: Sets `customer` cookie
   - Issue: Codebase uses `user` cookie elsewhere
   - Fix: Should be `user` for consistency

3. **Base URL Construction** (Line 31)
   - Issue: When accessing root domain (`localhost:3000`), subdomain becomes "localhost"
   - This creates invalid URL: `http://localhost.localhost:3600/api`
   - Fix: Handle root domain case separately

4. **Missing PATCH Method** (Line 142)
   - `processRequestAuth` accepts `method: string` but doesn't handle PATCH
   - Should add PATCH support or restrict to specific methods

5. **Type Safety** (Multiple lines)
   - Uses `any` types extensively
   - Should use proper TypeScript types

