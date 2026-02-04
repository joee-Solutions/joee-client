"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronRight, Ellipsis, Plus, Search, Edit, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EmployeeCard = {
  id: number;
  name: string;
  role: string;
  description: string;
  picture: string;
  rgbColorCode: string;
};

type EmployeeDTO = {
  id: number;
  profilePicture: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  designation: string;
  status: string;
};

// Helper function to map API user data to EmployeeDTO
const mapUserToEmployeeDTO = (user: any, index: number): EmployeeDTO => {
  const firstName = user.first_name || user.firstName || user.name?.split(" ")[0] || "";
  const lastName = user.last_name || user.lastName || user.name?.split(" ").slice(1).join(" ") || "";
  const departmentName = user.department?.name || user.department_name || user.department || "N/A";
  const designation = user.role || user.designation || user.job_title || "Employee";
  
  // Determine status - check various possible fields
  let status = "Active";
  if (user.status) {
    status = typeof user.status === "string" ? user.status : (user.status ? "Active" : "Inactive");
  } else if (user.is_active !== undefined) {
    status = user.is_active ? "Active" : "Inactive";
  } else if (user.active !== undefined) {
    status = user.active ? "Active" : "Inactive";
  }
  
  const profilePicture = user.profile_picture || user.profilePicture || "/assets/imagePlaceholder.png";

  return {
    id: user.id || user._id || index + 1,
    profilePicture,
    firstName,
    lastName,
    departmentName,
    designation: Array.isArray(designation) ? designation[0] : String(designation),
    status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
  };
};

// Helper function to map API user data to EmployeeCard
const mapUserToEmployeeCard = (user: any, index: number): EmployeeCard => {
  const firstName = user.first_name || user.firstName || user.name?.split(" ")[0] || "";
  const lastName = user.last_name || user.lastName || user.name?.split(" ").slice(1).join(" ") || "";
  const name = `${firstName} ${lastName}`.trim() || user.username || user.email || "Employee";
  const role = user.role || user.designation || user.job_title || "Employee";
  const roleStr = Array.isArray(role) ? role[0] : role;
  
  // Color codes for different roles
  const colorMap: Record<string, string> = {
    doctor: "0, 52, 101",
    nurse: "63, 169, 7",
    "lab attendant": "236, 9, 9",
    default: "225, 195, 0",
  };
  const rgbColorCode = colorMap[roleStr.toLowerCase()] || colorMap.default;
  const picture = user.profile_picture || user.profilePicture || "/assets/doctorFemale.png";

  return {
    id: user.id || user._id || index + 1,
    name,
    role: roleStr,
    description: name, // Use employee name as description
    picture,
    rgbColorCode,
  };
};

// Create columns function that accepts handlers
const createColumns = (
  onEdit: (employee: EmployeeDTO) => void,
  onDelete: (employee: EmployeeDTO) => void
): Column<EmployeeDTO>[] => [
  {
    header: "S/N",
    render(row, index = 0) {
      return (
        <p className="font-semibold text-xs text-[#737373]">
          {(index ?? 0) + 1}
        </p>
      );
    },
  },
  {
    header: "Employee Name",
    render(row) {
      return (
        <div className="flex items-center gap-[10px]">
          <span className="w-[42px] h-[42px] rounded-full overflow-hidden">
            <Image
              src={row.profilePicture}
              alt="employee image"
              width={42}
              height={42}
              className="object-cover aspect-square w-full h-full rounded-full"
            />
          </span>
          <p className="font-medium text-xs text-black">
            {row.firstName} {row.lastName}
          </p>
        </div>
      );
    },
  },
  {
    header: "Department Name",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">
          {row.departmentName}
        </p>
      );
    },
  },
  {
    header: "Title",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">
          {row.designation}
        </p>
      );
    },
  },
  {
    header: "Status",
    render(row) {
      return (
        <p
          className={`font-semibold text-xs ${
            row.status.toLowerCase() === "active"
              ? "text-[#3FA907]"
              : "text-[#EC0909]"
          }`}
        >
          {row.status}
        </p>
      );
    },
  },
  {
    header: "Actions",
    render(row) {
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button 
              type="button"
              className="flex items-center justify-center px-2 py-1 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6] hover:bg-[#D9DDE5] transition-colors relative z-10"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="text-black size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg z-[100]">
            <DropdownMenuItem
              onClick={() => onEdit(row)}
              className="cursor-pointer flex items-center gap-2"
            >
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function EmployeePage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [employeeCards, setEmployeeCards] = useState<EmployeeCard[]>([]);
  const [employeesTableData, setEmployeesTableData] = useState<EmployeeDTO[]>([]);
  const [fullEmployeeData, setFullEmployeeData] = useState<any[]>([]); // Store full API response data
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<EmployeeDTO & {
    email?: string;
    phoneNumber?: string;
    address?: string;
    state?: string;
    dob?: string;
    specialty?: string;
    gender?: string;
    hireDate?: string;
    bio?: string;
    employeeImage?: string;
  }>>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  // Ensure body scroll is restored when modals close
  useEffect(() => {
    if (!isEditModalOpen && !isDeleteModalOpen && !isViewModalOpen) {
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        const overlays = document.querySelectorAll('[data-radix-portal]');
        overlays.forEach((overlay) => {
          const element = overlay as HTMLElement;
          if (element.style.pointerEvents === 'none' || element.getAttribute('data-state') === 'closed') {
            element.style.pointerEvents = '';
          }
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isEditModalOpen, isDeleteModalOpen, isViewModalOpen]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await processRequestAuth("get", API_ENDPOINTS.GET_EMPLOYEE);
      
      // Handle different response structures
      const users = Array.isArray(response?.data) 
        ? response.data 
        : Array.isArray(response) 
        ? response 
        : [];

      if (users.length > 0) {
        // Store full user data for edit modal
        setFullEmployeeData(users);
        
        // Map to employee cards (show first 4 for cards)
        const cards = users.slice(0, 4).map(mapUserToEmployeeCard);
        setEmployeeCards(cards);

        // Map to table data
        const tableData = users.map(mapUserToEmployeeDTO);
        setEmployeesTableData(tableData);
      } else {
        setEmployeeCards([]);
        setEmployeesTableData([]);
        setFullEmployeeData([]);
      }
    } catch (error: any) {
      console.error("Failed to load employees:", error);
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        toast.error("Access denied. Please check your permissions or contact your administrator.", {
          toastId: "employees-403-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "employees-401-error",
          autoClose: 5000,
        });
      } else {
        toast.error("Failed to load employees data", { toastId: "employees-load-error" });
      }
      
      setEmployeeCards([]);
      setEmployeesTableData([]);
      setFullEmployeeData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  // Filter employees based on search
  const filteredEmployees = employeesTableData.filter((emp) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(searchLower) ||
      emp.lastName.toLowerCase().includes(searchLower) ||
      emp.departmentName.toLowerCase().includes(searchLower) ||
      emp.designation.toLowerCase().includes(searchLower)
    );
  });

  // Get full employee data from API response
  const getFullEmployeeData = (employee: EmployeeDTO) => {
    return fullEmployeeData.find(user => {
      const userId = user.id || user._id;
      return userId === employee.id || 
             `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() === 
             `${employee.firstName} ${employee.lastName}`.trim();
    });
  };

  // Handle view (opens view modal, which can then open edit)
  const handleView = (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    const fullData = getFullEmployeeData(employee);
    
    // Load full employee data for view/edit
    setEditFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      designation: employee.designation,
      departmentName: employee.departmentName,
      status: employee.status,
      // Use actual data from API if available
      email: fullData?.email || fullData?.email_address || '',
      phoneNumber: fullData?.phone_number || fullData?.phone || fullData?.phoneNumber || '',
      address: fullData?.address || '',
      state: fullData?.state || fullData?.region_state || '',
      dob: fullData?.dob || fullData?.date_of_birth || fullData?.dateOfBirth || '',
      specialty: fullData?.specialty || '',
      gender: fullData?.gender || '',
      hireDate: fullData?.hire_date || fullData?.hireDate || '',
      bio: fullData?.bio || fullData?.biography || fullData?.short_biography || '',
    });
    setIsViewModalOpen(true);
  };

  // Handle edit (opens edit modal directly)
  const handleEdit = (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    const fullData = getFullEmployeeData(employee);
    
    setEditFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      designation: employee.designation,
      departmentName: employee.departmentName,
      status: employee.status,
      // Use actual data from API if available
      email: fullData?.email || fullData?.email_address || '',
      phoneNumber: fullData?.phone_number || fullData?.phone || fullData?.phoneNumber || '',
      address: fullData?.address || '',
      state: fullData?.state || fullData?.region_state || '',
      dob: fullData?.dob || fullData?.date_of_birth || fullData?.dateOfBirth || '',
      specialty: fullData?.specialty || '',
      gender: fullData?.gender || '',
      hireDate: fullData?.hire_date || fullData?.hireDate || '',
      bio: fullData?.bio || fullData?.biography || fullData?.short_biography || '',
    });
    setIsEditModalOpen(true);
  };

  // Open edit from view modal
  const handleEditFromView = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    
    try {
      // TODO: Replace with actual delete API endpoint when available
      // await processRequestAuth("delete", `${API_ENDPOINTS.GET_EMPLOYEE}/${selectedEmployee.id}`);
      
      // Remove from local state for now
      setEmployeesTableData((prev) => prev.filter((emp) => emp.id !== selectedEmployee.id));
      setEmployeeCards((prev) => prev.filter((card) => card.id !== selectedEmployee.id));
      
      toast.success("Employee deleted successfully", { toastId: "employee-delete-success" });
      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      console.error("Failed to delete employee:", error);
      toast.error("Failed to delete employee", { toastId: "employee-delete-error" });
    }
  };

  // Handle edit save
  const handleEditSave = async (updatedData: Partial<EmployeeDTO>) => {
    if (!selectedEmployee) return;
    
    try {
      // TODO: Replace with actual update API endpoint when available
      // await processRequestAuth("put", `${API_ENDPOINTS.GET_EMPLOYEE}/${selectedEmployee.id}`, updatedData);
      
      // Update local state for now
      setEmployeesTableData((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, ...updatedData } : emp
        )
      );
      
      // Also update employee cards if the edited employee is in the cards
      setEmployeeCards((prev) =>
        prev.map((card) =>
          card.id === selectedEmployee.id
            ? {
                ...card,
                name: `${updatedData.firstName || selectedEmployee.firstName} ${updatedData.lastName || selectedEmployee.lastName}`.trim(),
                role: updatedData.designation || card.role,
              }
            : card
        )
      );
      
      toast.success("Employee updated successfully", { toastId: "employee-update-success" });
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
      setEditFormData({});
    } catch (error: any) {
      console.error("Failed to update employee:", error);
      toast.error("Failed to update employee", { toastId: "employee-update-error" });
    }
  };

  // Create columns with handlers
  const columns = createColumns(handleEdit, handleDelete);

  return (
    <section>
      <SectionHeader
        title="Employees"
        description="Employees are the foundation for ensuring good health"
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-[19px]">
          {employeeCards.map((empCard) => (
            <div
              key={empCard.id}
              className="rounded-[10px] shadow-[0px_4px_4px_0px_#00000040] bg-white flex flex-col overflow-hidden"
            >
              <div
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(${empCard.rgbColorCode},.8)), url('/assets/sectionHeaderBG.png')`,
                }}
                className={`h-[87.2px] bg-cover bg-no-repeat`}
              ></div>
              <div className="pb-5 flex flex-col items-center px-5">
                <div
                  style={{
                    borderWidth: "3px",
                    borderColor: `rgb(${empCard.rgbColorCode})`,
                  }}
                  className="size-[80px] -mt-10 rounded-full mb-[10px] flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={empCard.picture}
                    width={80}
                    height={80}
                    alt={`${empCard.name} photo`}
                  />
                </div>
                <h3 className="font-medium text-sm text-black">
                  {empCard.name}
                </h3>
                <p
                  style={{ color: `rgb(${empCard.rgbColorCode})` }}
                  className="font-medium text-xs text-center mt-2"
                >
                  {empCard.role}
                </p>
                <p className="font-normal text-[10px] my-2 text-center text-[#999999]">
                  {empCard.description}
                </p>
                <button
                  onClick={() => {
                    // Find employee by ID first, then by name
                    const employee = employeesTableData.find(emp => 
                      emp.id === empCard.id || 
                      `${emp.firstName} ${emp.lastName}`.trim() === empCard.name
                    );
                    if (employee) {
                      handleView(employee);
                    } else {
                      console.warn('Employee not found for card:', empCard);
                    }
                  }}
                  className="rounded-[4px] px-5 py-1 text-white font-medium text-xs bg-[#003465] hover:bg-[#003465]/90"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
        <section className="mt-10 shadow-[0px_0px_4px_1px_#0000004D] relative z-0">
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px]">
            <div className="px-[27px]">
              <h2 className="font-semibold text-xl text-black">
                Employee List
              </h2>
            </div>
          </header>
          <div className="px-[27px] pb-[35px]">
            <div className="py-[30px] flex justify-between gap-10">
              <ListView pageSize={pageSize} setPageSize={setPageSize} />
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search data..."
                  className="py-[10px] px-5 pr-11 rounded-[30px] min-w-[318px] bg-[#E6EBF0] w-full font-medium text-sm text-[#4F504F] border-[0.2px] border-[#F9F9F9] outline-none"
                />
                <Search className="size-5 text-[#999999] absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <p className="text-lg">Loading employees...</p>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <DataTable columns={columns} data={filteredEmployees} />
            ) : (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <p className="text-lg">No employees found</p>
              </div>
            )}
          </div>
          {filteredEmployees.length > 0 && (
            <Pagination
              dataLength={filteredEmployees.length}
              numOfPages={Math.ceil(filteredEmployees.length / pageSize)}
              pageSize={pageSize}
              handlePageClick={handlePageClick}
            />
          )}
        </section>
        <Link
          href="/dashboard/employees/create"
          className="flex justify-center items-center font-normal text-base text-white bg-[#003465] hover:bg-[#003465]/90 w-[306px] h-[60px] mt-7 self-end"
        >
          Create Employees <Plus size={24} />
        </Link>
      </div>

      {/* View Modal */}
      <AlertDialog 
        open={isViewModalOpen} 
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedEmployee(null);
              setEditFormData({});
            }, 150);
          }
        }}
      >
        <AlertDialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto !z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-black">
              Employee Details
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#737373] pt-2">
              View employee information for{" "}
              <span className="font-semibold">
                {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">First Name</label>
                <p className="text-sm text-[#737373]">{selectedEmployee?.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Last Name</label>
                <p className="text-sm text-[#737373]">{selectedEmployee?.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <p className="text-sm text-[#737373]">{editFormData.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                <p className="text-sm text-[#737373]">{editFormData.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Designation</label>
                <p className="text-sm text-[#737373]">{selectedEmployee?.designation || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Department</label>
                <p className="text-sm text-[#737373]">{selectedEmployee?.departmentName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Status</label>
                <p className={`text-sm font-semibold ${selectedEmployee?.status?.toLowerCase() === 'active' ? 'text-[#3FA907]' : 'text-[#EC0909]'}`}>
                  {selectedEmployee?.status || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsViewModalOpen(false)}
              className="border border-[#D9D9D9] text-[#737373] hover:bg-gray-50"
            >
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEditFromView}
              className="bg-[#003465] hover:bg-[#002147] text-white"
            >
              Edit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <AlertDialog 
        open={isEditModalOpen} 
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedEmployee(null);
              setEditFormData({});
            }, 150);
          }
        }}
      >
        <AlertDialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto !z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-black">
              Edit Employee
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#737373] pt-2">
              Update employee information for{" "}
              <span className="font-semibold">
                {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">First Name</label>
                <input
                  type="text"
                  value={editFormData.firstName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Last Name</label>
                <input
                  type="text"
                  value={editFormData.lastName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phoneNumber || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Address</label>
                <input
                  type="text"
                  value={editFormData.address || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Region/State</label>
                <input
                  type="text"
                  value={editFormData.state || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editFormData.dob || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Specialty</label>
                <input
                  type="text"
                  value={editFormData.specialty || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Designation</label>
                <input
                  type="text"
                  value={editFormData.designation || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.departmentName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Gender</label>
                <select
                  value={editFormData.gender || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Hire Date</label>
                <input
                  type="date"
                  value={editFormData.hireDate || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, hireDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Status</label>
                <select
                  value={editFormData.status || "Active"}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Short Biography</label>
              <textarea
                value={editFormData.bio || ""}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                placeholder="Enter biography..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsEditModalOpen(false);
              }}
              className="border border-[#D9D9D9] text-[#737373] hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleEditSave(editFormData);
              }}
              className="bg-[#003465] hover:bg-[#002147] text-white"
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Warning Modal */}
      <AlertDialog 
        open={isDeleteModalOpen} 
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedEmployee(null);
            }, 150);
          }
        }}
      >
        <AlertDialogContent className="bg-white max-w-md !z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-black">
              Delete Employee
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#737373] pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-black">
                {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsDeleteModalOpen(false)}
              className="border border-[#D9D9D9] text-[#737373] hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#EC0909] hover:bg-[#D40808] text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
