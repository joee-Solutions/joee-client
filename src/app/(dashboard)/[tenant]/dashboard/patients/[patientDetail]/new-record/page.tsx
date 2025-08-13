"use client";

import { Button } from "@/components/ui/button";
import {
  CircleArrowLeft,
  CircleCheck,
  CloudUpload,
  Minus,
  Plus,
  Trash,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import userProfileImage from "./../../../../../../../../public/assets/doctorMale.png";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MedicalRecordSchema, MedicalRecordSchemaType } from "@/models/form";
import FormComposer from "@/components/shared/form/FormComposer";
import FieldDateTimePicker from "@/components/shared/form/FieldDateTime";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import FieldItemList from "@/components/shared/form/FieldItemList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/inputShad";
import { useRef, useState } from "react";
import FieldFileInput from "@/components/shared/form/FieldFileInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const commonDrugs = [
  "Paracetamol",
  "Fibrin",
  "Insulin Fibre",
  "Vitamin C",
  "Amoxycillin",
];

export default function NewMedicalRecord() {
  const [drugName, setDrugName] = useState("");
  const [imagePreviewer, setImagePreviewer] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDropZoneHover, setIsDropZoneHover] = useState(false);
  const [dosageCount, setDosageCount] = useState(0);
  const [dosageInstructions, setDosageInstructions] = useState("");
  const [dosageUsage, setDosageUsage] = useState("");

  const path = usePathname().split("/");
  const router = useRouter();
  const userName = path[path.length - 2].replace("-", " ");

  const form = useForm<MedicalRecordSchemaType>({
    resolver: zodResolver(MedicalRecordSchema),
    mode: "onChange",
    defaultValues: {
      attachment: undefined,
      date: undefined,
      doctor: "",
      complaint: "",
      diagnosis: "",
      vitalSign: "",
      treatment: undefined,
      prescription: undefined,
    },
  });

  const {
    fields: prescriptions,
    append: appendPrescription,
    remove: removePrescription,
  } = useFieldArray({
    control: form.control,
    name: "prescription",
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
    form.clearErrors("attachment");

    const fileKind = event.dataTransfer.items[0].kind;
    const fileType = event.dataTransfer.items[0].type;
    event.dataTransfer;

    if (fileKind !== "file" || fileType.includes("video")) {
      form.setError("attachment", { message: "Unsupported file type" });
      return;
    }

    if (fileKind === "file" && fileType === "") {
      form.setError("attachment", {
        message: "Please upload recognized file type indicated above",
      });
      return;
    }
    const file =
      event.dataTransfer.files.item(0) || form.getValues("attachment");

    console.log(file, ".......");
    form.setValue("attachment", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewer(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const hanldeOnKeyPress = (val: string) => {
    setDrugName(val);
  };

  const handleDosageCountDec = () => {
    setDosageCount((prev) => {
      if (prev < 1) {
        return prev;
      }

      return prev - 1;
    });
  };

  const handleDosageCountInc = () => {
    setDosageCount((prev) => prev + 1);
  };

  const handleAddPrescription = () => {
    if (!drugName || !dosageCount || !dosageInstructions || !dosageUsage) {
      return;
    }

    appendPrescription({
      drugName: drugName,
      quantity: `${dosageCount}`,
      instruction: dosageInstructions,
      dosage: dosageUsage,
    });

    setDrugName("");
    setDosageCount(0);
    setDosageInstructions("");
    setDosageUsage("");
  };

  const onSubmit = (payload: MedicalRecordSchemaType) => {
    console.log(payload);
  };

  return (
    <section className="py-10 px-5">
      <div className="flex flex-col gap-[30px]">
        <div>
          <Button
            onClick={() => router.back()}
            className="font-semibold text-2xl text-black gap-1 p-0"
          >
            <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
            New Medical Record
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[398px_1fr] gap-5">
          <aside className="pb-[30px] px-[54px] pt-[34px] shadow-[0px_0px_4px_1px_#0000004D] h-max rounded-md">
            <div className="flex flex-col gap-[15px] items-center">
              <Image
                src={userProfileImage}
                alt="user profile picture"
                width={180}
                height={180}
                className="rounded-full object-cover"
              />
              <div className="text-center">
                <p className="font-semibold text-2xl text-black">{userName}</p>
                <p className="text-xs font-normal text-[#999999] mt-1">
                  Dentist
                </p>
                <p className="text-xs font-medium text-[#595959] mt-1">
                  +234-123-4567-890
                </p>
              </div>
              <span className="bg-[#E6EBF0] h-[30px] w-[76px] rounded-[20px] font-medium text-xs text-[#4E66A8] flex items-center justify-center">
                36 years
              </span>
            </div>
          </aside>
          <div className="px-[25px] pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md overflow-hidden">
            <FormComposer form={form} onSubmit={onSubmit}>
              <div className="grid gap-[30px] mb-10">
                <FieldDateTimePicker
                  control={form.control}
                  labelText="Date"
                  name="date"
                />
                <FieldSelect
                  control={form.control}
                  name="doctor"
                  labelText="Doctor"
                  options={["Doc 2"]}
                  placeholder="Select doctor"
                />
                <FieldTextBox
                  control={form.control}
                  labelText="Complaints"
                  name="complaint"
                  placeholder="Enter here"
                />
                <FieldTextBox
                  control={form.control}
                  labelText="Diagnosis"
                  name="diagnosis"
                  placeholder="Enter here"
                />
                <FieldTextBox
                  control={form.control}
                  labelText="Vital signs"
                  name="vitalSign"
                  placeholder="Enter here"
                />
                <FieldItemList
                  control={form.control}
                  placeholder="Add treatment..."
                  name="treatment"
                  labelText="Treatment"
                />
                <section>
                  <p className="text-base text-black font-medium mb-2">
                    Prescription
                  </p>
                  {prescriptions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-sky-200 text-black">
                          <TableHead>Item</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Instruction</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescriptions.map((pr, indx) => {
                          return (
                            <TableRow key={indx}>
                              <TableCell>{pr.drugName}</TableCell>
                              <TableCell>{pr.dosage}</TableCell>
                              <TableCell className="text-center">
                                <span className="flex items-center justify-center w-14 h-8 rounded-[50px] bg-slate-200">
                                  {pr.quantity}
                                </span>
                              </TableCell>
                              <TableCell>{pr.instruction}</TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  className="bg-[#EC0909]/20 w-10"
                                  onClick={() => {
                                    removePrescription(indx);
                                  }}
                                >
                                  <Trash2
                                    size={16}
                                    className="cursor-pointer text-[#EC0909]"
                                  />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : null}

                  <div className="flex flex-col gap-5 mt-5">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="item-1"
                        className="border border-[#BFBFBF] px-5 rounded hover:no-underline"
                      >
                        <AccordionTrigger className="font-medium text-base text-black">
                          {drugName ? drugName : "Select drug"}
                        </AccordionTrigger>
                        <AccordionContent className=" border-transparent border-b-0">
                          <div className="flex flex-col gap-5">
                            <Input
                              className="rounded-[6px] py-2 px-5 h-[40px] w-full focus-visible:ring-0 shadow-none"
                              placeholder="Add your own prescription"
                              type="text"
                              value={drugName}
                              onChange={(e) =>
                                hanldeOnKeyPress(e.currentTarget.value)
                              }
                            />
                            <div className="flex flex-col max-h-[200px] overflow-y-auto">
                              {commonDrugs.map((drug, idx) => (
                                <div
                                  key={drug}
                                  onClick={() => setDrugName(drug)}
                                  className={`px-5 py-[10px] cursor-pointer ${
                                    commonDrugs.indexOf(drugName) === idx
                                      ? "bg-[#D9EDFF]"
                                      : "hover:bg-slate-200"
                                  }`}
                                >
                                  {drug}
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <div className="flex flex-col gap-[30px]">
                      <div className="w-full">
                        <p className="text-base text-black font-medium mb-2">
                          Dosage Usage
                        </p>
                        <Input
                          className="rounded-[6px] py-2 px-5 h-[50px] w-full border-[#999999] focus-visible:ring-0 shadow-none"
                          placeholder="write here..."
                          type="text"
                          value={dosageUsage}
                          onChange={(e) =>
                            setDosageUsage(e.currentTarget.value)
                          }
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="max-w-[140px]">
                          <p className="text-base text-black font-medium mb-2">
                            Quantity
                          </p>
                          <div className="flex border border-[#999999] rounded-md items-center h-[50px]">
                            <span className="font-medium text-base text-black w-full px-5">
                              {dosageCount}
                            </span>
                            <Button
                              type="button"
                              className="w-[25px]"
                              onClick={handleDosageCountDec}
                            >
                              <Minus size={20} />
                            </Button>
                            <Button
                              type="button"
                              className="w-[25px]"
                              onClick={handleDosageCountInc}
                            >
                              <Plus size={20} />{" "}
                            </Button>
                          </div>
                        </div>
                        <div className="w-full">
                          <p className="text-base text-black font-medium mb-2">
                            Instruction for use
                          </p>
                          <Input
                            className="rounded-[6px] py-2 px-5 h-[50px] w-full border-[#999999] focus-visible:ring-0 shadow-none"
                            placeholder="write here..."
                            type="text"
                            value={dosageInstructions}
                            onChange={(e) =>
                              setDosageInstructions(e.currentTarget.value)
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#003465] bg-white h-[60px] text-[#003465]"
                        onClick={handleAddPrescription}
                      >
                        Add Prescription <Plus size={20} />
                      </Button>
                    </div>
                  </div>
                </section>
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-base text-black">
                    Attachments
                  </p>
                  <div
                    onDragOver={handleFileDragHover}
                    onDragLeave={handleFileDragLeave}
                    onDrop={handleFileDragEnter}
                    className="flex items-center justify-center flex-col relative overflow-hidden bg-[#F7FAFF] hover:bg-[#ecf2fc] border-2 border-dashed border-separate border-[#61b5ff] text-[#016BB5] rounded-[8px] w-full h-[240px] py-[27px] max-w-[600px]"
                  >
                    {!imagePreviewer && (
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
                      name="attachment"
                      fileInputRef={fileInputRef}
                      setImagePreviewer={setImagePreviewer}
                      hidden
                    />
                    {imagePreviewer && (
                      <img
                        src={imagePreviewer}
                        alt="logo previewer"
                        className="aspect-square object-cover w-full h-full absolute inset-0 z-10 cursor-pointer"
                      />
                    )}
                    {imagePreviewer && (
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
                    {form.getFieldState("attachment").error?.message}
                  </p>
                </div>
              </div>
              <Button className="font-medium text-base text-white bg-[#003465] w-full h-[60px]">
                Save <CircleCheck size={16} />
              </Button>
            </FormComposer>
          </div>
        </div>
      </div>
    </section>
  );
}
