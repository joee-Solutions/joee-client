import { offlineDB } from "@/lib/offline-db";

/** Split "First Middle Last" into first segment + rest. */
export function splitDisplayName(full: string): { first: string; last: string } {
  const parts = String(full || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function buildPatientStub(
  patientId: string | number | undefined,
  patientName?: string
): Record<string, unknown> | undefined {
  if (patientId == null && !patientName) return undefined;
  const { first, last } = splitDisplayName(patientName || "");
  return {
    id: patientId,
    _id: patientId,
    first_name: first,
    last_name: last,
  };
}

export function buildUserStub(
  userId: string | number | undefined,
  doctorName?: string
): Record<string, unknown> | undefined {
  if (userId == null && !doctorName) return undefined;
  const { first, last } = splitDisplayName(doctorName || "");
  return {
    id: userId,
    _id: userId,
    firstname: first,
    first_name: first,
    lastname: last,
    last_name: last,
    name: [first, last].filter(Boolean).join(" "),
  };
}

export function enrichAppointmentPayload(
  payload: Record<string, unknown>,
  existing?: Record<string, unknown>
): Record<string, unknown> {
  const patientId =
    payload.patientId ??
    payload.patient_id ??
    existing?.patientId ??
    (existing?.patient as Record<string, unknown> | undefined)?.id;
  const userId =
    payload.userId ??
    payload.user_id ??
    existing?.userId ??
    (existing?.user as Record<string, unknown> | undefined)?.id;

  const patientName =
    (payload.patientName as string) ||
    (existing?.patientName as string) ||
    "";
  const doctorName =
    (payload.doctorName as string) ||
    (existing?.doctorName as string) ||
    "";

  const patient =
    (payload.patient as Record<string, unknown>) ||
    buildPatientStub(patientId as string | number, patientName) ||
    existing?.patient;
  const user =
    (payload.user as Record<string, unknown>) ||
    buildUserStub(userId as string | number, doctorName) ||
    existing?.user;

  return {
    ...existing,
    ...payload,
    patientId: patientId ?? payload.patientId,
    userId: userId ?? payload.userId,
    patient_id: patientId ?? payload.patient_id,
    user_id: userId ?? payload.user_id,
    patientName: patientName || undefined,
    doctorName: doctorName || undefined,
    patient,
    user,
    date:
      payload.date ??
      payload.appointmentDate ??
      existing?.date ??
      existing?.appointmentDate,
    startTime: payload.startTime ?? payload.start_time ?? existing?.startTime,
    endTime: payload.endTime ?? payload.end_time ?? existing?.endTime,
    start_time: payload.start_time ?? payload.startTime ?? existing?.start_time,
    end_time: payload.end_time ?? payload.endTime ?? existing?.end_time,
    description: payload.description ?? existing?.description,
    status: payload.status ?? existing?.status,
  };
}

export function enrichSchedulePayload(
  payload: Record<string, unknown>,
  existing?: Record<string, unknown>,
  meta?: {
    employeeId?: string | number;
    employeeName?: string;
    department?: string;
    firstname?: string;
    lastname?: string;
  }
): Record<string, unknown> {
  const employeeId =
    meta?.employeeId ??
    payload.employeeId ??
    payload.employee_id ??
    existing?.employeeId ??
    (existing?.user as Record<string, unknown> | undefined)?.id;

  const firstname =
    meta?.firstname ??
    (payload.user as Record<string, unknown> | undefined)?.firstname ??
    (existing?.user as Record<string, unknown> | undefined)?.firstname ??
    "";
  const lastname =
    meta?.lastname ??
    (payload.user as Record<string, unknown> | undefined)?.lastname ??
    (existing?.user as Record<string, unknown> | undefined)?.lastname ??
    "";

  const employeeName =
    meta?.employeeName ||
    (payload.employeeName as string) ||
    (existing?.employeeName as string) ||
    [firstname, lastname].filter(Boolean).join(" ").trim();

  const department =
    meta?.department ||
    (typeof payload.department === "string"
      ? payload.department
      : (payload.department as { name?: string } | undefined)?.name) ||
    (typeof existing?.department === "string"
      ? existing.department
      : (existing?.department as { name?: string } | undefined)?.name) ||
    (payload.department_name as string) ||
    (existing?.department_name as string) ||
    "";

  const user =
    (payload.user as Record<string, unknown>) ||
    buildUserStub(employeeId as string | number, employeeName) ||
    existing?.user;

  if (user && typeof user === "object") {
    if (firstname) {
      (user as Record<string, unknown>).firstname = firstname;
      (user as Record<string, unknown>).first_name = firstname;
    }
    if (lastname) {
      (user as Record<string, unknown>).lastname = lastname;
      (user as Record<string, unknown>).last_name = lastname;
    }
  }

  return {
    ...existing,
    ...payload,
    employeeId,
    employee_id: employeeId,
    employeeName,
    department: department || payload.department || existing?.department,
    department_name: department || (payload.department_name as string),
    user,
    availableDays:
      payload.availableDays ?? existing?.availableDays ?? payload.available_days,
  };
}

/** Sort key for offline-created rows (newest first). */
export function offlineRowSortKey(row: Record<string, unknown>): number {
  const updated = Number(row.updatedAt ?? row.cachedAt ?? 0);
  if (updated > 0) return updated;
  const id = String(row.id ?? "");
  const m = id.match(/^offline-(\d+)$/);
  if (m) return Number(m[1]);
  const num = Number(id);
  return Number.isFinite(num) ? num : 0;
}

export async function lookupPatientNameFromCache(
  tenantId: string,
  patientId: string | number
): Promise<string> {
  try {
    await offlineDB.init();
    const rows = await offlineDB.getCachedData("patients", tenantId);
    const p = rows.find((r: any) => String(r?.id) === String(patientId));
    if (!p) return "";
    const first = p.first_name || p.firstName || "";
    const last = p.last_name || p.lastName || "";
    return [first, last].filter(Boolean).join(" ").trim();
  } catch {
    return "";
  }
}

export async function lookupEmployeeNameFromCache(
  tenantId: string,
  employeeId: string | number
): Promise<{ name: string; firstname: string; lastname: string; department?: string }> {
  try {
    await offlineDB.init();
    const rows = await offlineDB.getCachedData("employees", tenantId);
    const e = rows.find((r: any) => String(r?.id) === String(employeeId));
    if (!e) return { name: "", firstname: "", lastname: "" };
    const firstname =
      e.first_name || e.firstName || e.firstname || "";
    const lastname =
      e.last_name || e.lastName || e.lastname || "";
    const name = [firstname, lastname].filter(Boolean).join(" ").trim() || String(e.email || "");
    const dept =
      typeof e.department === "string"
        ? e.department
        : e.department?.name || e.department_name || "";
    return { name, firstname, lastname, department: dept };
  } catch {
    return { name: "", firstname: "", lastname: "" };
  }
}
