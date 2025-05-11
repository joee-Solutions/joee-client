import { Button } from "@/components/ui/button";
import { useState } from "react";
import BackupTable from "./BackupTable";

const tableColumnNames = [
  "Date",
  "File name",
  "Backup Completion Time",
  "File size",
  "Status",
  "Actions",
];

const tableRows = [
  {
    date: "17/01/2023",
    fileName: "Oncology",
    backupTime: "17/01/2023 - 13:45 PM",
    fileSize: "207.12 MB",
    status: "Successful",
  },
  {
    date: "18/12/2022",
    fileName: "Opthamology",
    backupTime: "118/12/2022 - 11:45 AM",
    fileSize: "210.45 MB",
    status: "Successful",
  },
  {
    date: "26/11/2022",
    fileName: "Nephrology",
    backupTime: "26/11/2022 - 11:45 AM",
    fileSize: "210.45 MB",
    status: "Failed",
  },
  {
    date: "12/01/2023",
    fileName: "Gynaecology",
    backupTime: "12/01/2023 - 12:34 PM",
    fileSize: "324.67 MB",
    status: "Successful",
  },
  {
    date: "18/12/2022",
    fileName: "Cardiology",
    backupTime: "18/12/2022 - 14:28 PM",
    fileSize: "210.45 MB",
    status: "Successful",
  },
  {
    date: "26/11/2022",
    fileName: "Radiology",
    backupTime: "26/11/2022 - 10:45 AM",
    fileSize: "324.67 MB",
    status: "Failed",
  },
];

const tabBtns = [
  {
    currTab: 1,
    label: "Departments",
  },
  {
    currTab: 2,
    label: "Employees",
  },
  {
    currTab: 3,
    label: "Patients",
  },
  {
    currTab: 4,
    label: "Appointments",
  },
  {
    currTab: 5,
    label: "Schedule",
  },
  {
    currTab: 6,
    label: "Medical records",
  },
  {
    currTab: 7,
    label: "Medical records",
  },
];

export default function RecentBackup() {
  const [currTab, setCurrTab] = useState({
    currTab: 1,
    label: "Departments",
  });

  return (
    <div>
      <h2 className="font-bold text-base text-black my-7">Recent Backup</h2>
      <div className="flex gap-4 border-b border-[#D9D9D9]">
        {tabBtns.map((tab) => (
          <Button
            key={tab.currTab}
            type="button"
            onClick={() => setCurrTab(tab)}
            className={`text-base font-medium text-black border-b-4 ${
              currTab.currTab === tab.currTab
                ? "border-[#003465]"
                : "border-transparent"
            } rounded-none pb-[10px]`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div>
        <BackupTable
          tableTitle={currTab.label}
          tableColumnNames={tableColumnNames}
          tableRows={tableRows}
        />
      </div>
    </div>
  );
}
