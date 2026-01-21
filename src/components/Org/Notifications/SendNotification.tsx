"use client";

import { Button } from "@/components/ui/button";
import { X, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormComposer from "@/components/shared/form/FormComposer";
import FieldBox from "@/components/shared/form/FieldBox";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import { useRef, useState, useEffect } from "react";

const notificationSchema = z.object({
  sender: z.string().min(1, "Sender is required"),
  notificationTitle: z.string().min(1, "Notification title is required"),
  receiverEmail: z.string().min(1, "Receiver's email is required"),
  receiverOrganization: z.string().min(1, "Receiver's organization is required"),
  date: z.string().min(1, "Date is required"),
  document: z.instanceof(File).optional(),
  message: z.string().min(1, "Message is required"),
});

export type NotificationFormType = z.infer<typeof notificationSchema>;

interface SendNotificationProps {
  emailOptions?: string[];
  organizationOptions?: string[];
  onSubmit?: (data: NotificationFormType) => void;
}

export default function SendNotification({
  emailOptions = ["Select", "user1@example.com", "user2@example.com"],
  organizationOptions = ["Select", "JON-KEN Hospital", "Brigerton Hospital", "JOEE Solutions"],
  onSubmit: onSubmitProp,
}: SendNotificationProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const form = useForm<NotificationFormType>({
    resolver: zodResolver(notificationSchema),
    mode: "onChange",
    defaultValues: {
      sender: "",
      notificationTitle: "",
      receiverEmail: "",
      receiverOrganization: "",
      date: "",
      message: "",
    },
  });

  const onSubmit = (payload: NotificationFormType) => {
    if (onSubmitProp) {
      onSubmitProp(payload);
    } else {
      console.log("Notification data:", payload);
      router.push("/dashboard/notifications");
    }
  };

  // Watch document field to update fileName
  const documentValue = form.watch("document");
  
  useEffect(() => {
    if (documentValue instanceof File) {
      setFileName(documentValue.name);
    } else {
      setFileName("");
    }
  }, [documentValue]);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header Banner */}
      <div className="relative h-[200px] bg-[#003465] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/header-bg.jpg')] bg-cover bg-center opacity-20 blur-sm"></div>
        <h1 className="relative z-10 text-white text-4xl font-bold">Notifications</h1>
      </div>

      {/* Main Content */}
      <div className="px-[30px] py-10">
        {/* Breadcrumbs and Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-[#737373]">
              <span className="font-bold text-black">Notifications</span> / Send notification
            </p>
            <h2 className="text-2xl font-bold text-black mt-2">SEND NOTIFICATION</h2>
          </div>
          <Link
            href="/dashboard/notifications"
            className="text-[#003465] font-medium text-base hover:underline"
          >
            Notification List
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-[0px_0px_4px_1px_#0000004D] p-8">
          <FormComposer form={form} onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender */}
              <FieldBox
                control={form.control}
                name="sender"
                labelText="Sender"
                placeholder="Enter name here"
                type="text"
                bgInputClass="bg-white"
              />

              {/* Notification Title */}
              <FieldBox
                control={form.control}
                name="notificationTitle"
                labelText="Notification Title"
                placeholder="Enter here"
                type="text"
                bgInputClass="bg-white"
              />

              {/* Receiver's Email */}
              <FieldSelect
                control={form.control}
                name="receiverEmail"
                labelText="Receiver's Email"
                placeholder="Select"
                options={emailOptions}
                bgSelectClass="bg-white"
              />

              {/* Receiver's Organization */}
              <FieldSelect
                control={form.control}
                name="receiverOrganization"
                labelText="Receiver's organization"
                placeholder="Select"
                options={organizationOptions}
                bgSelectClass="bg-white"
              />

              {/* Date */}
              <FieldBox
                control={form.control}
                name="date"
                labelText="Date"
                placeholder="Enter here"
                type="date"
                bgInputClass="bg-white"
              />

              {/* Upload Document */}
              <div className="w-full">
                <label className="font-medium text-base text-black mb-2 block">
                  Upload Document
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Choose File"
                      value={fileName}
                      readOnly
                      className="border border-[#737373] bg-white rounded-[4px] h-[60px] px-4 w-full text-sm text-[#737373]"
                    />
                    <Paperclip className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#737373]" />
                  </div>
                  <Button
                    type="button"
                    onClick={triggerFileUpload}
                    className="bg-[#003465] text-white h-[60px] px-6 hover:bg-[#003465]/90"
                  >
                    Browse
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="*/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      form.setValue("document", file);
                      setFileName(file.name);
                    }
                  }}
                />
              </div>
            </div>

            {/* Notification Message */}
            <div className="mt-6">
              <FieldTextBox
                control={form.control}
                name="message"
                labelText="Notification Message"
                placeholder="Your Message"
                bgInputClass="bg-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                type="submit"
                className="bg-[#003465] text-white h-[60px] px-8 hover:bg-[#003465]/90"
              >
                Send Notification
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border border-[#EC0909] text-[#EC0909] h-[60px] px-8 hover:bg-red-50"
              >
                Cancel <X className="ml-2 size-5" />
              </Button>
            </div>
          </FormComposer>
        </div>
      </div>
    </div>
  );
}

