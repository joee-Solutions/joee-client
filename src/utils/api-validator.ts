/**
 * API Connection Validator
 * Tests backend API connectivity and validates endpoints
 */

import { processRequestNoAuth, processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { siteConfig } from "@/framework/site-config";
import axios from "axios";

export interface ApiTestResult {
  endpoint: string;
  method: string;
  status: "success" | "error" | "skipped";
  statusCode?: number;
  responseTime?: number;
  error?: string;
  response?: any;
}

export interface ApiValidationReport {
  baseUrl: string;
  timestamp: string;
  overallStatus: "connected" | "disconnected" | "partial";
  tests: ApiTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

/**
 * Test basic connectivity to the backend API
 */
export async function testApiConnectivity(): Promise<ApiTestResult> {
  const startTime = Date.now();
  const baseUrl = siteConfig.host;
  
  try {
    // Try a simple GET request to check if backend is reachable
    const response = await axios.get(`${baseUrl}/health`, {
      timeout: 5000,
      validateStatus: () => true, // Don't throw on any status
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      endpoint: "/health",
      method: "GET",
      status: response.status < 500 ? "success" : "error",
      statusCode: response.status,
      responseTime,
      response: response.data,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      endpoint: "/health",
      method: "GET",
      status: "error",
      responseTime,
      error: error.message || "Connection failed",
    };
  }
}

/**
 * Test login endpoint (no auth required)
 */
export async function testLoginEndpoint(
  email: string = "test@example.com",
  password: string = "test123"
): Promise<ApiTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await processRequestNoAuth(
      "post",
      API_ENDPOINTS.LOGIN,
      { email, password }
    );
    
    const responseTime = Date.now() - startTime;
    
    return {
      endpoint: API_ENDPOINTS.LOGIN,
      method: "POST",
      status: "success",
      statusCode: 200,
      responseTime,
      response: response,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      endpoint: API_ENDPOINTS.LOGIN,
      method: "POST",
      status: "error",
      statusCode: error?.response?.status,
      responseTime,
      error: error?.response?.data?.error || error?.message || "Request failed",
      response: error?.response?.data,
    };
  }
}

/**
 * Test authenticated endpoint (requires auth token)
 */
export async function testAuthenticatedEndpoint(
  endpoint: string,
  method: "get" | "post" | "put" | "delete" = "get",
  data?: any
): Promise<ApiTestResult> {
  const startTime = Date.now();
  
  try {
    let response;
    if (method === "get") {
      response = await processRequestAuth("get", endpoint);
    } else if (method === "post") {
      response = await processRequestAuth("post", endpoint, data);
    } else if (method === "put") {
      response = await processRequestAuth("put", endpoint, data);
    } else {
      response = await processRequestAuth("delete", endpoint);
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      endpoint,
      method: method.toUpperCase(),
      status: "success",
      statusCode: 200,
      responseTime,
      response: response,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      endpoint,
      method: method.toUpperCase(),
      status: "error",
      statusCode: error?.response?.status,
      responseTime,
      error: error?.response?.data?.error || error?.message || "Request failed",
      response: error?.response?.data,
    };
  }
}

/**
 * Run comprehensive API validation tests
 */
export async function validateApiConnection(
  testCredentials?: { email: string; password: string }
): Promise<ApiValidationReport> {
  const baseUrl = siteConfig.host;
  const tests: ApiTestResult[] = [];
  
  // Test 1: Basic connectivity
  console.log("Testing basic API connectivity...");
  const connectivityTest = await testApiConnectivity();
  tests.push(connectivityTest);
  
  // Test 2: Login endpoint
  console.log("Testing login endpoint...");
  const loginTest = await testLoginEndpoint(
    testCredentials?.email,
    testCredentials?.password
  );
  tests.push(loginTest);
  
  // Test 3: Other public endpoints (if needed)
  // Add more tests as needed
  
  // Calculate summary
  const summary = {
    total: tests.length,
    passed: tests.filter((t) => t.status === "success").length,
    failed: tests.filter((t) => t.status === "error").length,
    skipped: tests.filter((t) => t.status === "skipped").length,
  };
  
  // Determine overall status
  let overallStatus: "connected" | "disconnected" | "partial" = "disconnected";
  if (summary.failed === 0) {
    overallStatus = "connected";
  } else if (summary.passed > 0) {
    overallStatus = "partial";
  }
  
  return {
    baseUrl,
    timestamp: new Date().toISOString(),
    overallStatus,
    tests,
    summary,
  };
}

/**
 * Format validation report for display
 */
export function formatValidationReport(report: ApiValidationReport): string {
  let output = `
╔═══════════════════════════════════════════════════════════╗
║              API Connection Validation Report             ║
╚═══════════════════════════════════════════════════════════╝

Base URL: ${report.baseUrl}
Timestamp: ${report.timestamp}
Overall Status: ${report.overallStatus.toUpperCase()}

Summary:
  Total Tests: ${report.summary.total}
  Passed: ${report.summary.passed} ✅
  Failed: ${report.summary.failed} ❌
  Skipped: ${report.summary.skipped} ⏭️

Test Results:
`;

  report.tests.forEach((test, index) => {
    const statusIcon = test.status === "success" ? "✅" : test.status === "error" ? "❌" : "⏭️";
    output += `
${index + 1}. ${statusIcon} ${test.method} ${test.endpoint}
   Status: ${test.statusCode || "N/A"}
   Response Time: ${test.responseTime || "N/A"}ms
   ${test.error ? `Error: ${test.error}` : ""}
`;
  });

  output += `
╔═══════════════════════════════════════════════════════════╗
║                      End of Report                        ║
╚═══════════════════════════════════════════════════════════╝
`;

  return output;
}

