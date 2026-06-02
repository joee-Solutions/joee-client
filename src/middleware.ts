import { NextRequest, NextResponse } from "next/server";
import { getTenantConfig } from "./lib/tenant";
import {
  buildWwwStripRedirectUrl,
  parseTenantHost,
} from "./lib/tenant-host";

const rootDomain = process.env.NEXT_PUBLIC_SITE_URL || "localhost:3000";

export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const domainObj = request.nextUrl.clone();
  const host = request.headers.get("host") || "";

  const wwwRedirect = buildWwwStripRedirectUrl(request.url, host);
  if (wwwRedirect) {
    return NextResponse.redirect(wwwRedirect, 308);
  }

  const { tenantSubdomain: subdomain, isApex } = parseTenantHost(host);

  if (!subdomain) {
    if (!isApex) {
      console.log("subdomain does not exist for host:", host);
    }
    if (
      pathName.startsWith("/login") ||
      pathName.startsWith("/dashboard") ||
      pathName.startsWith("/verify-login-otp") ||
      pathName.startsWith("/forgot-password") ||
      pathName.startsWith("/reset-password")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const isValid = isValidSlug(subdomain);
  if (!isValid && host !== rootDomain) {
    return NextResponse.redirect(
      new URL(`${domainObj.protocol}//${rootDomain}/not-found`, request.url)
    );
  }

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
      return NextResponse.redirect(
        new URL(`${domainObj.protocol}//${rootDomain}/not-found`, request.url)
      );
    }

    if (pathName === "/") {
      return NextResponse.redirect(new URL(`/login`, request.url));
    }

    return NextResponse.rewrite(new URL(`/${subdomain}${pathName}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|not-found|assets).*)"],
};

function isValidSlug(slug: string) {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
