import React, { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for a discharge entry
type DischargeEntry = {
  id: number;
  patientStatus: string;
  dischargedDate: string;
  reasonForDischarge: string;
};

export default function PatientDischargeForm() {
  const [dischargeEntries, setDischargeEntries] = useState<DischargeEntry[]>([
    {
      id: 1,
      patientStatus: "Discharged",
      dischargedDate: "",
      reasonForDischarge: "",
    },
  ]);

  const patientStatusOptions = [
    "Discharged",
    "Admitted",
    "Ongoing",
    "Transferred",
  ];

  const addDischargeEntry = (): void => {
    const newId =
      dischargeEntries.length > 0
        ? Math.max(...dischargeEntries.map((entry) => entry.id)) + 1
        : 1;

    setDischargeEntries([
      ...dischargeEntries,
      {
        id: newId,
        patientStatus: "Discharged",
        dischargedDate: "",
        reasonForDischarge: "",
      },
    ]);
  };

  const removeDischargeEntry = (id: number): void => {
    if (dischargeEntries.length > 1) {
      setDischargeEntries(dischargeEntries.filter((entry) => entry.id !== id));
    }
  };

  const updateDischargeEntry = (
    id: number,
    field: keyof DischargeEntry,
    value: string
  ): void => {
    setDischargeEntries(
      dischargeEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log("Patient Discharge Form submitted:", dischargeEntries);
    // Handle form submission logic here
  };

  return (
    <div className=" mx-auto p-6 ">
      <h1 className="text-2xl font-bold mb-6">Patient Discharge Information</h1>

      <form onSubmit={handleSubmit}>
        {dischargeEntries.map((entry, index) => (
          <div key={entry.id} className="mb-8 border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Discharge Entry {index + 1}
              </h2>
              <div className="flex gap-2">
                {dischargeEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDischargeEntry(entry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
                {index === dischargeEntries.length - 1 && (
                  <button
                    type="button"
                    onClick={addDischargeEntry}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Another
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Status */}
              <div>
                <label
                  htmlFor={`patientStatus-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Patient Status
                </label>
                <Select
                  value={entry.patientStatus}
                  onValueChange={(value) =>
                    updateDischargeEntry(entry.id, "patientStatus", value)
                  }
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {patientStatusOptions.map((status) => (
                      <SelectItem key={status} value={status} className="hover:bg-gray-200">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discharged Date */}
              <div>
                <label
                  htmlFor={`dischargedDate-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Discharged Date
                </label>
                <input
                  type="date"
                  name={`dischargedDate-${entry.id}`}
                  value={entry.dischargedDate}
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateDischargeEntry(entry.id, "dischargedDate", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Reason for Discharge */}
            <div className="mt-6">
              <label
                htmlFor={`reasonForDischarge-${entry.id}`}
                className="block text-base text-black font-normal mb-2"
              >
                Reason for Discharge
              </label>
              <Textarea
                value={entry.reasonForDischarge}
            className="w-full h-32 p-3 border border-[#737373] rounded"
                onChange={(e) =>
                  updateDischargeEntry(entry.id, "reasonForDischarge", e.target.value)
                }
                rows={4}
                placeholder="Enter reason for discharge"
              />
            </div>
          </div>
        ))}

        <div className="mt-8">
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}