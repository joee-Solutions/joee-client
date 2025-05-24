import { NextRequest, NextResponse } from "next/server";
import { getTenantConfig } from "./lib/tenant";

const rootDomain = process.env.NEXT_PUBLIC_SITE_URL || "localhost:4100";
export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const domainObj = request.nextUrl.clone();
  const host = request.headers.get("host") || "";
  const subdomain = host.split(".")[0]; // Extract subdomain
  // const subdomain = host.replace(`.${rootDomain}`, ""); // Extract subdomain

  if (!subdomain || subdomain === "www") {
    console.log("subdomain does not exist");
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
    !pathName.startsWith("/_next")
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
      const path = pathName.replace(`/${subdomain}`, "");
      if (path === "/") {
        console.log("redirecting to login");
        console.log("Resolved URL for Redirect:", `/${subdomain}${path}`);

        return NextResponse.redirect(new URL(`/login`, request.url));
      }
      console.log("rewriting to subdomain");
      console.log("Resolved URL for Rewrite:", `/${subdomain}${path}`);

      return NextResponse.rewrite(new URL(`/${subdomain}${path}`, request.url));
    }
  } // Validates the subdomain and ensures that the pathName is not from the one of the directories in our app
  console.log("next response");
  return NextResponse.next(); // Returns the initial route being accessed if a subdomain is not trying to be accessed
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|not-found).*)"],
}; // This matches all routes except those that start with api, _next/static, _next/image and match literal route /favicon.ico

function isValidSlug(slug: string) {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
} // Can be adjusted to any logic you deem fit to validate a subdomain
