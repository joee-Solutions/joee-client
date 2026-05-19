/** API-safe body for queued replay (strip display-only / nested fields that cause 400s). */

export function leanQueuePayload(
  method: string,
  path: string,
  data: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;

  const norm = String(path || "")
    .replace(/^\/+/, "")
    .split("?")[0]
    .toLowerCase();
  const m = method.toLowerCase();

  if (norm.includes("tenant/schedule/") && (m === "post" || m === "patch" || m === "put")) {
    const days = data.availableDays ?? data.available_days;
    if (days == null) return {};
    return { availableDays: days };
  }

  if (norm.includes("tenant/appointment/") && (m === "post" || m === "patch" || m === "put")) {
    const out: Record<string, unknown> = {};
    const keys = [
      "patient_id",
      "user_id",
      "patientId",
      "userId",
      "date",
      "start_time",
      "end_time",
      "startTime",
      "endTime",
      "description",
      "status",
    ] as const;
    for (const k of keys) {
      if (data[k] !== undefined) out[k] = data[k];
    }
    return out;
  }

  if (m === "post" && norm.startsWith("tenant/employee/")) {
    const out = { ...data };
    delete out.department;
    delete out.department_name;
    return out;
  }

  if ((m === "patch" || m === "put") && norm.startsWith("tenant/user/")) {
    const out = { ...data };
    if (out.department && typeof out.department === "object") {
      const dep = out.department as { id?: unknown; _id?: unknown };
      if (out.department_id == null) out.department_id = dep.id ?? dep._id;
      delete out.department;
    }
    return out;
  }

  return data;
}
