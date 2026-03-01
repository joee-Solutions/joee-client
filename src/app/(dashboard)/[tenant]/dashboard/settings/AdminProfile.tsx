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
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";

const AdminSchema = z.object({
  name: z.string({ required_error: "This field is required" }),
  email: z.string({ required_error: "This field is required" }).email(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  organization: z.string().optional(),
  website: z.string().optional(),
});

type AdminSchemaType = z.infer<typeof AdminSchema>;

export default function AdminProfilePage({ initialData }: { initialData?: any }) {
  const [isDisabled, setIsDisabled] = useState(true);
  const [loading, setLoading] = useState(true);

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
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_PROFILE);
        const data = response?.data ?? (response as any)?.data?.data ?? response ?? initialData;
        const source = data ?? initialData;
        if (source) {
          const meta = source.address_metadata;
          const addressStr = source.address ?? (meta ? [meta.address, meta.city, meta.state, meta.zip, meta.country].filter(Boolean).join(", ") : "") ?? "";
          form.reset({
            name: (source.name ?? "") as string,
            email: (source.email ?? "") as string,
            phoneNumber: (source.phone_number ?? source.phone ?? "") as string,
            address: addressStr as string,
            organization: (source.domain ?? source.organization ?? "") as string,
            website: (source.website ?? "") as string,
          });
        }
      } catch (e: any) {
        if (!initialData) toast.error((e?.response?.data?.message as string) ?? "Failed to load profile", { toastId: "profile-load" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [initialData]);

  const onSubmit = async (payload: AdminSchemaType) => {
    try {
      await processRequestOfflineAuth("patch", API_ENDPOINTS.UPDATE_PROFILE, {
        name: payload.name,
        email: payload.email,
        phone_number: payload.phoneNumber,
        address: payload.address,
        domain: payload.organization,
        website: payload.website,
      });
      toast.success("Profile updated successfully", { toastId: "profile-save" });
      setIsDisabled(true);
    } catch (e: any) {
      toast.error((e?.response?.data?.message as string) ?? "Failed to update profile", { toastId: "profile-save-error" });
    }
  };

  const handleDisbleForm = () => {
    setIsDisabled(false);
  };

  if (loading) {
    return (
      <>
        <h2 className="font-bold text-base text-black mb-[30px]">Admin Profile</h2>
        <p className="text-gray-500">Loading profile...</p>
      </>
    );
  }

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Admin Profile
      </h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="name"
            type="text"
            control={form.control}
            labelText="Organization Name"
            placeholder="Enter here"
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
            name="organization"
            control={form.control}
            labelText="Domain"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="website"
            control={form.control}
            labelText="Website"
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
