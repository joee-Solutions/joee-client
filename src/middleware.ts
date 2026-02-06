import { NextRequest, NextResponse } from "next/server";
import { getTenantConfig } from "./lib/tenant";

const rootDomain = process.env.NEXT_PUBLIC_SITE_URL || "localhost:3000";
export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const domainObj = request.nextUrl.clone();
  const host = request.headers.get("host") || "";
  
  // Log all requests for debugging (remove in production if too verbose)
  console.log("🔍 Middleware triggered - Host:", host, "Path:", pathName);
  
  // Extract tenant subdomain - handle different domain structures
  let subdomain: string | undefined = undefined;
  
  // For Vercel: {tenant}.{project}.vercel.app or {project}.vercel.app
  if (host.includes(".vercel.app")) {
    const parts = host.split(".");
    // Pattern: tenant.project.vercel.app (4 parts) -> extract tenant (first part)
    // Pattern: project.vercel.app (3 parts) -> no tenant, this is the root domain
    console.log("Vercel host detected:", host, "Parts:", parts, "Length:", parts.length);
    if (parts.length >= 4) {
      // Has tenant subdomain: doe.joee-client-blond.vercel.app
      subdomain = parts[0];
      console.log("✅ Extracted Vercel subdomain:", subdomain, "from host:", host);
    } else {
      // No tenant subdomain: joee-client-blond.vercel.app
      // This is the root domain, don't extract a subdomain
      console.log("⚠️ Vercel root domain detected (no tenant):", host);
      return NextResponse.next();
    }
  }
  // For localhost: {tenant}.localhost:3000 or localhost:3000
  else if (host.includes("localhost")) {
    const parts = host.split(".");
    if (parts.length >= 2 && parts[0] !== "localhost") {
      // Has tenant: doe.localhost:3000
      subdomain = parts[0];
    } else {
      // No tenant: localhost:3000
      console.log("Localhost root domain detected (no tenant):", host);
      return NextResponse.next();
    }
  }
  // For production domains: {tenant}.domain.com or domain.com
  else {
    const parts = host.split(".");
    if (parts.length >= 3 && parts[0] !== "www") {
      // Has tenant subdomain: doe.joee.com.ng
      subdomain = parts[0];
    } else {
      // No tenant: joee.com.ng (root domain)
      console.log("Production root domain detected (no tenant):", host);
      return NextResponse.next();
    }
  }

  if (!subdomain || subdomain === "www") {
    console.log("subdomain does not exist for host:", host);
    // For root domain access, redirect tenant-specific routes to root page
    // This prevents 404 errors when accessing /login without a tenant
    if (pathName.startsWith("/login") || 
        pathName.startsWith("/dashboard") || 
        pathName.startsWith("/verify-otp") ||
        pathName.startsWith("/forgot-password") ||
        pathName.startsWith("/reset-password")) {
      // Redirect tenant-specific routes to root page with a message
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } // Checks to ensure that the subdomain is not "www" to avoid logic errors
  const isValid = isValidSlug(subdomain);
  console.log("isValid -->", isValid);
  if (!isValid && host !== rootDomain) {
    console.log("not valid subdomain and not root domain");
    return NextResponse.redirect(
      new URL(`${domainObj.protocol}//${rootDomain}/not-found`, request.url)
    );
  }
  console.log("pathname-->", pathName);
  // if (host === rootDomain) {
  //   return NextResponse.next();
  // }
  // Note: Use envs to check between environments so localhost:3000 is not checked and redirected to by default

  if (
    isValid &&
    !pathName.startsWith("/api") &&
    !pathName.startsWith("/_next") &&
    !pathName.startsWith("/assets")
  ) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-id", subdomain);
    const tenantConfig = await getTenantConfig(subdomain, requestHeaders);
    if (!tenantConfig) {
      console.log(rootDomain, domainObj.protocol, "redirecting to not found");
      // return NextResponse.rewrite(new URL(`/not-found`, request.url));
      return NextResponse.redirect(
        new URL(`${domainObj.protocol}//${rootDomain}/not-found`, request.url)
      );
    } else {
      // Handle root path redirect to login
      if (pathName === "/") {
        console.log("redirecting to login");
        return NextResponse.redirect(new URL(`/login`, request.url));
      }
      
      // Rewrite URL to tenant-specific route structure
      // Example: /login → /[tenant]/login (matches route structure)
      console.log("rewriting to subdomain route:", `/${subdomain}${pathName}`);
      return NextResponse.rewrite(new URL(`/${subdomain}${pathName}`, request.url));
    }
  } // Validates the subdomain and ensures that the pathName is not from the one of the directories in our app
  console.log("next response");
  return NextResponse.next(); // Returns the initial route being accessed if a subdomain is not trying to be accessed
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|not-found|assets).*)"],
}; // This matches all routes except those that start with api, _next/static, _next/image, assets and match literal route /favicon.ico

function isValidSlug(slug: string) {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
} // Can be adjusted to any logic you deem fit to validate a subdomain
