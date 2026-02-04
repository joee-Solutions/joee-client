import { processResponse } from "@/framework/joee.client";
import { getRequestInfo } from "@/framework/log-request-helper";
import { siteConfig } from "@/framework/site-config";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
const apiUrl = siteConfig.host;

// Helper function to extract tenant subdomain from request
const getTenantId = (req: NextRequest): string | undefined => {
  const host = req.headers.get("host") || "";
  
  // Extract tenant subdomain - handle different domain structures
  let subdomain: string | undefined = undefined;
  
  // For Vercel: {tenant}.{project}.vercel.app or {project}.vercel.app
  if (host.includes(".vercel.app")) {
    const parts = host.split(".");
    // Pattern: tenant.project.vercel.app (4 parts) -> extract tenant (first part)
    // Pattern: project.vercel.app (3 parts) -> no tenant, this is the root domain
    if (parts.length >= 4) {
      // Has tenant subdomain: doe.joee-client-blond.vercel.app
      subdomain = parts[0];
      console.log("✅ Extracted tenant ID from Vercel host:", host, "->", subdomain);
    } else {
      // No tenant subdomain: joee-client-blond.vercel.app
      // This is the root domain, don't extract a subdomain
      console.log("⚠️ Vercel root domain detected (no tenant):", host);
      return undefined;
    }
  }
  // For localhost: {tenant}.localhost:3000 or localhost:3000
  else if (host.includes("localhost")) {
    const parts = host.split(".");
    if (parts.length >= 2 && parts[0] !== "localhost") {
      // Has tenant: doe.localhost:3000
      subdomain = parts[0];
      console.log("✅ Extracted tenant ID from localhost:", host, "->", subdomain);
    } else {
      // No tenant: localhost:3000
      console.log("⚠️ Localhost root domain detected (no tenant):", host);
      return undefined;
    }
  }
  // For production domains: {tenant}.domain.com or domain.com
  else {
    const parts = host.split(".");
    if (parts.length >= 3 && parts[0] !== "www") {
      // Has tenant subdomain: doe.joee.com.ng
      subdomain = parts[0];
      console.log("✅ Extracted tenant ID from production host:", host, "->", subdomain);
    } else {
      // No tenant: joee.com.ng (root domain)
      console.log("⚠️ Production root domain detected (no tenant):", host);
      return undefined;
    }
  }
  
  // Only return subdomain if it's a valid tenant (not localhost, www, or empty)
  if (subdomain && subdomain !== "localhost" && subdomain !== "www" && subdomain.length > 0) {
    return subdomain;
  }
  
  console.warn("Could not extract tenant ID from host:", host);
  return undefined;
};
export async function GET(req: NextRequest) {
  const requestPath = new URL(req.url).pathname;
  const pathName = requestPath.split("/api")[1];
  const clientInfo = await getRequestInfo(req);
  console.log("clientInfo-->", clientInfo);
  const authorization =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const tenantId = getTenantId(req);
  const query = req.nextUrl.searchParams;
  const queryString = query.toString();

  // Log tenant ID for debugging
  if (!tenantId) {
    console.warn("⚠️ No tenant ID extracted for request:", pathName, "Host:", req.headers.get("host"));
  } else {
    console.log("✅ Tenant ID extracted:", tenantId, "for path:", pathName);
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-client-info": JSON.stringify(clientInfo),
      "x-client-host": clientInfo["host"],
      "x-client-protocol": clientInfo["protocol"],
    };
    
    if (authorization) {
      headers["Authorization"] = authorization;
    }
    
    // Always include x-tenant-id if we have it, otherwise backend should handle missing tenant
    if (tenantId) {
      headers["x-tenant-id"] = tenantId;
    }
    
    const res = await axios.get(
      `${apiUrl}${pathName}${queryString ? "?" + queryString : ""}`,
      { headers }
    );
    const response = processResponse(res);
    return Response.json({ ...response });
  } catch (error: any) {
    if (error && error.response) {
      console.log(error, "--> error");
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    } else if (error) {
      return NextResponse.json(error, { status: 500 });
    } else {
      return NextResponse.json("An error occurred", { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  const requestPath = new URL(req.url).pathname;
  const pathName = requestPath.split("/api")[1];
  const clientInfo = await getRequestInfo(req);
  console.log("clientInfo-->", clientInfo);
  const authorization =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const tenantId = getTenantId(req);
  const contentType = req.headers.get("Content-Type");
  const isMultipart = contentType?.includes("multipart/form-data");
  const body = isMultipart
    ? await req.formData()
    : contentType?.includes("application/json")
    ? await req.json()
    : await req.json();
  console.log("body-->", body, isMultipart);
  const query = req.nextUrl.searchParams;
  const queryString = query.toString();
  const path = `${apiUrl}${pathName}${queryString ? "?" + queryString : ""}`;
  
  // Log tenant ID for debugging
  if (!tenantId) {
    console.warn("⚠️ No tenant ID extracted for POST request:", pathName, "Host:", req.headers.get("host"));
  } else {
    console.log("✅ Tenant ID extracted:", tenantId, "for POST path:", pathName);
  }
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": contentType || "application/json",
      "x-client-info": JSON.stringify(clientInfo),
      "x-client-host": clientInfo["host"],
      "x-client-protocol": clientInfo["protocol"],
    };
    
    if (authorization) {
      headers["Authorization"] = authorization;
    }
    
    // Always include x-tenant-id if we have it
    // For login endpoint, tenant ID is required by backend
    if (tenantId) {
      headers["x-tenant-id"] = tenantId;
    } else if (pathName.includes("/auth/login")) {
      // Log warning for login without tenant ID
      console.error("❌ Login request without tenant ID! Host:", req.headers.get("host"));
    }
    
    // Log request details for debugging
    console.log("📤 POST Request:", {
      path: pathName,
      tenantId: tenantId || "MISSING",
      hasAuth: !!authorization,
      bodyKeys: typeof body === "object" ? Object.keys(body) : "N/A"
    });
    
    const res = await axios.post(
      path,
      isMultipart ? body : JSON.stringify(body),
      { headers }
    );
    const response = processResponse(res);
    return Response.json({ ...response });
  } catch (error: any) {
    if (error && error.response) {
      console.log(error, "--> error");
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    } else if (error) {
      return NextResponse.json(error, { status: 500 });
    } else {
      return NextResponse.json("An error occurred", { status: 500 });
    }
  }
}

export async function PUT(req: NextRequest) {
  const requestPath = new URL(req.url).pathname;
  const pathName = requestPath.split("/api")[1];
  const clientInfo = await getRequestInfo(req);
  console.log("clientInfo-->", clientInfo);
  const authorization =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const tenantId = getTenantId(req);
  const contentType = req.headers.get("Content-Type");
  const isMultipart = contentType?.includes("multipart/form-data");
  const body = isMultipart
    ? await req.formData()
    : contentType?.includes("application/json")
    ? await req.json()
    : await req.json();
  console.log("body-->", body, isMultipart);
  const query = req.nextUrl.searchParams;
  const queryString = query.toString();
  const path = `${apiUrl}${pathName}${queryString ? "?" + queryString : ""}`;
  
  if (!tenantId) {
    console.warn("⚠️ No tenant ID extracted for PUT request:", pathName);
  }
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": contentType || "application/json",
      "x-client-info": JSON.stringify(clientInfo),
      "x-client-host": clientInfo["host"],
      "x-client-protocol": clientInfo["protocol"],
    };
    
    if (authorization) {
      headers["Authorization"] = authorization;
    }
    
    if (tenantId) {
      headers["x-tenant-id"] = tenantId;
    }
    
    const res = await axios.put(
      path,
      isMultipart ? body : JSON.stringify(body),
      { headers }
    );
    const response = processResponse(res);
    return Response.json({ ...response });
  } catch (error: any) {
    if (error && error.response) {
      console.log(error, "--> error");
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    } else if (error) {
      return NextResponse.json(error, { status: 500 });
    } else {
      return NextResponse.json("An error occurred", { status: 500 });
    }
  }
}

export async function DELETE(req: NextRequest) {
  const requestPath = new URL(req.url).pathname;
  const pathName = requestPath.split("/api")[1];
  const clientInfo = await getRequestInfo(req);
  console.log("clientInfo-->", clientInfo);
  const authorization =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const tenantId = getTenantId(req);
  const query = req.nextUrl.searchParams;
  const queryString = query.toString();
  
  if (!tenantId) {
    console.warn("⚠️ No tenant ID extracted for DELETE request:", pathName);
  }
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-client-info": JSON.stringify(clientInfo),
      "x-client-host": clientInfo["host"],
      "x-client-protocol": clientInfo["protocol"],
    };
    
    if (authorization) {
      headers["Authorization"] = authorization;
    }
    
    if (tenantId) {
      headers["x-tenant-id"] = tenantId;
    }
    
    const res = await axios.delete(
      `${apiUrl}${pathName}${queryString ? "?" + queryString : ""}`,
      { headers }
    );
    const response = processResponse(res);
    return Response.json({ ...response });
  } catch (error: any) {
    if (error && error.response) {
      console.log(error, "--> error");
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    } else if (error) {
      return NextResponse.json(error, { status: 500 });
    } else {
      return NextResponse.json("An error occurred", { status: 500 });
    }
  }
}

export async function PATCH(req: NextRequest) {
  const requestPath = new URL(req.url).pathname;
  const pathName = requestPath.split("/api")[1];
  const clientInfo = await getRequestInfo(req);
  console.log("clientInfo-->", clientInfo);
  const authorization =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const tenantId = getTenantId(req);
  const contentType = req.headers.get("Content-Type");
  const isMultipart = contentType?.includes("multipart/form-data");
  const body = isMultipart
    ? await req.formData()
    : contentType?.includes("application/json")
    ? await req.json()
    : await req.json();
  console.log("body-->", body, isMultipart);
  const query = req.nextUrl.searchParams;
  const queryString = query.toString();
  const path = `${apiUrl}${pathName}${queryString ? "?" + queryString : ""}`;
  
  if (!tenantId) {
    console.warn("⚠️ No tenant ID extracted for PATCH request:", pathName);
  }
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": contentType || "application/json",
      "x-client-info": JSON.stringify(clientInfo),
      "x-client-host": clientInfo["host"],
      "x-client-protocol": clientInfo["protocol"],
    };
    
    if (authorization) {
      headers["Authorization"] = authorization;
    }
    
    if (tenantId) {
      headers["x-tenant-id"] = tenantId;
    }
    
    const res = await axios.patch(
      path,
      isMultipart ? body : JSON.stringify(body),
      { headers }
    );
    const response = processResponse(res);
    return Response.json({ ...response });
  } catch (error: any) {
    if (error && error.response) {
      console.log(error, "--> error");
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    } else if (error) {
      return NextResponse.json(error, { status: 500 });
    } else {
      return NextResponse.json("An error occurred", { status: 500 });
    }
  }
}