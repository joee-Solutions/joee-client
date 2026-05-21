"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { shouldSuppressUserFacingApiError } from "@/framework/api-errors";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { getTenantId } from "@/framework/https";
import { getRolesFromUser, isTenantAdmin } from "@/utils/permissions";
import { useRouter } from "next/navigation";

type ReportTabKey =
  | "patients"
  | "visits"
  | "prescriptions"
  | "diagnosis"
  | "users";

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const DEFAULT_META: Meta = { total: 0, page: 1, limit: 10, totalPages: 1 };

const TABS: { key: ReportTabKey; title: string; endpoint: string }[] = [
  { key: "patients", title: "Patients", endpoint: API_ENDPOINTS.REPORT_PATIENTS },
  { key: "visits", title: "Visits", endpoint: API_ENDPOINTS.REPORT_VISITS },
  { key: "prescriptions", title: "Prescriptions", endpoint: API_ENDPOINTS.REPORT_PRESCRIPTIONS },
  { key: "diagnosis", title: "Diagnosis & Allergies", endpoint: API_ENDPOINTS.REPORT_DIAGNOSIS_ALLERGIES },
  { key: "users", title: "Users", endpoint: API_ENDPOINTS.REPORT_USERS },
];

const PATIENT_HIDDEN_COLUMNS = new Set([
  "id",
  "_id",
  "deleted_at",
  "deletedAt",
  "version",
  "__v",
  "tenant",
  "tenant_id",
  "tenantId",
]);
const PATIENT_COMPLEX_FIELDS = new Set([
  "allergies",
  "diagnosis_history",
  "prescriptions",
  "visits",
  "vitals",
  "vital_signs",
  "immunizations",
  "immunization_history",
  "family_history",
  "surgery_history",
  "status",
]);

function normalizeKeyForMatch(key: string): string {
  return key.toLowerCase().replace(/[\s_-]+/g, "");
}

function isComplexPatientsColumn(columnKey: string, value: unknown): boolean {
  const normalized = normalizeKeyForMatch(columnKey);
  const explicit = [...PATIENT_COMPLEX_FIELDS].some(
    (k) => normalizeKeyForMatch(k) === normalized
  );
  if (explicit) return true;

  // Cover API spelling variants / typos and display-label variants from backend.
  const fuzzyKeywords = [
    "emergencyinfo",
    "guardianinfo",
    "contactinfo",
    "socialhistory",
    "socailhistory",
    "reviewofsystem",
    "additionalreview",
    "medicalhistory",
    "medicalhistor",
    "familyhistory",
    "surgeries",
    "surgery",
    "diagnosishistory",
    "allergies",
    "diagnosis",
    "vitals",
    "immunizations",
    "status",
  ];
  if (fuzzyKeywords.some((kw) => normalized.includes(kw))) return true;

  // Last resort: objects or array-of-objects should render as complex details.
  if (Array.isArray(value)) {
    return value.some((v) => v && typeof v === "object");
  }
  return !!value && typeof value === "object";
}

function extractRowsAndMeta(payload: any): { rows: any[]; meta: Meta } {
  const d1 = payload?.data ?? payload;
  const d2 = d1?.data ?? d1;

  if (Array.isArray(d2?.data)) {
    return { rows: d2.data, meta: { ...DEFAULT_META, ...(d2.meta ?? {}) } };
  }

  if (Array.isArray(d1?.data)) {
    return { rows: d1.data, meta: { ...DEFAULT_META, ...(d1.meta ?? {}) } };
  }

  // diagnosis-allergies can return nested object with diagnoses.data
  // Supported examples:
  // 1) { data: { status, data: { diagnoses: { data, meta } } } }
  // 2) { data: { diagnoses: { data, meta } } }
  const diagnosisRows =
    d2?.diagnoses?.data ??
    d2?.data?.diagnoses?.data ??
    d1?.data?.diagnoses?.data;
  const diagnosisMeta =
    d2?.diagnoses?.meta ??
    d2?.data?.diagnoses?.meta ??
    d1?.data?.diagnoses?.meta;
  if (Array.isArray(diagnosisRows)) {
    return { rows: diagnosisRows, meta: { ...DEFAULT_META, ...(diagnosisMeta ?? {}) } };
  }

  if (Array.isArray(d2)) {
    return { rows: d2, meta: { ...DEFAULT_META, total: d2.length } };
  }

  return { rows: [], meta: DEFAULT_META };
}

function extractUsersSummary(payload: any): Record<string, unknown> | null {
  const candidates = [
    payload?.data,
    payload?.data?.data,
    payload?.data?.data?.data,
    payload,
  ].filter(Boolean);

  const hasMetrics = (obj: any) =>
    obj &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    (
      obj.totalUsers != null ||
      obj.maleCount != null ||
      obj.femaleCount != null ||
      obj.activeCount != null ||
      obj.inactiveCount != null ||
      obj.usersCreatedThisMonth != null
    );

  for (const c of candidates) {
    if (hasMetrics(c)) return c as Record<string, unknown>;
  }
  return null;
}

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatCellValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) return dt.toLocaleDateString();
  }
  return String(value);
}

function isLikelyImageUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  if (!v) return false;
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("data:image/") ||
    /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/.test(v)
  );
}

function summarizeComplexField(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object") return `${value.length} item(s)`;
    return value.map((v) => formatCellValue(v)).join(", ");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const meaningful = Object.values(obj).filter((v) => v != null && String(v).trim() !== "");
    if (meaningful.length === 0) return "—";
    if (obj.status != null) return String(obj.status);
    return `${meaningful.length} field(s)`;
  }
  return formatCellValue(value);
}

function renderComplexFieldDetails(value: unknown): string {
  const formatNested = (v: unknown): string => {
    if (v == null || v === "") return "—";
    if (Array.isArray(v)) {
      if (!v.length) return "—";
      return v.map((item) => formatNested(item)).join(", ");
    }
    if (typeof v === "object") {
      const obj = v as Record<string, unknown>;
      const entries = Object.entries(obj).filter(([, val]) => val != null && String(val).trim() !== "");
      if (!entries.length) return "—";
      return entries
        .map(([k, val]) => `${humanize(k)}: ${formatNested(val)}`)
        .join("; ");
    }
    return formatCellValue(v);
  };

  if (value == null || value === "") return "No data available.";
  if (Array.isArray(value)) {
    if (!value.length) return "No data available.";
    return value
      .map((item, index) => {
        if (item && typeof item === "object") {
          const entries = Object.entries(item as Record<string, unknown>)
            .filter(([, v]) => v != null && String(v).trim() !== "")
            .map(([k, v]) => `- ${humanize(k)}: ${formatNested(v)}`)
            .join("\n");
          return `Item ${index + 1}\n${entries || "- No populated fields"}`;
        }
        return `Item ${index + 1}\n- Value: ${formatNested(item)}`;
      })
      .join("\n\n");
  }
  if (value && typeof value === "object") {
    const lines = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v != null && String(v).trim() !== "")
      .map(([k, v]) => `- ${humanize(k)}: ${formatNested(v)}`);
    return lines.length ? lines.join("\n") : "No data available.";
  }
  return formatNested(value);
}

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ReportTabKey>("patients");
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState<Meta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ title: string; value: unknown } | null>(null);

  useEffect(() => {
    const userJson = Cookies.get("user");
    let user: { roles?: string[]; role?: string } | null = null;
    try {
      user = userJson ? JSON.parse(userJson) : null;
    } catch {
      user = null;
    }
    const roles = getRolesFromUser(user);
    if (!isTenantAdmin(roles)) {
      toast.error("Access denied: Reports are available to Tenant Admin only.", {
        toastId: "reports-admin-only",
      });
      router.replace("/dashboard");
    }
  }, [router]);

  const activeTabConfig = useMemo(
    () => TABS.find((t) => t.key === activeTab) ?? TABS[0],
    [activeTab]
  );

  const columns = useMemo(() => {
    if (!rows.length) return [];
    const keys = Object.keys(rows[0]).filter((key) =>
      activeTab === "patients" ? !PATIENT_HIDDEN_COLUMNS.has(key) : true
    );
    if (activeTab === "patients") return ["__sn", ...keys];
    if (
      activeTab === "visits" ||
      activeTab === "prescriptions" ||
      activeTab === "diagnosis"
    ) {
      const filteredKeys = keys.filter((k) => k !== "patient_id");
      return ["__sn", ...filteredKeys];
    }
    return keys;
  }, [rows, activeTab]);

  const imageColumnKey = useMemo(() => {
    if (activeTab !== "patients" || !rows.length) return null;
    const candidates = ["image", "patient_image", "photo", "avatar", "profile_picture", "image_url"];
    for (const key of candidates) {
      if (rows.some((r) => isLikelyImageUrl(r?.[key]))) return key;
    }
    for (const key of Object.keys(rows[0] ?? {})) {
      if (rows.some((r) => isLikelyImageUrl(r?.[key]))) return key;
    }
    return null;
  }, [rows, activeTab]);

  const fetchReport = async (tab: ReportTabKey, page = 1) => {
    const cfg = TABS.find((t) => t.key === tab);
    if (!cfg) return;

    setLoading(true);
    try {
      const endpoint =
        tab === "users"
          ? cfg.endpoint
          : `${cfg.endpoint}?page=${page}&limit=${meta.limit || 10}`;
      const response = await processRequestOfflineAuth("get", endpoint);
      if (tab === "users") {
        const summary = extractUsersSummary(response);
        if (summary) {
          setRows([summary]);
          const total = Number(summary.totalUsers ?? 1);
          setMeta({ ...DEFAULT_META, total: Number.isFinite(total) ? total : 1 });
          return;
        }
      }
      const parsed = extractRowsAndMeta(response);
      setRows(parsed.rows);
      setMeta(parsed.meta);
    } catch (error: any) {
      if (!shouldSuppressUserFacingApiError(error)) {
        toast.error(
          error?.response?.data?.message || `Failed to load ${cfg.title.toLowerCase()} report`,
          { toastId: `report-load-${tab}` }
        );
      } else {
        console.warn(`Reports (${tab}): backend unreachable, showing empty/cached data`);
      }
      setRows([]);
      setMeta(DEFAULT_META);
    } finally {
      setLoading(false);
    }
  };

  const onExportPatients = async () => {
    try {
      const token = Cookies.get("auth_token");
      const tenant = getTenantId();
      const response = await fetch(`/api${API_ENDPOINTS.REPORT_PATIENTS_EXPORT}`, {
        method: "GET",
        headers: {
          Accept: "application/octet-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(tenant ? { "x-tenant-id": tenant } : {}),
        },
      });
      if (!response.ok) throw new Error(`Export failed (${response.status})`);

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const fallback = `patients-report-${new Date().toISOString().slice(0, 10)}.csv`;
      const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || fallback;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Patients report exported", { toastId: "patients-report-export" });
    } catch (error: any) {
      toast.error(error?.message || "Failed to export patients report", {
        toastId: "patients-report-export-error",
      });
    }
  };

  useEffect(() => {
    fetchReport(activeTab, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, refreshKey]);

  return (
    <section className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#003465]">Reports Analysis</h1>
          <p className="text-sm text-gray-600">
            View patient analytics datasets and export patient reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-[#003465] text-[#003465]"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            type="button"
            className="bg-[#003465] hover:bg-[#003465]/90"
            onClick={onExportPatients}
          >
            <Download className="mr-2 h-4 w-4 text-white" />
            <span className="text-white">Export Patients</span>
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeTab === tab.key
                ? "border-[#003465] bg-[#003465] text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-[#003465] hover:text-[#003465]"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Dataset</p>
          <p className="text-sm font-semibold text-gray-900">{activeTabConfig.title}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Total Records</p>
          <p className="text-lg font-semibold text-gray-900">{meta.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Page</p>
          <p className="text-sm font-semibold text-gray-900">
            {meta.page} / {Math.max(1, meta.totalPages)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#f5f8fc]">
                {columns.length ? (
                  columns.map((c) => (
                    <th
                      key={c}
                      className="whitespace-nowrap border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                    >
                      {c === "__sn" ? "S/N" : humanize(c)}
                    </th>
                  ))
                ) : (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Data
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={Math.max(columns.length, 1)}>
                    Loading report data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={Math.max(columns.length, 1)}>
                    No records available.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    {columns.map((col) => (
                      <td key={`${idx}-${col}`} className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                        {col === "__sn" ? (
                          meta.page > 1 ? (meta.page - 1) * meta.limit + idx + 1 : idx + 1
                        ) : activeTab === "patients" && imageColumnKey && col === imageColumnKey && isLikelyImageUrl(row[col]) ? (
                          <button
                            type="button"
                            className="text-[#003465] underline hover:text-[#1b5a95]"
                            onClick={() => setImagePreview(String(row[col]))}
                          >
                            View Image
                          </button>
                        ) : activeTab === "patients" && isComplexPatientsColumn(col, row[col]) ? (
                          <button
                            type="button"
                            className="text-left text-[#003465] underline hover:text-[#1b5a95]"
                            onClick={() => setDetailModal({ title: humanize(col), value: row[col] })}
                          >
                            {summarizeComplexField(row[col])}
                          </button>
                        ) : (
                          formatCellValue(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing page {meta.page} of {Math.max(1, meta.totalPages)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading || meta.page <= 1}
            onClick={() => fetchReport(activeTab, Math.max(1, meta.page - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading || meta.page >= Math.max(1, meta.totalPages)}
            onClick={() => fetchReport(activeTab, Math.min(meta.totalPages, meta.page + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {imagePreview && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setImagePreview(null)}
        >
          <div
            className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagePreview}
              alt="Patient"
              className="max-h-[80vh] max-w-[80vw] object-contain"
            />
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setImagePreview(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      {detailModal && (
        <div
          className="fixed inset-0 z-[121] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setDetailModal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-semibold text-[#003465]">{detailModal.title}</h3>
            <div className="max-h-[70vh] overflow-y-auto rounded border bg-gray-50 p-3">
              <pre className="whitespace-pre-wrap break-words text-sm text-gray-800">
                {renderComplexFieldDetails(detailModal.value)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setDetailModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

