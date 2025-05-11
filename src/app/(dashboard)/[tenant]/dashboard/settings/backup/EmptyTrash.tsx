import BackupTable from "./BackupTable";

const tableColumnNames = [
  "Date Deleted",
  "File name",
  "Original location",
  "File size",
  "Item Type",
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

export default function EmptyTrash() {
  return (
    <BackupTable
      tableTitle="All Trash"
      tableColumnNames={tableColumnNames}
      tableRows={tableRows}
    />
  );
}
