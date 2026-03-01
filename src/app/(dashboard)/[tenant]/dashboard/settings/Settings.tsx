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
});

type SettingSchemaType = z.infer<typeof SettingSchema>;

export default function Settings({ initialData }: { initialData?: ProfileData | null }) {
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
      });
      if (source.logo && typeof source.logo === "string") setLogoPreview(source.logo);
    }
  }, [initialData, form]);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDisbleForm = () => {
    setIsDisabled(false);
  };

  const handleFileDragHover = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDropZoneHover(true);
  };

  const handleFileDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDropZoneHover(false);
  };

  const handleFileDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

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

    console.log(file, ".......");
    form.setValue("systemLogo", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const onSubmitHandler = async (payload: SettingSchemaType) => {
    try {
      const body: any = {
        name: payload.systemName,
        email: payload.email,
        phone_number: payload.phoneNumber,
        address: payload.address,
        domain: payload.organization,
        status: payload.title,
      };
      if (payload.systemLogo && payload.systemLogo instanceof File) {
        const formData = new FormData();
        formData.append("logo", payload.systemLogo);
        Object.entries(body).forEach(([k, v]) => v != null && formData.append(k, String(v)));
        await processRequestOfflineAuth("patch", API_ENDPOINTS.UPDATE_PROFILE, formData);
      } else {
        await processRequestOfflineAuth("patch", API_ENDPOINTS.UPDATE_PROFILE, body);
      }
      toast.success("Settings saved successfully", { toastId: "settings-save" });
      setIsDisabled(true);
    } catch (e: any) {
      toast.error((e?.response?.data?.message as string) ?? "Failed to save settings", { toastId: "settings-save-error" });
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
              className="flex items-center justify-center flex-col relative overflow-hidden bg-[#F7FAFF] hover:bg-[#ecf2fc] border-2 border-dashed border-separate border-[#61b5ff] text-[#016BB5] rounded-[8px] w-full h-[240px] py-[27px] max-w-[600px]"
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
            labelText="System Name"
            type="text"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="title"
            control={form.control}
            labelText="Status"
            type="text"
            placeholder="e.g. active"
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
            name="organization"
            control={form.control}
            labelText="Organization"
            placeholder="Enter here"
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
