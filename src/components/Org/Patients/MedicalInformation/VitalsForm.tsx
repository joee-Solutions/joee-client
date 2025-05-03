import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

// Define the type for a vital sign entry
type VitalSignEntry = {
  id: number;
  temperature: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  glucose: string;
  height: string;
  weight: string;
  bmi: string;
  painScore: string;
};

export default function VitalSignsForm() {
  const [vitalSignEntries, setVitalSignEntries] = useState<VitalSignEntry[]>([
    {
      id: 1,
      temperature: "",
      systolic: "",
      diastolic: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      glucose: "",
      height: "",
      weight: "",
      bmi: "",
      painScore: "",
    },
  ]);

  const addVitalSignEntry = (): void => {
    const newId =
      vitalSignEntries.length > 0
        ? Math.max(...vitalSignEntries.map((entry) => entry.id)) + 1
        : 1;

    setVitalSignEntries([
      ...vitalSignEntries,
      {
        id: newId,
        temperature: "",
        systolic: "",
        diastolic: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        glucose: "",
        height: "",
        weight: "",
        bmi: "",
        painScore: "",
      },
    ]);
  };

  const removeVitalSignEntry = (id: number): void => {
    if (vitalSignEntries.length > 1) {
      setVitalSignEntries(vitalSignEntries.filter((entry) => entry.id !== id));
    }
  };

  const updateVitalSignEntry = (
    id: number,
    field: keyof VitalSignEntry,
    value: string
  ): void => {
    setVitalSignEntries(
      vitalSignEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log("Vital Signs Form submitted:", vitalSignEntries);
  };

  return (
    <div className=" mx-auto p-6 bg-white ">
      <h1 className="text-2xl font-bold mb-6">Vital Signs</h1>

      <form onSubmit={handleSubmit}>
        {vitalSignEntries.map((entry, index) => (
          <div key={entry.id} className="mb-8 border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Vital Sign Entry {index + 1}</h2>
              <div className="flex gap-2">
                {vitalSignEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVitalSignEntry(entry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
                {index === vitalSignEntries.length - 1 && (
                  <button
                    type="button"
                    onClick={addVitalSignEntry}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Another
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`temperature-${entry.id}`}>
                  Temperature (°F/°C)
                </label>
                <Input
                  id={`temperature-${entry.id}`}
                  type="text"
                  placeholder="Temperature"
            className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.temperature}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "temperature", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`systolic-${entry.id}`}>
                  Systolic (mmHg)
                </label>
                <Input
                  id={`systolic-${entry.id}`}
                  type="text"
                  placeholder="Systolic"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.systolic}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "systolic", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`diastolic-${entry.id}`}>
                  Diastolic (mmHg)
                </label>
                <Input
                  id={`diastolic-${entry.id}`}
                  type="text"
                  placeholder="Diastolic"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.diastolic}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "diastolic", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`heartRate-${entry.id}`}>
                  Heart Rate (bpm)
                </label>
                <Input
                  id={`heartRate-${entry.id}`}
                  type="text"
                  placeholder="Heart Rate"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.heartRate}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "heartRate", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`respiratoryRate-${entry.id}`}>
                  Respiratory Rate (breaths/min)
                </label>
                <Input
                  id={`respiratoryRate-${entry.id}`}
                  type="text"
                  placeholder="Respiratory Rate"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.respiratoryRate}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "respiratoryRate", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`oxygenSaturation-${entry.id}`}>
                  Oxygen Saturation (%)
                </label>
                <Input
                  id={`oxygenSaturation-${entry.id}`}
                  type="text"
                  placeholder="Oxygen Saturation"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.oxygenSaturation}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "oxygenSaturation", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`glucose-${entry.id}`}>
                  Glucose
                </label>
                <Input
                  id={`glucose-${entry.id}`}
                  type="text"
                  placeholder="Glucose"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.glucose}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "glucose", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`height-${entry.id}`}>
                  Height (cm/in)
                </label>
                <Input
                  id={`height-${entry.id}`}
                  type="text"
                  placeholder="Height"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.height}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "height", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`weight-${entry.id}`}>
                  Weight (kg/lbs)
                </label>
                <Input
                  id={`weight-${entry.id}`}
                  type="text"
                  placeholder="Weight"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  value={entry.weight}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "weight", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`bmi-${entry.id}`}>
                  BMI
                </label>
                <Input
                  id={`bmi-${entry.id}`}
                  type="text"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  placeholder="BMI"
                  value={entry.bmi}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2" htmlFor={`painScore-${entry.id}`}>
                  Pain Score (0-10)
                </label>
                <Input
                  id={`painScore-${entry.id}`}
                  type="text"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  placeholder="Pain Score"
                  value={entry.painScore}
                  onChange={(e) =>
                    updateVitalSignEntry(entry.id, "painScore", e.target.value)
                  }
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