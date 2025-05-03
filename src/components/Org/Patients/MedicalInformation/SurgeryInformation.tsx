import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for a surgery entry
type SurgeryEntry = {
  id: number;
  surgeryType: string;
  date: string;
  additionalInfo: string;
};

const surgeryTypes = [
  "Appendectomy",
  "Tonsillectomy",
  "Gallbladder removal",
  "Hip replacement",
  "Knee replacement",
  "Cesarean section",
  "Heart surgery",
  "Cataract surgery",
  "Hernia repair",
  "Thyroid surgery",
  "Other",
];

export default function SurgeryHistoryForm() {
  const [surgeryEntries, setSurgeryEntries] = useState<SurgeryEntry[]>([
    {
      id: 1,
      surgeryType: "",
      date: "",
      additionalInfo: "",
    },
  ]);

  const addSurgeryEntry = (): void => {
    const newId =
      surgeryEntries.length > 0
        ? Math.max(...surgeryEntries.map((entry) => entry.id)) + 1
        : 1;

    setSurgeryEntries([
      ...surgeryEntries,
      {
        id: newId,
        surgeryType: "",
        date: "",
        additionalInfo: "",
      },
    ]);
  };

  const removeSurgeryEntry = (id: number): void => {
    if (surgeryEntries.length > 1) {
      setSurgeryEntries(surgeryEntries.filter((entry) => entry.id !== id));
    }
  };

  const updateSurgeryEntry = (
    id: number,
    field: keyof SurgeryEntry,
    value: string
  ): void => {
    setSurgeryEntries(
      surgeryEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log("Surgery History Form submitted:", surgeryEntries);
    // Handle form submission logic here
  };

  return (
    <div className=" mx-auto p-6 ">
      <h1 className="text-2xl font-bold mb-6">Surgery History</h1>

      <form onSubmit={handleSubmit}>
        {surgeryEntries.map((entry, index) => (
          <div key={entry.id} className="mb-8 border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Surgery Entry {index + 1}</h2>
              <div className="flex gap-2">
                {surgeryEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSurgeryEntry(entry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
                {index === surgeryEntries.length - 1 && (
                  <button
                    type="button"
                    onClick={addSurgeryEntry}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Another
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Surgery Type */}
              <div>
                <label
                  htmlFor={`surgeryType-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Surgery Type
                </label>
                <Select
                  value={entry.surgeryType}
                  onValueChange={(value) =>
                    updateSurgeryEntry(entry.id, "surgeryType", value)
                  }
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Select surgery type" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {surgeryTypes.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-gray-200">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor={`date-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Date
                </label>
                <Input
                  type="date"
                  value={entry.date}
            className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateSurgeryEntry(entry.id, "date", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6">
              <label
                htmlFor={`additionalInfo-${entry.id}`}
                className="block text-base text-black font-normal mb-2"
              >
                Additional Information
              </label>
              <Textarea
                value={entry.additionalInfo}
            className="w-full h-32 p-3 border border-[#737373] rounded"
                onChange={(e) =>
                  updateSurgeryEntry(entry.id, "additionalInfo", e.target.value)
                }
                rows={4}
                placeholder="Enter additional information"
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