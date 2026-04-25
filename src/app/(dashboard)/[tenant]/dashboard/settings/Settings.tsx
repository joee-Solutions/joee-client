"use client";
import { DownloadIcon } from "@/components/icons/icon";
import FieldBox from "@/components/shared/form/FieldBox";
import FieldFileInput from "@/components/shared/form/FieldFileInput";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, Edit } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import type { ProfileData } from "./page";
import { parseTenantProfileResponse, tenantLogoToImageSrc } from "@/utils/profile-api";

const SettingSchema = z.object({
  systemLogo: z
    .instanceof(File)
    .optional()
    .refine((f) => !f || ["image/png", "image/jpeg", "image/jpg"].includes(f.type), {
      message: "Unsupported image file",
    }),
  systemName: z.string({ required_error: "This field is required" }),
  title: z.string().optional(),
  address: z.string().optional(),
  email: z.string({ required_error: "This field is required" }),
  phoneNumber: z.string().optional(),
  organization: z.string().optional(),
  organizationType: z.string().optional(),
  website: z.string().optional(),
  faxNumber: z.string().optional(),
});

type SettingSchemaType = z.infer<typeof SettingSchema>;

export default function Settings({
  initialData,
  onProfileUpdated,
  onLogoPreviewChange,
}: {
  initialData?: ProfileData | null;
  onProfileUpdated?: (next: ProfileData | null) => void;
  onLogoPreviewChange?: (nextLogo: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isDropZoneHover, setIsDropZoneHover] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const form = useForm<SettingSchemaType>({
    resolver: zodResolver(SettingSchema),
    mode: "onChange",
    defaultValues: {
      systemLogo: undefined,
      systemName: "",
      title: "",
      address: "",
      email: "",
      phoneNumber: "",
      organization: "",
      organizationType: "",
      website: "",
      faxNumber: "",
    },
  });

  useEffect(() => {
    const source = initialData ?? null;
    if (source) {
      const meta = source.address_metadata;
      const addressStr = source.address ?? (meta ? [meta.address, meta.city, meta.state, meta.zip, meta.country].filter(Boolean).join(", ") : "") ?? "";
      form.reset({
        systemName: source.name ?? "",
        title: source.status ?? "",
        address: addressStr,
        email: source.email ?? "",
        phoneNumber: source.phone_number ?? "",
        organization: source.domain ?? source.name ?? "",
        organizationType: source.organization_type ?? "",
        website: source.website ?? "",
        faxNumber: source.fax_number ?? "",
      });
      const logoUrl = tenantLogoToImageSrc(source.logo);
      setLogoPreview(logoUrl ?? "");
      onLogoPreviewChange?.(logoUrl ?? null);
    } else {
      setLogoPreview("");
      onLogoPreviewChange?.(null);
    }
  }, [initialData, form, onLogoPreviewChange]);

  const triggerFileUpload = () => {
    if (isDisabled) return;
    fileInputRef.current?.click();
  };

  const handleDisbleForm = () => {
    setIsDisabled(false);
  };

  const handleFileDragHover = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isDisabled) return;
    setIsDropZoneHover(true);
  };

  const handleFileDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isDisabled) return;
    setIsDropZoneHover(false);
  };

  const handleFileDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isDisabled) return;

    setIsDropZoneHover(false);
    form.clearErrors("systemLogo");

    const fileKind = event.dataTransfer.items[0].kind;
    const fileType = event.dataTransfer.items[0].type;

    if (fileKind !== "file" || fileType.includes("video")) {
      form.setError("systemLogo", { message: "Unsupported file type" });
      return;
    }

    if (fileKind === "file" && fileType === "") {
      form.setError("systemLogo", {
        message: "Please upload recognized file type indicated above",
      });
      return;
    }
    const file =
      event.dataTransfer.files.item(0) || form.getValues("systemLogo");

    form.setValue("systemLogo", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const nextLogo = reader.result as string;
        setLogoPreview(nextLogo);
        onLogoPreviewChange?.(nextLogo);
      };

      reader.readAsDataURL(file);
    }
  };

  const onSubmitHandler = async (payload: SettingSchemaType) => {
    try {
      const getErrorText = (err: any): string => {
        const data = err?.response?.data;
        if (Array.isArray(data?.message)) return data.message.join(", ");
        if (Array.isArray(data?.errors)) return data.errors.join(", ");
        if (Array.isArray(data?.validationErrors)) return data.validationErrors.join(", ");
        return String(data?.message || data?.error || err?.message || "");
      };

      const body: Record<string, unknown> = {
        name: payload.systemName,
        email: payload.email,
        phone_number: payload.phoneNumber,
        address: payload.address,
        domain: payload.organization,
        status: payload.title,
        organization_type: payload.organizationType || undefined,
        website: payload.website?.trim() ? payload.website : null,
        fax_number: payload.faxNumber?.trim() ? payload.faxNumber : null,
      };
      if (payload.systemLogo && payload.systemLogo instanceof File) {
        // Backend multipart usually whitelists only the file field (e.g. multer .single("logo")).
        // Mixing text fields in the same FormData triggers "Unexpected field".
        await processRequestOfflineAuth("patch", API_ENDPOINTS.UPDATE_PROFILE, body);
        const tryLogoUpload = async (
          method: "patch" | "put",
          field: "logo" | "file" | "systemLogo"
        ) => {
          const fd = new FormData();
          fd.append(field, payload.systemLogo as File, (payload.systemLogo as File).name);
          await processRequestOfflineAuth(method, API_ENDPOINTS.UPDATE_PROFILE, fd);
        };
        let uploaded = false;
        let lastErr: any = null;
        for (const method of ["patch", "put"] as const) {
          for (const field of ["logo", "file", "systemLogo"] as const) {
          try {
              await tryLogoUpload(method, field);
            uploaded = true;
            break;
          } catch (e: any) {
            lastErr = e;
            const status = Number(e?.response?.status || 0);
            const msg = getErrorText(e).toLowerCase();
            const canTryAnotherField =
              status === 400 ||
              status === 415 ||
              status === 422 ||
              msg.includes("unexpected field") ||
              msg.includes("must be a") ||
              msg.includes("validation");
            if (!canTryAnotherField) {
              throw e;
            }
          }
        }
          if (uploaded) break;
        }
        // Fallback: some backends accept logo as base64/json field instead of multipart.
        if (!uploaded) {
          const dataUrlLogo = logoPreview?.startsWith("data:") ? logoPreview : "";
          if (dataUrlLogo) {
            for (const key of ["logo", "image", "profile_picture"] as const) {
              try {
                await processRequestOfflineAuth("patch", API_ENDPOINTS.UPDATE_PROFILE, {
                  ...body,
                  [key]: dataUrlLogo,
                });
                uploaded = true;
                break;
              } catch (e) {
                lastErr = e;
              }
            }
          }
        }
        if (!uploaded && lastErr) throw lastErr;
        form.setValue("systemLogo", undefined);
      } else {
        await processRequestOfflineAuth("patch", API_ENDPOINTS.UPDATE_PROFILE, body);
      }
      toast.success("Settings saved successfully", { toastId: "settings-save" });
      setIsDisabled(true);
      const refreshed = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_PROFILE);
      const { profile: tenantProfile } = parseTenantProfileResponse(refreshed);
      const persistedLogo = tenantLogoToImageSrc((tenantProfile as ProfileData | null)?.logo);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("profile-updated", {
            detail: { profile: (tenantProfile as ProfileData | null) ?? null },
          })
        );
      }
      onLogoPreviewChange?.(persistedLogo ?? null);
      onProfileUpdated?.((tenantProfile as ProfileData) ?? null);
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = Array.isArray(data?.message)
        ? data.message.join(", ")
        : Array.isArray(data?.validationErrors)
        ? data.validationErrors.join(", ")
        : (data?.message as string) ?? "Failed to save settings";
      toast.error(msg, { toastId: "settings-save-error" });
    }
  };

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        System Configuration
      </h2>
      <FormComposer form={form} onSubmit={onSubmitHandler}>
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-base text-black">System logo</p>
            <div
              onDragOver={handleFileDragHover}
              onDragLeave={handleFileDragLeave}
              onDrop={handleFileDragEnter}
              className={`flex items-center justify-center flex-col relative overflow-hidden border-2 border-dashed border-separate border-[#61b5ff] text-[#016BB5] rounded-[8px] w-full h-[240px] py-[27px] max-w-[600px] ${
                isDisabled
                  ? "bg-[#EEF3FA] opacity-80"
                  : "bg-[#F7FAFF] hover:bg-[#ecf2fc]"
              }`}
            >
              {!logoPreview && (
                <div className="flex flex-col justify-center items-center gap-2">
                  {isDropZoneHover ? (
                    <p className="font-medium text-sm text-black">
                      Drop your file here...
                    </p>
                  ) : (
                    <>
                      <CloudUpload size={24} className="text-[#4E66A8]" />
                      <p className="font-medium text-sm text-black">
                        Drag your image here
                      </p>
                      <p className="font-normal text-sm text-[#B3B3B3]">
                        (only *jpeg and *png will be accepted)
                      </p>
                      <p className="font-medium text-sm text-black">Or</p>
                      <Button
                        type="button"
                        onClick={triggerFileUpload}
                        disabled={isDisabled}
                        className="font-medium text-sm text-white rounded-[4px] p-[10px] bg-[#003465]"
                      >
                        Upload document
                      </Button>
                    </>
                  )}
                </div>
              )}

              <FieldFileInput
                control={form.control}
                name="systemLogo"
                fileInputRef={fileInputRef}
                setImagePreviewer={setLogoPreview}
                hidden
              />
              {logoPreview && (
                <Image
                  src={logoPreview}
                  alt="logo previewer"
                  fill
                  sizes="(max-width: 600px) 100vw, 600px"
                  unoptimized
                  className="aspect-square object-cover absolute inset-0 z-10 cursor-pointer"
                />
              )}
              {logoPreview && (
                <Button
                  type="button"
                  onClick={triggerFileUpload}
                  disabled={isDisabled}
                  className="font-medium text-sm text-white rounded-[4px] p-[10px] bg-[#288be1] absolute bottom-4 z-30 shadow-2xl"
                >
                  Change document
                </Button>
              )}
            </div>
            <p className="text-[0.8rem] font-medium text-destructive">
              {form.getFieldState("systemLogo").error?.message}
            </p>
          </div>
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="systemName"
            control={form.control}
            labelText="Organization Name"
            type="text"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="organizationType"
            control={form.control}
            labelText="Organization Type"
            type="text"
            placeholder="e.g. Laboratory"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="title"
            control={form.control}
            labelText="Status"
            type="text"
            placeholder="e.g. active"
            disabled
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
            type="text"
            name="website"
            control={form.control}
            labelText="Website"
            placeholder="https://"
            disabled
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="faxNumber"
            control={form.control}
            labelText="Fax number"
            placeholder="Enter here"
            disabled={isDisabled}
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="organization"
            control={form.control}
            labelText="Domain"
            placeholder="Tenant subdomain / domain"
            disabled
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
