"use client";
import { DownloadIcon } from "@/components/icons/icon";
import FieldBox from "@/components/shared/form/FieldBox";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Cookies from "js-cookie";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import { parseTenantUserResponse } from "@/utils/tenant-user-api";
import { AUTH_USER_ID_COOKIE } from "@/utils/auth-user-id";

const AdminSchema = z.object({
  name: z.string({ required_error: "This field is required" }),
  email: z.string({ required_error: "This field is required" }).email(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  organization: z.string().optional(),
  website: z.string().optional(),
  specialty: z.string().optional(),
  designation: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  hireDate: z.string().optional(),
});

type AdminSchemaType = z.infer<typeof AdminSchema>;

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function AdminProfilePage({ initialData }: { initialData?: any }) {
  const [isDisabled, setIsDisabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | string | null>(null);

  const form = useForm<AdminSchemaType>({
    resolver: zodResolver(AdminSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      organization: "",
      website: "",
      specialty: "",
      designation: "",
      gender: "",
      dateOfBirth: "",
      hireDate: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const fromCookie = Cookies.get(AUTH_USER_ID_COOKIE);
        let uid: number | string | undefined = fromCookie || undefined;
        if (!uid) {
          try {
            const u = Cookies.get("user");
            if (u) uid = JSON.parse(u)?.id;
          } catch {
            /* ignore */
          }
        }
        if (!uid) {
          toast.error("Missing user id. Sign in again.", { toastId: "profile-load" });
          setLoading(false);
          return;
        }
        setUserId(uid);
        const response = await processRequestOfflineAuth(
          "get",
          API_ENDPOINTS.GET_TENANT_USER(uid)
        );
        const source = parseTenantUserResponse(response) ?? initialData;
        if (source) {
          const tenant = (source.tenant as Record<string, unknown>) || {};
          const first = String(source.firstname ?? source.first_name ?? source.firstName ?? "");
          const last = String(source.lastname ?? source.last_name ?? source.lastName ?? "");
          const displayName =
            `${first} ${last}`.trim() ||
            String(source.name ?? "") ||
            String(source.email ?? "");
          form.reset({
            name: displayName,
            email: String(source.email ?? ""),
            phoneNumber: String(source.phone_number ?? source.phone ?? source.phoneNumber ?? ""),
            address: String(source.address ?? ""),
            organization: String(tenant.domain ?? source.domain ?? ""),
            website: String(tenant.website ?? source.website ?? ""),
            specialty: String(source.specialty ?? ""),
            designation: String(source.designation ?? ""),
            gender: String(source.gender ?? ""),
            dateOfBirth: toDateInput(source.date_of_birth as string),
            hireDate: toDateInput(source.hire_date as string),
          });
        }
      } catch (e: any) {
        toast.error(
          (e?.response?.data?.message as string) ?? "Failed to load profile",
          { toastId: "profile-load" }
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [initialData]);

  const onSubmit = async (payload: AdminSchemaType) => {
    const id =
      userId ??
      Cookies.get(AUTH_USER_ID_COOKIE) ??
      (() => {
        try {
          const u = Cookies.get("user");
          return u ? JSON.parse(u)?.id : undefined;
        } catch {
          return undefined;
        }
      })();
    if (!id) {
      toast.error("Missing user id. Sign in again.", { toastId: "profile-save-error" });
      return;
    }
    try {
      const nameParts = payload.name.trim().split(/\s+/);
      const firstname = nameParts[0] ?? "";
      const lastname = nameParts.slice(1).join(" ");
      await processRequestOfflineAuth("patch", API_ENDPOINTS.PATCH_TENANT_USER(id), {
        firstname,
        lastname,
        email: payload.email,
        phone_number: payload.phoneNumber || undefined,
        address: payload.address || undefined,
        specialty: payload.specialty || undefined,
        designation: payload.designation || undefined,
        gender: payload.gender || undefined,
        date_of_birth: payload.dateOfBirth
          ? new Date(payload.dateOfBirth).toISOString()
          : undefined,
        hire_date: payload.hireDate
          ? new Date(payload.hireDate).toISOString()
          : undefined,
      });
      toast.success("Profile updated successfully", { toastId: "profile-save" });
      setIsDisabled(true);
    } catch (e: any) {
      toast.error(
        (e?.response?.data?.message as string) ?? "Failed to update profile",
        { toastId: "profile-save-error" }
      );
    }
  };

  const handleDisbleForm = () => {
    setIsDisabled(false);
  };

  if (loading) {
    return (
      <>
        <h2 className="font-bold text-base text-black mb-[30px]">Personal information</h2>
        <p className="text-gray-500">Loading profile...</p>
      </>
    );
  }

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">Personal information</h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="name"
            type="text"
            control={form.control}
            labelText="Full name"
            placeholder="First and last name"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="email"
            control={form.control}
            labelText="Email"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="phoneNumber"
            control={form.control}
            labelText="Phone number"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="address"
            control={form.control}
            labelText="Address"
            type="text"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="specialty"
            control={form.control}
            labelText="Specialty"
            placeholder="e.g. Doctor"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="designation"
            control={form.control}
            labelText="Designation"
            placeholder="e.g. Doctor"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="gender"
            control={form.control}
            labelText="Gender"
            placeholder="e.g. Male"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="date"
            name="dateOfBirth"
            control={form.control}
            labelText="Date of birth"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="date"
            name="hireDate"
            control={form.control}
            labelText="Hire date"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="organization"
            control={form.control}
            labelText="Tenant domain"
            placeholder="From organization (read-only context)"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="website"
            control={form.control}
            labelText="Organization website"
            placeholder="https://"
            disabled={isDisabled}
          />

          <div className="flex items-center gap-7">
            <Button
              type="button"
              onClick={handleDisbleForm}
              className={`${
                !isDisabled && "hidden"
              } h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full`}
            >
              Edit <Edit size={20} />
            </Button>
            <Button
              className={`${
                isDisabled && "hidden"
              } h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full`}
            >
              Save Changes <DownloadIcon />
            </Button>
          </div>
        </div>
      </FormComposer>
    </>
  );
}
