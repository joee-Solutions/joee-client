"use client";

// import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AppointmentSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  department: z.string().min(1, "Department is required"),
  appointmentWith: z.string().min(1, "Appointment with is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  status: z.string().min(1, "Status is required"),
  appointmentDescription: z.string().optional(),
});

type AppointmentSchemaType = z.infer<typeof AppointmentSchema>;

export default function AddAppointment() {
  const router = useRouter();
  
  const form = useForm<AppointmentSchemaType>({
    resolver: zodResolver(AppointmentSchema),
    mode: "onChange",
    defaultValues: {
      patientName: "",
      department: "",
      appointmentWith: "",
      appointmentTime: "",
      appointmentDate: "",
      status: "",
      appointmentDescription: "",
    },
  });

  const onSubmit = (data: AppointmentSchemaType) => {
    console.log(data);
  
  };

  // Sample data for dropdowns
  const patients = ["John Doe", "Jane Smith", "Robert Johnson"];
  const departments = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics"];
  const doctors = ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown"];
  const statuses = ["Scheduled", "Completed", "Cancelled", "No Show"];

  return (
    <div className="py-8 p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D] mx-8">
      <div className="flex justify-between items-center border-b-2  py-4 mb-8">
        <h1 className="font-semibold text-xl text-black">Add Appointment</h1>
    
        <Button
                      onClick={() => ("add")}
                      className="text-base text-[#4E66A8] font-normal"
                    >
                      Appointment List
                    </Button>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Name */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Patient name</label>
            <Select onValueChange={(value) => form.setValue("patientName", value)}>
              <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                {patients.map((patient) => (
                  <SelectItem key={patient} value={patient} className="hover:bg-gray-200">
                    {patient}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Department */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Department</label>
            <Select onValueChange={(value) => form.setValue("department", value)}>
              <SelectTrigger className="w-full p-3 border  border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="hover:bg-gray-200">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Appointment With */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Appointment with</label>
            <Select onValueChange={(value) => form.setValue("appointmentWith", value)}>
              <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                {doctors.map((doctor) => (
                  <SelectItem key={doctor} value={doctor} className="hover:bg-gray-200">
                    {doctor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Appointment Time */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Appointment Time</label>
            <Input 
              placeholder="Enter here"
              type="time"
              {...form.register("appointmentTime")}
              className="w-full p-3 border border-[#737373] h-14 rounded"
            />
          </div>
          
          {/* Appointment Date */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Appointment Date</label>
            <div className="relative w-full">
              <Input 
                placeholder="DD/MM/YYYY"
                type="date"
                {...form.register("appointmentDate")}
                className="w-full p-3 border border-[#737373] h-14 rounded"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-calendar">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Status</label>
            <Select onValueChange={(value) => form.setValue("status", value)}>
              <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                {statuses.map((status) => (
                  <SelectItem key={status} value={status} className="hover:bg-gray-200">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Appointment Description */}
        <div>
          <label className="block text-base text-black font-normal mb-2">Appointment Description</label>
          <Textarea 
            {...form.register("appointmentDescription")}
            className="w-full p-3 min-h-52 border border-[#737373] rounded"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
        <Button
            type="button"
            className=" border border-[#EC0909] text-[#EC0909] hover:bg-[#ec090922] py-8 px-16 text-md rounded"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className=" bg-[#003465] hover:bg-[#0d2337] text-white py-8 px-16 text-md rounded"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}