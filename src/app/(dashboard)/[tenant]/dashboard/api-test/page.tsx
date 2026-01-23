"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { validateApiConnection, formatValidationReport, type ApiValidationReport } from "@/utils/api-validator";
import { siteConfig } from "@/framework/site-config";
import { Spinner } from "@/components/icons/Spinner";

export default function ApiTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ApiValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const validationReport = await validateApiConnection(
        email && password ? { email, password } : undefined
      );
      setReport(validationReport);
    } catch (err: any) {
      setError(err.message || "Failed to validate API connection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">API Connection Validator</h1>

        {/* Configuration Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Configuration</h2>
          <div className="space-y-1 text-sm">
            <p><strong>Base URL:</strong> {siteConfig.host}</p>
            <p><strong>Site URL:</strong> {siteConfig.siteUrl}</p>
            <p><strong>Site Name:</strong> {siteConfig.siteName}</p>
          </div>
        </div>

        {/* Optional Credentials */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Credentials (Optional)</h2>
          <p className="text-sm text-gray-600 mb-3">
            Provide credentials to test login endpoint. Leave empty to skip login test.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="mb-6">
          <Button
            onClick={handleTest}
            disabled={isLoading}
            className="bg-[#003465] hover:bg-[#0d2337] text-white"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Testing API Connection...
              </>
            ) : (
              "Run API Validation Tests"
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Report Display */}
        {report && (
          <div className="space-y-4">
            {/* Summary */}
            <div className={`p-4 rounded-lg ${
              report.overallStatus === "connected" 
                ? "bg-green-50 border border-green-200" 
                : report.overallStatus === "partial"
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-red-50 border border-red-200"
            }`}>
              <h2 className="text-lg font-semibold mb-2">
                Overall Status: {report.overallStatus.toUpperCase()}
              </h2>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Total</p>
                  <p className="text-2xl">{report.summary.total}</p>
                </div>
                <div>
                  <p className="font-medium text-green-600">Passed</p>
                  <p className="text-2xl text-green-600">{report.summary.passed}</p>
                </div>
                <div>
                  <p className="font-medium text-red-600">Failed</p>
                  <p className="text-2xl text-red-600">{report.summary.failed}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Skipped</p>
                  <p className="text-2xl text-gray-600">{report.summary.skipped}</p>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Test Results</h2>
              {report.tests.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    test.status === "success"
                      ? "bg-green-50 border-green-200"
                      : test.status === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {test.status === "success" ? "✅" : test.status === "error" ? "❌" : "⏭️"}
                      </span>
                      <span className="font-semibold">
                        {test.method} {test.endpoint}
                      </span>
                    </div>
                    {test.statusCode && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        test.statusCode < 300
                          ? "bg-green-100 text-green-800"
                          : test.statusCode < 400
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {test.statusCode}
                      </span>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    {test.responseTime && (
                      <p className="text-gray-600">
                        Response Time: <strong>{test.responseTime}ms</strong>
                      </p>
                    )}
                    {test.error && (
                      <p className="text-red-600">
                        <strong>Error:</strong> {test.error}
                      </p>
                    )}
                    {test.response && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Response
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(test.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Raw Report */}
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                View Raw Report
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {formatValidationReport(report)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

