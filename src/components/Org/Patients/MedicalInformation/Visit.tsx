import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { Calendar } from "lucide-react";

// Define the type for a visit entry
type VisitEntry = {
  id: number;
  visitCategory: string;
  dateOfService: string;
  duration: string;
  chiefComplaint: string;
  hpiOnsetDate: string;
  hpiDuration: string;
  severity: string;
  quality: string;
  aggravatingFactors: string;
  diagnosis: string;
  diagnosisOnsetDate: string;
  treatmentPlan: string;
  providerName: string;
  providerSignature: string;
};

export default function MedicalVisitForm() {
  const [visitEntries, setVisitEntries] = useState<VisitEntry[]>([
    {
      id: 1,
      visitCategory: "",
      dateOfService: "",
      duration: "",
      chiefComplaint: "",
      hpiOnsetDate: "",
      hpiDuration: "",
      severity: "",
      quality: "",
      aggravatingFactors: "",
      diagnosis: "",
      diagnosisOnsetDate: "",
      treatmentPlan: "",
      providerName: "",
      providerSignature: "",
    },
  ]);

  const addVisitEntry = (): void => {
    const newId =
      visitEntries.length > 0
        ? Math.max(...visitEntries.map((entry) => entry.id)) + 1
        : 1;

    setVisitEntries([
      ...visitEntries,
      {
        id: newId,
        visitCategory: "",
        dateOfService: "",
        duration: "",
        chiefComplaint: "",
        hpiOnsetDate: "",
        hpiDuration: "",
        severity: "",
        quality: "",
        aggravatingFactors: "",
        diagnosis: "",
        diagnosisOnsetDate: "",
        treatmentPlan: "",
        providerName: "",
        providerSignature: "",
      },
    ]);
  };

  const removeVisitEntry = (id: number): void => {
    if (visitEntries.length > 1) {
      setVisitEntries(visitEntries.filter((entry) => entry.id !== id));
    }
  };

  const handleInputChange = (
    id: number,
    field: keyof VisitEntry,
    value: string
  ): void => {
    setVisitEntries(
      visitEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = (): void => {
    console.log("Visit Entries Submitted:", visitEntries);
    // Handle form submission logic here
  };

  // Mock data for dropdowns
  const visitCategories = [
    "Initial Visit",
    "Follow-up",
    "Urgent Care",
    "Annual Physical",
    "Consultation",
  ];
  const durations = [
    "15 minutes",
    "30 minutes",
    "45 minutes",
    "60 minutes",
    "90 minutes",
  ];
  const severityOptions = ["Mild", "Moderate", "Severe", "Very Severe"];
  const qualityOptions = ["Sharp", "Dull", "Burning", "Throbbing", "Aching"];
  const aggravatingFactors = ["Movement", "Rest", "Cold", "Heat", "Stress", "Food"];
  const conditions = ["Hypertension", "Diabetes", "Asthma", "Arthritis", "Migraine"];

  return (
    <div className=" mx-auto p-6 ">
      <h1 className="text-2xl font-bold mb-6">Medical Visit Details</h1>

      <div>
        {visitEntries.map((entry, index) => (
          <div key={entry.id} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Visit Entry {index + 1}
              </h2>
              <div className="flex gap-2">
                {visitEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVisitEntry(entry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
                {index === visitEntries.length - 1 && (
                  <button
                    type="button"
                    onClick={addVisitEntry}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Another
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visit Category */}
              <div>
                <label className="block text-base text-black font-normal mb-2">
                  Visit Category
                </label>
                <Select
                  value={entry.visitCategory}
                  onValueChange={(value) =>
                    handleInputChange(entry.id, "visitCategory", value)
                  }
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Enter here" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {visitCategories.map((category) => (
                      <SelectItem key={category} value={category} className="hover:bg-gray-200">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Service */}
              <div>
                <label className="block text-base text-black font-normal mb-2">
                  Date of Service
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name={`dateOfService-${entry.id}`}
            className="w-full h-14 p-3 border border-[#737373] rounded"
                    value={entry.dateOfService}
                    onChange={(e) =>
                      handleInputChange(entry.id, "dateOfService", e.target.value)
                    }
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-base text-black font-normal mb-2">
                  Duration
                </label>
                <Select
                  value={entry.duration}
                  onValueChange={(value) =>
                    handleInputChange(entry.id, "duration", value)
                  }
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Enter here" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {durations.map((duration) => (
                      <SelectItem key={duration} value={duration} className="hover:bg-gray-200">
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Presenting Complaint & History of Present Illness */}
            <div className="mt-6">
              <h3 className="text-base font-medium mb-4">Presenting Complaint & History of Present Illness</h3>
              
              {/* Chief Complaint */}
              <div className="mb-6">
                <label className="block text-base text-black font-normal mb-2">
                  Chief Complaint
                </label>
                <Textarea
                  value={entry.chiefComplaint}
            className="w-full h-32 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    handleInputChange(entry.id, "chiefComplaint", e.target.value)
                  }
                />
              </div>

              <h3 className="text-base font-medium mb-4">History of Present Illness (HPI)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HPI Onset Date */}
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Onset date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name={`hpiOnsetDate-${entry.id}`}
            className="w-full h-14 p-3 border border-[#737373] rounded"
                      value={entry.hpiOnsetDate}
                      onChange={(e) =>
                        handleInputChange(entry.id, "hpiOnsetDate", e.target.value)
                      }
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>

                {/* HPI Duration */}
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Duration
                  </label>
                  <Select
                    value={entry.hpiDuration}
                    onValueChange={(value) =>
                      handleInputChange(entry.id, "hpiDuration", value)
                    }
                  >
                    <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                      <SelectValue placeholder="Enter here" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {durations.map((duration) => (
                        <SelectItem key={duration} value={duration} className="hover:bg-gray-200">
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Severity
                  </label>
                  <Select
                    value={entry.severity}
                    onValueChange={(value) =>
                      handleInputChange(entry.id, "severity", value)
                    }
                  >
                    <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                      <SelectValue placeholder="Enter here" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {severityOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-gray-200">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Quality
                  </label>
                  <Select
                    value={entry.quality}
                    onValueChange={(value) =>
                      handleInputChange(entry.id, "quality", value)
                    }
                  >
                    <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                      <SelectValue placeholder="Enter here" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {qualityOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-gray-200">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Aggravating/relieving factors */}
              <div className="mt-6">
                <label className="block text-base text-black font-normal mb-2">
                  Aggravating/relieving factors
                </label>
                <Select
                  value={entry.aggravatingFactors}
                  onValueChange={(value) =>
                    handleInputChange(entry.id, "aggravatingFactors", value)
                  }
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Enter here" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {aggravatingFactors.map((factor) => (
                      <SelectItem key={factor} value={factor} className="hover:bg-gray-200">
                        {factor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="mt-6">
              <h3 className="text-base font-medium mb-4">Diagnosis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Condition */}
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Condition
                  </label>
                  <Select
                    value={entry.diagnosis}
                    onValueChange={(value) =>
                      handleInputChange(entry.id, "diagnosis", value)
                    }
                  >
                    <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                      <SelectValue placeholder="Enter here" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition} className="hover:bg-gray-200">
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Diagnosis Onset Date */}
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Onset date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name={`diagnosisOnsetDate-${entry.id}`}
                        className="w-full h-14 p-3 border border-[#737373] rounded"
                      value={entry.diagnosisOnsetDate}
                      onChange={(e) =>
                        handleInputChange(entry.id, "diagnosisOnsetDate", e.target.value)
                      }
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Plan */}
            <div className="mt-6">
              <h3 className="text-base font-medium mb-4">Treatment Plan</h3>
              
              <div className="mb-6">
                <label className="block text-base text-black font-normal mb-2">
                  Notes
                </label>
                <Textarea
                  value={entry.treatmentPlan}
            className="w-full h-32 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    handleInputChange(entry.id, "treatmentPlan", e.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>

            {/* Provider Information */}
            <div className="mt-6">
              <div className="mb-6">
                <label className="block text-base text-black font-normal mb-2">
                  Provider name
                </label>
                <input
                  type="text"
                  name={`providerName-${entry.id}`}
            className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.providerName}
                  onChange={(e) =>
                    handleInputChange(entry.id, "providerName", e.target.value)
                  }
                  placeholder="Enter here"
                />
              </div>

              <div className="mb-6">
                <label className="block text-base text-black font-normal mb-2">
                  Provider signature with date and time stamp
                </label>
                <Textarea
                  value={entry.providerSignature}
            className="w-full h-32 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    handleInputChange(entry.id, "providerSignature", e.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>

            <hr className="my-8 border-gray-200" />
          </div>
        ))}

        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
