import useSWR from "swr";
import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

function parseDateOnlyToLocalDate(raw: unknown): Date | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  // Handle backend date-only strings (YYYY-MM-DD) as LOCAL dates to avoid day-shift.
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    return new Date(year, month - 1, day);
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

function formatDate(raw: unknown): string {
  const dt = parseDateOnlyToLocalDate(raw);
  if (!dt) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#D9EDFF] p-4">
      <p className="text-xs font-medium text-[#666666]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1f2937]">{value || "—"}</p>
    </div>
  );
}

export default function PersonalInfo() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientDetail = String(params?.patientDetail ?? "");
  const patientIdFromQuery = Number(searchParams.get("pid") ?? "");
  const patientIdFromPath = /^\d+$/.test(patientDetail) ? Number(patientDetail) : NaN;
  const patientId =
    Number.isFinite(patientIdFromQuery) && patientIdFromQuery > 0
      ? patientIdFromQuery
      : patientIdFromPath;

  const { data: patientResponse, isLoading } = useSWR(
    patientId ? API_ENDPOINTS.GET_PATIENT(patientId) : null,
    (url: string) => processRequestOfflineAuth("get", url),
    { revalidateOnFocus: true }
  );

  const patient = useMemo(() => {
    if (!patientResponse) return null;
    // PatientStepper expects either {data:{data:...}} or {data:...}
    const raw = patientResponse?.data?.data ?? patientResponse?.data ?? patientResponse;
    return raw && typeof raw === "object" ? raw : null;
  }, [patientResponse]);

  const contactInfo = (patient?.contact_info ?? {}) as Record<string, unknown>;
  const firstName = String(patient?.first_name ?? patient?.firstname ?? patient?.firstname ?? "").trim();
  const lastName = String(patient?.last_name ?? patient?.lastname ?? patient?.lastname ?? "").trim();

  const fullName = `${firstName} ${lastName}`.trim() || "—";
  const email =
    String(contactInfo?.email ?? patient?.email ?? "").trim() ||
    String(patient?.email ?? "").trim();
  const phone =
    String(contactInfo?.phone_number_mobile ?? patient?.phone_number_mobile ?? "").trim() ||
    String(contactInfo?.phone_number_home ?? patient?.phone_number_home ?? "").trim();

  const address = String(contactInfo?.address ?? patient?.address ?? "").trim();
  const stateOrRegion =
    String(contactInfo?.state ?? contactInfo?.region ?? patient?.state ?? "").trim() || "—";

  const gender = String(patient?.sex ?? patient?.gender ?? "").trim() || "—";
  const dob = formatDate(patient?.date_of_birth ?? patient?.dob ?? "");
  const rawStatus = patient?.status ?? patient?.patientStatus;
  const status =
    typeof rawStatus === "string"
      ? rawStatus.trim() || "—"
      : rawStatus && typeof rawStatus === "object"
        ? String(
            (rawStatus as Record<string, unknown>).name ??
              (rawStatus as Record<string, unknown>).label ??
              (rawStatus as Record<string, unknown>).status ??
              ""
          ).trim() || "—"
        : "—";

  const imageSrc = String(
    patient?.profile_picture ?? patient?.image ?? patient?.patient_image ?? ""
  ).trim();

  return (
    <div>
      <div className="flex justify-between items-start gap-10 mb-6">
        <div>
          <h2 className="font-bold text-base text-black">Personal Information</h2>
          <p className="text-xs font-medium text-[#595959] mt-1">{fullName}</p>
        </div>

        {imageSrc ? (
          <img
            src={imageSrc}
            alt="patient"
            className="w-[120px] h-[120px] rounded-full object-cover bg-gray-100 flex-shrink-0"
          />
        ) : (
          <div className="w-[120px] h-[120px] rounded-full bg-gray-100 flex items-center justify-center text-xs text-[#737373] flex-shrink-0">
            No Image
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-sm text-[#737373]">Loading patient information...</div>
      )}

      {!isLoading && patient && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoItem label="Full Name" value={fullName} />
          <InfoItem label="Email" value={email || "—"} />
          <InfoItem label="Phone Number" value={phone || "—"} />
          <InfoItem label="Address" value={address || "—"} />
          <InfoItem label="Region/State" value={stateOrRegion} />
          <InfoItem label="Date of Birth" value={dob} />
          <InfoItem label="Gender" value={gender} />
          <InfoItem label="Status" value={status} />
        </div>
      )}

      {!isLoading && !patient && (
        <div className="text-sm text-red-600">Patient not found.</div>
      )}
    </div>
  );
}
