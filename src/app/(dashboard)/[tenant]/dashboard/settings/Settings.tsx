"use client";
import { DownloadIcon } from "@/components/icons/icon";
import FieldBox from "@/components/shared/form/FieldBox";
import FieldFileInput from "@/components/shared/form/FieldFileInput";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, Edit, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SettingSchema = z.object({
  systemLogo: z
    .instanceof(File)
    .refine((f) => ["image/png", "image/jpeg", "image/jpg"].includes(f.type), {
      message: "Unsupported image file",
    }),
  systemName: z.string({ required_error: "This field is required" }),
  title: z.string({ required_error: "This field is required" }),
  address: z.string({ required_error: "This field is required" }),
  email: z.string({ required_error: "This field is required" }),
  phoneNumber: z.string({ required_error: "This field is required" }),
  organization: z.string({ required_error: "This field is required" }),
});

type SettingSchemaType = z.infer<typeof SettingSchema>;

export default function Settings() {
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
    event.dataTransfer;

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

  const onSubmitHandler = (payload: SettingSchemaType) => {
    console.log(payload);
    const formData = new FormData();

    const { systemLogo } = payload;

    for (const [key, value] of Object.entries(payload)) {
      if (systemLogo) {
        formData.append("systemLogo", systemLogo);
      }

      formData.append(key, JSON.stringify(value));
    }

    // send the formData to the backend

    setIsDisabled(true);
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
                <img
                  src={logoPreview}
                  alt="logo previewer"
                  className="aspect-square object-cover w-full h-full absolute inset-0 z-10 cursor-pointer"
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
          <FieldSelect
            bgSelectClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="title"
            control={form.control}
            options={["admin"]}
            labelText="Title"
            placeholder="Select"
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
