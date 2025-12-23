import { processResponse } from "@/framework/joee.client";
import { getRequestInfo } from "@/framework/log-request-helper";
import { siteConfig } from "@/framework/site-config";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
const apiUrl = siteConfig.host;

// Helper function to extract tenant subdomain from request
const getTenantId = (req: NextRequest): string | undefined => {
  const host = req.headers.get("host") || "";
  const subdomain = host.split(".")[0];
  // Only return subdomain if it's a valid tenant (not localhost, www, or empty)
  return subdomain && subdomain !== "localhost" && subdomain !== "www" ? subdomain : undefined;
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

  try {
    const res = await axios.get(
      `${apiUrl}${pathName}${queryString ? "?" + queryString : ""}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization as string,
          "x-client-info": JSON.stringify(clientInfo),
          "x-client-host": clientInfo["host"],
          "x-client-protocol": clientInfo["protocol"],
          ...(tenantId ? { "x-tenant-id": tenantId } : {}),
        },
      }
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
  try {
    const res = await axios.post(
      path,
      isMultipart ? body : JSON.stringify(body),
      {
      headers: {
          "Content-Type": contentType || "application/json",
        Authorization: authorization as string | "",
          "x-client-info": JSON.stringify(clientInfo),
          "x-client-host": clientInfo["host"],
          "x-client-protocol": clientInfo["protocol"],
          ...(tenantId ? { "x-tenant-id": tenantId } : {}),
      },
      }
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
  try {
    const res = await axios.put(
      path,
      isMultipart ? body : JSON.stringify(body),
      {
        headers: {
          "Content-Type": contentType || "application/json",
          Authorization: authorization as string | "",
          "x-client-info": JSON.stringify(clientInfo),
          "x-client-host": clientInfo["host"],
          "x-client-protocol": clientInfo["protocol"],
          ...(tenantId ? { "x-tenant-id": tenantId } : {}),
        },
      }
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
  try {
    const res = await axios.delete(
      `${apiUrl}${pathName}${queryString ? "?" + queryString : ""}`,
      {
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization as string,
          "x-client-info": JSON.stringify(clientInfo),
          "x-client-host": clientInfo["host"],
          "x-client-protocol": clientInfo["protocol"],
          ...(tenantId ? { "x-tenant-id": tenantId } : {}),
      },
      }
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
  try {
    const res = await axios.patch(
      path,
      isMultipart ? body : JSON.stringify(body),
      {
        headers: {
          "Content-Type": contentType || "application/json",
          Authorization: authorization as string | "",
          "x-client-info": JSON.stringify(clientInfo),
          "x-client-host": clientInfo["host"],
          "x-client-protocol": clientInfo["protocol"],
          ...(tenantId ? { "x-tenant-id": tenantId } : {}),
        },
      }
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