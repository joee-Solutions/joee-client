import { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for an immunization entry
type ImmunizationEntry = {
  id: number;
  immunizationType: string;
  date: string;
  additionalInfo: string;
};

const immunizationTypes = [
  "Influenza (Flu)",
  "COVID-19",
  "Tdap (Tetanus, Diphtheria, Pertussis)",
  "MMR (Measles, Mumps, Rubella)",
  "HPV",
  "Hepatitis B",
  "Pneumococcal",
  "Varicella (Chickenpox)",
  "Meningococcal",
];

export default function ImmunizationForm() {
  const [immunizationEntries, setImmunizationEntries] = useState<ImmunizationEntry[]>([
    {
      id: 1,
      immunizationType: "",
      date: "",
      additionalInfo: "",
    },
  ]);

  const addImmunizationEntry = (): void => {
    const newId =
      immunizationEntries.length > 0
        ? Math.max(...immunizationEntries.map((entry) => entry.id)) + 1
        : 1;

    setImmunizationEntries([
      ...immunizationEntries,
      {
        id: newId,
        immunizationType: "",
        date: "",
        additionalInfo: "",
      },
    ]);
  };

  const removeImmunizationEntry = (id: number): void => {
    if (immunizationEntries.length > 1) {
      setImmunizationEntries(immunizationEntries.filter((entry) => entry.id !== id));
    }
  };

  const updateImmunizationEntry = (
    id: number,
    field: keyof ImmunizationEntry,
    value: string
  ): void => {
    setImmunizationEntries(
      immunizationEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log("Immunization Form submitted:", immunizationEntries);
    // Handle form submission logic here
  };

  return (
    <div className=" mx-auto p-6 ">
      <h1 className="text-2xl font-bold mb-6">Immunization History</h1>

      <form onSubmit={handleSubmit}>
        {immunizationEntries.map((entry, index) => (
          <div key={entry.id} className="mb-8 border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Immunization Entry {index + 1}</h2>
              <div className="flex gap-2">
                {immunizationEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImmunizationEntry(entry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
                {index === immunizationEntries.length - 1 && (
                  <button
                    type="button"
                    onClick={addImmunizationEntry}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Another
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Immunization Type */}
              <div>
                <label
                  htmlFor={`immunizationType-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Immunization Type
                </label>
                <Select
                  value={entry.immunizationType}
                  onValueChange={(value) =>
                    updateImmunizationEntry(entry.id, "immunizationType", value)
                  }
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Select immunization type" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {immunizationTypes.map((type) => (
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
                <input
                  type="date"
                  name={`date-${entry.id}`}
                  value={entry.date}
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateImmunizationEntry(entry.id, "date", e.target.value)
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
                  updateImmunizationEntry(entry.id, "additionalInfo", e.target.value)
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