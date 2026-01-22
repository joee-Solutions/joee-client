import { useState } from "react";

// Define the type for a family history entry
type FamilyHistoryEntry = {
  id: number;
  relative: string;
  conditions: string;
  ageOfDiagnosis: string;
  currentAge: string;
};

export default function FamilyHistoryForm() {
  const [familyHistoryEntries, setFamilyHistoryEntries] = useState<FamilyHistoryEntry[]>([
    {
      id: 1,
      relative: "",
      conditions: "",
      ageOfDiagnosis: "",
      currentAge: "",
    },
  ]);

  const addFamilyHistoryEntry = (): void => {
    const newId =
      familyHistoryEntries.length > 0
        ? Math.max(...familyHistoryEntries.map((entry) => entry.id)) + 1
        : 1;

    setFamilyHistoryEntries([
      ...familyHistoryEntries,
      {
        id: newId,
        relative: "",
        conditions: "",
        ageOfDiagnosis: "",
        currentAge: "",
      },
    ]);
  };

  const removeFamilyHistoryEntry = (id: number): void => {
    if (familyHistoryEntries.length > 1) {
      setFamilyHistoryEntries(familyHistoryEntries.filter((entry) => entry.id !== id));
    }
  };

  const updateFamilyHistoryEntry = (
    id: number,
    field: keyof FamilyHistoryEntry,
    value: string
  ): void => {
    setFamilyHistoryEntries(
      familyHistoryEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log("Family History Form submitted:", familyHistoryEntries);
    // Handle form submission logic here
  };

  return (
    <div className=" mx-auto p-6 ">
      <h1 className="text-2xl font-bold mb-6">Family History</h1>

      <form onSubmit={handleSubmit}>
        {familyHistoryEntries.map((entry, index) => (
          <div key={entry.id} className="mb-8 border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Family History Entry {index + 1}</h2>
              <div className="flex gap-2">
                {familyHistoryEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFamilyHistoryEntry(entry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
                {index === familyHistoryEntries.length - 1 && (
                  <button
                    type="button"
                    onClick={addFamilyHistoryEntry}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Another
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Relative */}
              <div>
                <label
                  htmlFor={`relative-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Relative
                </label>
                <input
                  type="text"
                  name={`relative-${entry.id}`}
                  value={entry.relative}
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateFamilyHistoryEntry(entry.id, "relative", e.target.value)
                  }
                  placeholder="Enter relative"
                />
              </div>

              {/* Conditions */}
              <div>
                <label
                  htmlFor={`conditions-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Conditions
                </label>
                <input
                  type="text"
                  name={`conditions-${entry.id}`}
                  value={entry.conditions}
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateFamilyHistoryEntry(entry.id, "conditions", e.target.value)
                  }
                  placeholder="Enter conditions"
                />
              </div>

              {/* Age of Diagnosis */}
              <div>
                <label
                  htmlFor={`ageOfDiagnosis-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Age of Diagnosis
                </label>
                <input
                  type="text"
                  name={`ageOfDiagnosis-${entry.id}`}
                  value={entry.ageOfDiagnosis}
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateFamilyHistoryEntry(entry.id, "ageOfDiagnosis", e.target.value)
                  }
                  placeholder="Enter age of diagnosis"
                />
              </div>

              {/* Current Age */}
              <div>
                <label
                  htmlFor={`currentAge-${entry.id}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Current Age
                </label>
                <input
                  type="text"
                  name={`currentAge-${entry.id}`}
                  value={entry.currentAge}
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateFamilyHistoryEntry(entry.id, "currentAge", e.target.value)
                  }
                  placeholder="Enter current age"
                />
              </div>
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