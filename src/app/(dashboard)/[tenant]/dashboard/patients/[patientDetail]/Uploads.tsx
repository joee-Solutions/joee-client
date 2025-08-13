import { DownloadGreenIcon } from "@/components/icons/icon";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CloudUpload, Eye, FileIcon, FileText, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const UploadSchema = z.object({
  documents: z.array(
    z.object({
      file: z.instanceof(File).refine((file) => ["pdf"].includes(file.type), {
        message: "Unsupported file type",
      }),
      uploadedAt: z.date().optional(),
    })
  ),
});

type UploadSchemaType = z.infer<typeof UploadSchema>;

export default function Uploads() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDropZoneHover, setIsDropZoneHover] = useState(false);

  const form = useForm<UploadSchemaType>({
    resolver: zodResolver(UploadSchema),
    mode: "onChange",
    defaultValues: {
      documents: undefined,
    },
  });

  const {
    fields: allDocuments,
    append: appendDocuments,
    remove: deleteDocument,
  } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
    form.clearErrors("documents");

    const fileKind = event.dataTransfer.items[0].kind;
    const fileType = event.dataTransfer.items[0].type;
    event.dataTransfer;

    if (fileKind !== "file" || fileType.includes("video")) {
      form.setError("documents", { message: "Unsupported file type" });
      return;
    }

    if (fileKind === "file" && fileType === "") {
      form.setError("documents", {
        message: "Please upload recognized file type indicated above",
      });
      return;
    }
    const file = event.dataTransfer.files.item(0);

    if (file) {
      appendDocuments({ file: file, uploadedAt: new Date() });
    }
  };

  const handlepdfViewer = (file: File) => {
    const url = URL.createObjectURL(file);

    if (url) {
      window.open(url, "_blank");
    }
  };

  const handlePDFDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onSubmit = (payload: UploadSchemaType) => {
    console.log(payload);
  };

  return (
    <div>
      <h2 className="text-base font-bold text-black mb-5">Uploads</h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            {allDocuments.map((doc, idx) => (
              <div
                key={doc.id}
                className="min-w-[620px] flex justify-between gap-10 rounded px-[25px] py-[52px] shadow-[0px_4px_25px_0px_#0000001A]"
              >
                <div className="flex gap-5">
                  <div className="flex items-center justify-center h-[124px] w-[105px] rounded-[8px] bg-[#E6EBF0]">
                    <FileText size={69} />
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <p className="text-base font-semibold text-black">
                      {doc.file.name}
                    </p>
                    <p className="text-sm font-normal text-[#737373]">
                      Uploaded:{" "}
                      {doc.uploadedAt
                        ? format(doc.uploadedAt, "d MMMM, yyyy")
                        : ""}
                    </p>
                    <p className="text-sm font-normal text-[#737373]">
                      Time:{" "}
                      {doc.uploadedAt ? format(doc.uploadedAt, "h:mm a") : ""}
                    </p>
                    <p className="text-sm font-normal text-[#737373]">
                      File size: {(doc.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-[10px]">
                  <Button
                    type="button"
                    className="size-9 bg-white shadow-[0px_4px_25px_0px_#0000001A]"
                    onClick={() => handlePDFDownload(doc.file)}
                  >
                    <DownloadGreenIcon />
                  </Button>
                  <Button
                    type="button"
                    className="size-9 bg-white shadow-[0px_4px_25px_0px_#0000001A]"
                    onClick={() => handlepdfViewer(doc.file)}
                  >
                    <Eye size={20} className="text-[#003465]" />
                  </Button>
                  <Button
                    type="button"
                    className="size-9 bg-white shadow-[0px_4px_25px_0px_#0000001A]"
                    onClick={() => deleteDocument(idx)}
                  >
                    <Trash2 size={20} className="text-[#EC0909]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div
              onDragOver={handleFileDragHover}
              onDragLeave={handleFileDragLeave}
              onDrop={handleFileDragEnter}
              className="flex items-center justify-center flex-col relative overflow-hidden bg-[#F7FAFF] hover:bg-[#ecf2fc] border-2 border-dashed border-separate border-[#61b5ff] text-[#016BB5] rounded-[8px] w-full h-[240px] py-[27px] max-w-[600px]"
            >
              <div className="flex flex-col justify-center items-center gap-2">
                {isDropZoneHover ? (
                  <p className="font-medium text-sm text-black">
                    Drop your file here...
                  </p>
                ) : (
                  <>
                    <CloudUpload size={24} className="text-[#4E66A8]" />
                    <p className="font-medium text-sm text-black">
                      Drag your file here
                    </p>
                    <p className="font-normal text-sm text-[#B3B3B3]">
                      (only *jpeg, *png and *pdf will be accepted)
                    </p>
                    <p className="font-medium text-sm text-black">Or</p>
                    <Button
                      type="button"
                      onClick={triggerFileUpload}
                      className="font-medium text-sm text-white rounded-[4px] p-[10px] bg-[#003465]"
                    >
                      {allDocuments.length > 0
                        ? "Add document"
                        : "Upload document"}
                    </Button>
                  </>
                )}
              </div>

              <div className="w-full">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.item(0);

                    if (file) {
                      const url = URL.createObjectURL(file);
                      const date = new Date();
                      appendDocuments({ file, uploadedAt: date });
                    }
                  }}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
            </div>
            <p className="text-[0.8rem] font-medium text-destructive">
              {form.getFieldState("documents").error?.message}
            </p>
          </div>
        </div>
        <Button className="h-[60px] w-full bg-[#003465] text-white font-medium text-base mt-[30px]">
          Save Changes
        </Button>
      </FormComposer>
    </div>
  );
}
