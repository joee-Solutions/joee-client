"use client";
import { useState } from "react";

const modules = [
  "Departments",
  "Employees",
  "Patients",
  "Appointments",
  "Medical notes",
  "Medical records",
  "Schdules",
  "Organizations",
  "Notifications",
];

const permissions = ["Read", "Edit", "Create", "Delete"];

export default function AccessControlPanel() {
  const [toggles, setToggles] = useState({
    disable: false,
    delete: false,
  });

  const [access, setAccess] = useState(() =>
    modules.reduce((acc, module) => {
      acc[module] = {
        Read: true,
        Edit: module === "Departments" || module === "Notifications",
        Create: false,
        Delete: false,
      };
      return acc;
    }, {} as Record<string, Record<string, boolean>>)
  );

  const toggleAccess = (module: string, permission: string) => {
    setAccess((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: !prev[module][permission],
      },
    }));
  };

  return (
    <div className="bg-white rounded-xl border  p-6 shadow-sm space-y-6">
      <h3 className="font-semibold text-base">Access Control</h3>
      <hr className="border-gray-300" />
  
      <div className="space-y-6">
      <div className="flex items-center justify-between">
  <span className="font-medium text-sm">Disable Organization Account</span>
  <div
    className={`flex items-center justify-center w-16 h-4 rounded-lg p-4 relative bg-gray-300`}
  >
    <div
      className={`flex items-center justify-center w-6 h-6 rounded-full absolute transition-all duration-300 ease-in-out cursor-pointer ${toggles.disable ? 'right-0 bg-blue-900' : 'left-0 bg-white'}`}
      onClick={() => setToggles((t) => ({ ...t, disable: !t.disable }))}
    ></div>
  </div>
</div>

<div className="flex items-center justify-between border-t pt-2 border-[#CCCCCC]">
  <span className="font-medium text-sm">Delete Organization Account</span>
  <div
    className={`flex items-center justify-center w-16 h-4 rounded-lg p-4 relative bg-gray-300`}
  >
    <div
      className={`flex items-center justify-center w-6 h-6 rounded-full absolute transition-all duration-300 ease-in-out cursor-pointer ${toggles.delete ? 'right-0 bg-blue-900' : 'left-0 bg-white'}`}
      onClick={() => setToggles((t) => ({ ...t, delete: !t.delete }))}
    ></div>
  </div>
</div>

      </div>

      <div className="border-t pt-2 border-[#CCCCCC]">
        <h4 className="font-medium text-sm my-4">Role Permission (Access)</h4>
        <div className="overflow-x-auto ">
          <table className="min-w-full text-left mt-3 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border"></th>
                {permissions.map((perm) => (
                  <th key={perm} className="px-4 py-2 border text-center text-sm font-medium">
                    {perm}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                  <td className="px-4 py-2 border text-sm font-medium">{mod}</td>
                  {permissions.map((perm) => (
                    <td key={perm} className="px-4 py-2 border text-center">
                      <input
                        type="checkbox"
                        checked={access[mod][perm] || false}
                        onChange={() => toggleAccess(mod, perm)}
                        className="accent-green-600 w-6 h-6 rounded"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  
      <div className="flex justify-between items-center gap-12 pt-6 px-8">
        <button className="border border-red-500 text-red-500 px-6 py-2 rounded-md hover:bg-red-50 text-sm font-medium flex items-center justify-center gap-2 w-full">
          <span>Cancel</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.99968 8.93301L9.93301 10.8663C10.0552 10.9886 10.2108 11.0497 10.3997 11.0497C10.5886 11.0497 10.7441 10.9886 10.8663 10.8663C10.9886 10.7441 11.0497 10.5886 11.0497 10.3997C11.0497 10.2108 10.9886 10.0552 10.8663 9.93301L8.93301 7.99967L10.8663 6.06634C10.9886 5.94412 11.0497 5.78856 11.0497 5.59967C11.0497 5.41079 10.9886 5.25523 10.8663 5.13301C10.7441 5.01079 10.5886 4.94967 10.3997 4.94967C10.2108 4.94967 10.0552 5.01079 9.93301 5.13301L7.99968 7.06634L6.06634 5.13301C5.94412 5.01079 5.78856 4.94967 5.59968 4.94967C5.41079 4.94967 5.25523 5.01079 5.13301 5.13301C5.01079 5.25523 4.94968 5.41079 4.94968 5.59967C4.94968 5.78856 5.01079 5.94412 5.13301 6.06634L7.06634 7.99967L5.13301 9.93301C5.01079 10.0552 4.94968 10.2108 4.94968 10.3997C4.94968 10.5886 5.01079 10.7441 5.13301 10.8663C5.25523 10.9886 5.41079 11.0497 5.59968 11.0497C5.78856 11.0497 5.94412 10.9886 6.06634 10.8663L7.99968 8.93301ZM7.99968 14.6663C7.07745 14.6663 6.21079 14.4912 5.39968 14.141C4.58856 13.7908 3.88301 13.3159 3.28301 12.7163C2.68301 12.1168 2.20812 11.4112 1.85834 10.5997C1.50856 9.78812 1.33345 8.92145 1.33301 7.99967C1.33256 7.0779 1.50768 6.21123 1.85834 5.39967C2.20901 4.58812 2.6839 3.88256 3.28301 3.28301C3.88212 2.68345 4.58768 2.20856 5.39968 1.85834C6.21168 1.50812 7.07834 1.33301 7.99968 1.33301C8.92101 1.33301 9.78767 1.50812 10.5997 1.85834C11.4117 2.20856 12.1172 2.68345 12.7163 3.28301C13.3155 3.88256 13.7906 4.58812 14.1417 5.39967C14.4928 6.21123 14.6677 7.0779 14.6663 7.99967C14.665 8.92145 14.4899 9.78812 14.141 10.5997C13.7921 11.4112 13.3172 12.1168 12.7163 12.7163C12.1155 13.3159 11.4099 13.791 10.5997 14.1417C9.78945 14.4923 8.92279 14.6672 7.99968 14.6663Z" fill="#D40808"/>
</svg>

        </button>
        <button className="bg-[#003465] hover:bg-[#00284e] text-white px-6 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 w-full">
          <span>Save Changes</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5 1.5C8.5 1.10218 8.65804 0.720644 8.93934 0.43934C9.22064 0.158035 9.60218 0 10 0L14 0C14.5304 0 15.0391 0.210714 15.4142 0.585786C15.7893 0.960859 16 1.46957 16 2V14C16 14.5304 15.7893 15.0391 15.4142 15.4142C15.0391 15.7893 14.5304 16 14 16H2C1.46957 16 0.960859 15.7893 0.585786 15.4142C0.210714 15.0391 0 14.5304 0 14V2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0L8 0C7.686 0.418 7.5 0.937 7.5 1.5V7.5H5.5C5.40098 7.49982 5.30414 7.52905 5.22175 7.58398C5.13936 7.63891 5.07513 7.71706 5.03722 7.80854C4.9993 7.90001 4.9894 8.00068 5.00876 8.09779C5.02813 8.1949 5.07589 8.28407 5.146 8.354L7.646 10.854C7.69245 10.9006 7.74762 10.9375 7.80837 10.9627C7.86911 10.9879 7.93423 11.0009 8 11.0009C8.06577 11.0009 8.13089 10.9879 8.19163 10.9627C8.25238 10.9375 8.30755 10.9006 8.354 10.854L10.854 8.354C10.9241 8.28407 10.9719 8.1949 10.9912 8.09779C11.0106 8.00068 11.0007 7.90001 10.9628 7.80854C10.9249 7.71706 10.8606 7.63891 10.7783 7.58398C10.6959 7.52905 10.599 7.49982 10.5 7.5H8.5V1.5Z" fill="white"/>
</svg>

        </button>
      </div>
    </div>
  );
  
}
