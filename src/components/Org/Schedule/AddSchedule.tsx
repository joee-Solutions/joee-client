"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ScheduleForm() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [employee, setEmployee] = useState("");

  // Mock data for employee dropdown
  const employees = ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis"];

  // Mock function for form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ employee, date, startTime, endTime });
    // Additional submission logic would go here
  };

  // Get day name from selected date
  const getFormattedDay = () => {
    if (!date) return "";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="py-8 p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D] mx-8">
      <div className="flex justify-between items-center border-b-2  py-4 mb-8">
        <h1 className="text-2xl font-bold">ADD SCHEDULE</h1>
        <a href="#" className="text-blue-700 font-medium">
          Schedule List
        </a>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Employee Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-medium mb-2">Employee</h2>
          <p className="text-gray-600 mb-4">Select employee to create schedule</p>

          <div className="my-8">
            <label htmlFor="employee" className="block text-base text-black font-normal mb-2">
              Employee name
            </label>
            <Select onValueChange={(value) => setEmployee(value)}>
              <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                {employees.map((emp) => (
                  <SelectItem key={emp} value={emp} className="hover:bg-gray-200">
                    {emp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Schedule Date and Time Section */}
        <div className="p-6">
          <h2 className="text-xl font-medium mb-2">Schedule date and Time</h2>
          <p className="text-gray-600 mb-4">
            Select the date and time for the specified schedule
          </p>

          {/* Date Field */}
          <div className="my-8">
            <label htmlFor="date" className="block text-base text-black font-normal mb-2">
              Date
            </label>
            <div className="relative">
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-14 p-3 border border-[#737373] rounded"
              />
              <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-6 w-full">
            <label className="block text-base text-black font-normal mb-2">Select Time</label>

            <div className="flex flex-col md:flex-row items-center space-x-24 w-full">
              <div className="  text-gray-700 my-4 md:mb-0">
                <h3 className="text-md text-gray-500 mb-4">Day</h3>
                <div className="font-medium">
                  {getFormattedDay() || "Wednesday, March 24, 2025"}
                </div>
              </div>

              <div className="  my-4 md:mb-0">
                <h3 className="text-md text-gray-500 mb-4">Schedule Time</h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex items-center border-l border-[#737373] pl-8">
                    <span className="mr-2">Start:</span>
                    <div className="relative ">
                      <Select onValueChange={(value) => setStartTime(value)}>
                        <SelectTrigger className="w-full  p-3 border border-[#737373] h-10 rounded flex justify-between items-center">
                          <SelectValue placeholder={startTime} />
                        </SelectTrigger>
                        <SelectContent className="z-10 bg-white">
                          {[
                            "8:00 AM",
                            "9:00 AM",
                            "10:00 AM",
                            "11:00 AM",
                            "12:00 PM",
                            "1:00 PM",
                            "2:00 PM",
                            "3:00 PM",
                            "4:00 PM",
                            "5:00 PM",
                          ].map((time) => (
                            <SelectItem key={time} value={time} className="hover:bg-gray-200">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2">Stop:</span>
                    <div className="relative">
                      <Select onValueChange={(value) => setEndTime(value)}>
                        <SelectTrigger className="w-full p-3 border border-[#737373] h-10 rounded flex justify-between items-center">
                          <SelectValue placeholder={endTime} />
                        </SelectTrigger>
                        <SelectContent className="z-10 bg-white">
                          {[
                            "8:00 AM",
                            "9:00 AM",
                            "10:00 AM",
                            "11:00 AM",
                            "12:00 PM",
                            "1:00 PM",
                            "2:00 PM",
                            "3:00 PM",
                            "4:00 PM",
                            "5:00 PM",
                          ].map((time) => (
                            <SelectItem key={time} value={time} className="hover:bg-gray-200">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Time Button */}
          <div className="my-6 flex items-center ">
            <Button
              type="button"
              variant="link"
              className="text-lg text-[#003465]"
              onClick={() => console.log("Add another time slot")}
            >
              Add Time
            </Button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4">
        <Button
            type="button"
            className=" border border-[#EC0909] text-[#EC0909] hover:bg-[#ec090922] py-8 px-16 text-md rounded"
            
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