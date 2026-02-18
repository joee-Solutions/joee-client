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
import { useState, useEffect, useRef } from "react";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FieldBox from "@/components/shared/form/FieldBox";
import FieldFileInput from "@/components/shared/form/FieldFileInput";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import FormComposer from "@/components/shared/form/FormComposer";
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
  const firstName = user.first_name || user.firstName || user.firstname || user.name?.split(" ")[0] || "";
  const lastName = user.last_name || user.lastName || user.lastname || user.name?.split(" ").slice(1).join(" ") || "";
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
  const firstName = user.first_name || user.firstName || user.firstname || user.name?.split(" ")[0] || "";
  const lastName = user.last_name || user.lastName || user.lastname || user.name?.split(" ").slice(1).join(" ") || "";
  const name = `${firstName} ${lastName}`.trim() || user.username || "Employee";
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
    description: name, // Use employee name (first and last) as description
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
  const [showForm, setShowForm] = useState(false);
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
    is_active?: boolean;
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

  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };

  // Fetch employee details from API
  const fetchEmployeeDetails = async (employeeId: number | string) => {
    try {
      const response = await processRequestAuth("get", `/tenant/user/${employeeId}`);
      // Handle response structure - could be direct object or wrapped in data
      const employeeData = response?.data || response;
      console.log("Fetched employee details:", employeeData);
      return employeeData;
    } catch (error: any) {
      console.error("Failed to fetch employee details:", error);
      throw error;
    }
  };

  // Handle view (opens view modal and fetches employee details from API)
  const handleView = async (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
    
    try {
      // Fetch employee details from API
      const employeeDetails = await fetchEmployeeDetails(employee.id);
      
      // Map API response to form data format with comprehensive field mapping
      const mappedData = {
        firstName: employeeDetails?.firstname || employeeDetails?.first_name || employeeDetails?.firstName || employee?.firstName || '',
        lastName: employeeDetails?.lastname || employeeDetails?.last_name || employeeDetails?.lastName || employee?.lastName || '',
        designation: employeeDetails?.designation || employeeDetails?.title || employee?.designation || '',
        departmentName: employeeDetails?.department?.name || employeeDetails?.department?.departmentName || employeeDetails?.department_name || employeeDetails?.departmentName || employee?.departmentName || '',
        status: employeeDetails?.status || (employeeDetails?.is_active !== undefined ? (employeeDetails.is_active ? 'Active' : 'Inactive') : (employeeDetails?.isActive !== undefined ? (employeeDetails.isActive ? 'Active' : 'Inactive') : (employee?.status || 'Active'))),
        email: employeeDetails?.email || employeeDetails?.email_address || '',
        phoneNumber: employeeDetails?.phone_number || employeeDetails?.phone || employeeDetails?.phoneNumber || '',
        address: employeeDetails?.address || employeeDetails?.street_address || '',
        state: employeeDetails?.state || employeeDetails?.region_state || employeeDetails?.region || '',
        dob: employeeDetails?.date_of_birth || employeeDetails?.dob || employeeDetails?.dateOfBirth || employeeDetails?.birth_date || '',
        specialty: employeeDetails?.specialty || employeeDetails?.specialization || '',
        gender: employeeDetails?.gender || employeeDetails?.sex || '',
        hireDate: employeeDetails?.hire_date || employeeDetails?.hireDate || employeeDetails?.date_hired || '',
        bio: employeeDetails?.bio || employeeDetails?.biography || employeeDetails?.short_biography || employeeDetails?.description || '',
        employeeImage: employeeDetails?.profile_picture || employeeDetails?.profilePicture || employeeDetails?.image || employeeDetails?.avatar || '',
      };
      
      setEditFormData(mappedData);
    } catch (error: any) {
      console.error("Failed to load employee details:", error);
      // Fallback to existing data if API fails
      const fullData = getFullEmployeeData(employee);
      setEditFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        designation: employee.designation || '',
        departmentName: employee.departmentName || '',
        status: employee.status || 'Active',
        email: fullData?.email || fullData?.email_address || '',
        phoneNumber: fullData?.phone_number || fullData?.phone || fullData?.phoneNumber || '',
        address: fullData?.address || fullData?.street_address || '',
        state: fullData?.state || fullData?.region_state || fullData?.region || '',
        dob: fullData?.dob || fullData?.date_of_birth || fullData?.dateOfBirth || fullData?.birth_date || '',
        specialty: fullData?.specialty || fullData?.specialization || '',
        gender: fullData?.gender || fullData?.sex || '',
        hireDate: fullData?.hire_date || fullData?.hireDate || fullData?.date_hired || '',
        bio: fullData?.bio || fullData?.biography || fullData?.short_biography || fullData?.description || '',
      });
    }
  };

  // Handle edit (uses employee data from the already-loaded list)
  const handleEdit = (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
    
    // Get data from the already-loaded employee list
    const employeeData = getFullEmployeeData(employee);
    console.log("Employee data from list:", employeeData);
    
    // Map employee data to form data format with comprehensive field mapping
    const mappedData = {
      firstName: employeeData?.firstname || employeeData?.first_name || employeeData?.firstName || employee?.firstName || '',
      lastName: employeeData?.lastname || employeeData?.last_name || employeeData?.lastName || employee?.lastName || '',
      designation: employeeData?.designation || employeeData?.title || employeeData?.role || employee?.designation || '',
      departmentName: employeeData?.department?.name || employeeData?.department?.departmentName || employeeData?.department_name || employeeData?.departmentName || employeeData?.department || employee?.departmentName || '',
      department: employeeData?.department?.id || employeeData?.department_id || employeeData?.departmentId || '',
      is_active: employeeData?.is_active !== undefined 
        ? employeeData.is_active 
        : (employeeData?.isActive !== undefined 
          ? employeeData.isActive 
          : (employeeData?.status !== undefined
            ? (typeof employeeData.status === 'string' 
              ? employeeData.status.toLowerCase() === 'active' 
              : employeeData.status)
            : true)),
      email: employeeData?.email || employeeData?.email_address || '',
      phoneNumber: employeeData?.phone_number || employeeData?.phone || employeeData?.phoneNumber || '',
      address: employeeData?.address || employeeData?.street_address || '',
      state: employeeData?.state || employeeData?.region_state || employeeData?.region || '',
      dob: formatDateForInput(employeeData?.date_of_birth || employeeData?.dob || employeeData?.dateOfBirth || employeeData?.birth_date),
      specialty: employeeData?.specialty || employeeData?.specialization || '',
      gender: employeeData?.gender || employeeData?.sex || '',
      hireDate: formatDateForInput(employeeData?.hire_date || employeeData?.hireDate || employeeData?.date_hired),
      bio: employeeData?.bio || employeeData?.biography || employeeData?.short_biography || employeeData?.description || '',
      employeeImage: employeeData?.profile_picture || employeeData?.profilePicture || employeeData?.image || employeeData?.avatar || '',
    };
    
    console.log("Mapped employee data for edit:", mappedData);
    setEditFormData(mappedData);
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
  const handleEditSave = async (updatedData: Partial<EmployeeDTO & {
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
    is_active?: boolean;
  }>) => {
    if (!selectedEmployee) return;
    
    try {
      console.log("Edit form data being saved:", updatedData);
      
      // Transform data to match API expected format (lowercase field names)
      const transformedData: any = {};
      
      if (updatedData.firstName) transformedData.firstname = updatedData.firstName;
      if (updatedData.lastName) transformedData.lastname = updatedData.lastName;
      if (updatedData.email) transformedData.email = updatedData.email;
      if (updatedData.phoneNumber) transformedData.phone_number = updatedData.phoneNumber;
      if (updatedData.address) transformedData.address = updatedData.address;
      if (updatedData.state) transformedData.state = updatedData.state;
      if (updatedData.dob) transformedData.date_of_birth = updatedData.dob;
      if (updatedData.specialty !== undefined) transformedData.specialty = updatedData.specialty || "";
      if (updatedData.designation) transformedData.designation = updatedData.designation;
      if (updatedData.gender) transformedData.gender = updatedData.gender;
      if (updatedData.hireDate) transformedData.hire_date = updatedData.hireDate;
      if (updatedData.bio !== undefined) transformedData.bio = updatedData.bio || "";
      
      // Handle status - send only status as string ("active" or "inactive")
      // Use the form value if set, otherwise use the current employee's status
      const isActiveValue = updatedData.is_active !== undefined 
        ? updatedData.is_active 
        : (selectedEmployee?.status?.toLowerCase() === 'active');
      
      // Only send status as string, not is_active
      transformedData.status = isActiveValue ? "active" : "inactive";
      console.log("Setting status to:", transformedData.status, "(from form is_active:", updatedData.is_active, ", employee status:", selectedEmployee?.status, ")");
      
      console.log("Transformed data being sent to API:", transformedData);
      
      // Use PATCH method with /tenant/user/{id} endpoint
      // Handle file upload if employeeImage is a File (not a string URL)
      let fileToUpload: File | undefined = undefined;
      if (updatedData.employeeImage && typeof updatedData.employeeImage !== 'string') {
        // If it's not a string, it might be a File
        try {
          const img = updatedData.employeeImage as any;
          if (img && img.constructor && img.constructor.name === 'File') {
            fileToUpload = img as File;
          }
        } catch (e) {
          // Not a File, ignore
        }
      }
      
      await processRequestAuth(
        "patch",
        `/tenant/user/${selectedEmployee.id}`,
        transformedData,
        undefined,
        fileToUpload
      );
      
      toast.success("Employee updated successfully", { toastId: "employee-update-success" });
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
      setEditFormData({});
      
      // Reload employees to get updated data
      await loadEmployees();
    } catch (error: any) {
      console.error("Failed to update employee:", error);
      if (error?.response?.status === 403) {
        toast.error("Access denied. Please check your permissions.", {
          toastId: "employee-update-403-error",
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "employee-update-401-error",
        });
      } else if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid employee data";
        toast.error(errorMessage, { toastId: "employee-update-400-error" });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to update employee";
        toast.error(errorMessage, { toastId: "employee-update-error" });
      }
    }
  };

  // Employee form schema
  const EmployeeSchema = z.object({
    firstName: z.string({ required_error: "This field is required" }),
    lastName: z.string({ required_error: "This field is required" }),
    email: z
      .string({ required_error: "This field is required" })
      .email("Invalid email address"),
    phoneNumber: z.string({ required_error: "This field is required" }),
    address: z.string({ required_error: "This field is required" }),
    state: z.string({ required_error: "This field is required" }),
    dob: z.string({ required_error: "This field is required" }),
    specialty: z.string().optional(),
    designation: z.string({ required_error: "This field is required" }),
    department: z.string({ required_error: "This field is required" }),
    gender: z.string({ required_error: "This field is required" }),
    employeeImage: z
      .instanceof(File)
      .optional()
      .refine((f) => !f || ["image/png", "image/jpeg", "image/jpg"].includes(f.type), {
        message: "Unsupported image file",
      }),
    hireDate: z.string({ required_error: "This field is required" }),
    bio: z.string().optional(),
  });

  type EmployeeSchemaType = z.infer<typeof EmployeeSchema>;

  const [imagePreviewer, setImagePreviewer] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeForm = useForm<EmployeeSchemaType>({
    resolver: zodResolver(EmployeeSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      designation: "",
      department: "",
      state: "",
      phoneNumber: "",
      gender: "",
      dob: "",
      employeeImage: undefined,
      bio: "",
      hireDate: "",
      specialty: "",
    },
  });

  // Handle create employee form submission
  const handleCreateEmployee = async (data: EmployeeSchemaType) => {
    setIsSubmitting(true);
    try {
      // Extract department ID from department string
      const departmentId = data.department; // This should be the department ID
      
      // Prepare data object (excluding the file)
      const { employeeImage, ...employeeData } = data;
      
      // Transform data to match API expected format (lowercase field names)
      const transformedData = {
        firstname: employeeData.firstName,
        lastname: employeeData.lastName,
        email: employeeData.email,
        phone_number: employeeData.phoneNumber,
        address: employeeData.address,
        state: employeeData.state,
        date_of_birth: employeeData.dob,
        specialty: employeeData.specialty || "",
        designation: employeeData.designation,
        gender: employeeData.gender,
        hire_date: employeeData.hireDate,
        bio: employeeData.bio || "",
      };
      
      // Use the API endpoint /tenant/employee/{departmentId}
      // Pass the file separately if it exists
      const fileToUpload = employeeImage instanceof File ? employeeImage : undefined;
      
      await processRequestAuth(
        "post", 
        `${API_ENDPOINTS.GET_EMPLOYEE}/${departmentId}`, 
        transformedData, 
        undefined, 
        fileToUpload
      );
      
      toast.success("Employee created successfully", { toastId: "employee-create-success" });
      setShowForm(false);
      employeeForm.reset();
      await loadEmployees(); // Reload employees list
    } catch (error: any) {
      console.error("Failed to create employee:", error);
      if (error?.response?.status === 403) {
        toast.error("Access denied. Please check your permissions.", {
          toastId: "employee-create-403-error",
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "employee-create-401-error",
        });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to create employee";
        toast.error(errorMessage, { toastId: "employee-create-error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    employeeForm.reset();
  };

  const handleCreateEmployeeClick = () => {
    setShowForm(true);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Load departments for the dropdown
  const [departments, setDepartments] = useState<any[]>([]);
  
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await processRequestAuth("get", API_ENDPOINTS.GET_DEPARTMENTS);
        const depts = Array.isArray(response?.data) 
          ? response.data 
          : Array.isArray(response) 
          ? response 
          : [];
        setDepartments(depts);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    };
    loadDepartments();
  }, []);

  // Create columns with handlers
  const columns = createColumns(handleEdit, handleDelete);

  return (
    <section>
      <SectionHeader
        title="Employees"
        description="Employees are the foundation for ensuring good health"
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        {/* Employee Cards */}
        {!showForm && (
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-[19px] mb-10">
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
        )}
        
        {showForm ? (
        <section className="mt-10 shadow-[0px_0px_4px_1px_#0000004D]">
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px]">
            <div className="px-[27px]">
                <h2 className="font-semibold text-xl text-black">Add Employee</h2>
              </div>
              <div className="px-[27px]">
                <Button
                  onClick={handleFormCancel}
                  className="px-4 py-2 bg-[#003465] text-white rounded hover:bg-[#003465]/90 font-medium"
                >
                  Employee List
                </Button>
              </div>
            </header>
            <div className="px-[27px] pb-[35px]">
              <FormComposer form={employeeForm} onSubmit={handleCreateEmployee}>
                <div className="flex flex-col gap-[30px] pt-[33px]">
                  <div className="grid sm:grid-cols-2 gap-[18px]">
                    <FieldBox
                      control={employeeForm.control}
                      labelText="First name"
                      name="firstName"
                      type="text"
                      placeholder="Enter here"
                    />
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Last name"
                      name="lastName"
                      type="text"
                      placeholder="Enter here"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-[18px]">
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Email"
                      name="email"
                      type="text"
                      placeholder="Enter here"
                    />
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Phone number"
                      name="phoneNumber"
                      type="text"
                      placeholder="Enter here"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-[18px]">
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Address"
                      name="address"
                      type="text"
                      placeholder="Enter here"
                    />
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Region/State"
                      name="state"
                      type="text"
                      placeholder="Enter here"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-[18px]">
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Date of Birth"
                      name="dob"
                      type="date"
                      placeholder="Enter here"
                    />
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Specialty"
                      name="specialty"
                      type="text"
                      placeholder="Enter here"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-[18px]">
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Designation"
                      name="designation"
                      type="text"
                      placeholder="Enter here"
                    />
                    <div className="w-full">
                      <label className="font-medium text-base text-black mb-2 block">
                        Department
                      </label>
                      <select
                        {...employeeForm.register("department")}
                        className="w-full h-[60px] border border-[#737373] rounded px-3 text-[#737373] text-xs font-normal bg-white focus:outline-none focus:ring-2 focus:ring-[#003465]"
                      >
                        <option value="">Choose department</option>
                        {departments.map((dept) => (
                          <option key={dept.id || dept._id} value={String(dept.id || dept._id)}>
                            {dept.name || dept.department_name || `Department ${dept.id || dept._id}`}
                          </option>
                        ))}
                      </select>
                      {employeeForm.formState.errors.department && (
                        <p className="text-red-500 text-sm mt-1">
                          {employeeForm.formState.errors.department.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-[18px]">
                    <FieldSelect
                      control={employeeForm.control}
                      labelText="Gender"
                      name="gender"
                      options={["Male", "Female"]}
                      placeholder="Choose your gender"
                    />
                    <div className="flex">
                      <FieldFileInput
                        control={employeeForm.control}
                        labelText="Upload Employee Image"
                        name="employeeImage"
                        fileInputRef={fileInputRef}
                        setImagePreviewer={setImagePreviewer}
                        hidden
                        showInline
                      />
                      <Button
                        type="button"
                        onClick={triggerFileUpload}
                        className="px-5 bg-[#003465] text-white h-[60px] self-end"
                      >
                        Browse
                      </Button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-[18px]">
                    <FieldBox
                      control={employeeForm.control}
                      labelText="Hire date"
                      name="hireDate"
                      type="date"
                      placeholder="Enter here"
                    />
                  </div>
                  <FieldTextBox
                    control={employeeForm.control}
                    name="bio"
                    labelText="Short Biography"
                    placeholder="Your Message"
                  />
                </div>
                <div className="mt-8 flex gap-[10px]">
                  <Button
                    type="button"
                    onClick={handleFormCancel}
                    disabled={isSubmitting}
                    className="h-[60px] w-[200px] border border-[#EC0909] text-[#EC0909] text-base font-medium hover:bg-[#ec090922] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-[60px] w-[200px] text-base font-medium bg-[#003465] hover:bg-[#003465]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </FormComposer>
            </div>
          </section>
        ) : (
          <section className="mt-10 shadow-[0px_0px_4px_1px_#0000004D] relative z-0">
            <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px] px-[27px]">
              <h2 className="font-semibold text-xl text-black">
                Employee List
              </h2>
              <Button
                onClick={handleCreateEmployeeClick}
                className="px-4 py-2 bg-[#003465] text-white rounded hover:bg-[#003465]/90 font-medium flex items-center gap-2"
              >
                Create Employee <Plus size={20} />
              </Button>
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
        )}
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
        <AlertDialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto !z-[110] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <AlertDialogHeader className="text-center pb-4">
            <AlertDialogTitle className="text-2xl font-semibold text-black">
              Employee Details
            </AlertDialogTitle>
          </AlertDialogHeader>
          {selectedEmployee && (
            <div className="space-y-6 py-2">
              {/* Employee Image and Name Section */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-200">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#003465] shadow-lg">
                  <Image
                    src={selectedEmployee.profilePicture || '/assets/doctorFemale.png'}
                    alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                    fill
                    sizes="128px"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/doctorFemale.png';
                    }}
                  />
      </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#003465] mb-2">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedEmployee.status?.toLowerCase() === "active"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                  >
                    {selectedEmployee.status || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Professional Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Designation */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                    Designation
                  </label>
                  <p className="text-lg font-semibold text-[#003465]">
                    {selectedEmployee.designation || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Job title</p>
                </div>

                {/* Department */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <label className="block text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">
                    Department
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedEmployee.departmentName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Assigned department</p>
                </div>
              </div>

              {/* Contact Information Grid */}
              {(editFormData.email || editFormData.phoneNumber) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  {editFormData.email && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <label className="block text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-base font-medium text-gray-900 break-words">
                        {editFormData.email}
                      </p>
                    </div>
                  )}

                  {/* Phone Number */}
                  {editFormData.phoneNumber && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                      <label className="block text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-base font-medium text-gray-900">
                        {editFormData.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Information */}
              {(editFormData.address || editFormData.state || editFormData.dob || editFormData.gender || editFormData.specialty || editFormData.hireDate) && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Additional Information
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editFormData.address && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <p className="text-sm text-gray-900">{editFormData.address}</p>
                      </div>
                    )}
                    {editFormData.state && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Region/State</label>
                        <p className="text-sm text-gray-900">{editFormData.state}</p>
                      </div>
                    )}
                    {editFormData.dob && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                        <p className="text-sm text-gray-900">{editFormData.dob}</p>
                      </div>
                    )}
                    {editFormData.gender && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                        <p className="text-sm text-gray-900">{editFormData.gender}</p>
                      </div>
                    )}
                    {editFormData.specialty && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Specialty</label>
                        <p className="text-sm text-gray-900">{editFormData.specialty}</p>
                      </div>
                    )}
                    {editFormData.hireDate && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Hire Date</label>
                        <p className="text-sm text-gray-900">{editFormData.hireDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bio/Description */}
              {editFormData.bio && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Biography
                  </label>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {editFormData.bio}
                  </p>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter className="pt-4 border-t border-gray-200 mt-4">
            <AlertDialogCancel
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedEmployee(null);
                setEditFormData({});
              }}
              className="w-full sm:w-auto border border-[#D9D9D9] text-[#737373] hover:bg-gray-50 px-8 py-2"
            >
              Close
            </AlertDialogCancel>
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
                  value={editFormData.is_active === undefined ? "true" : editFormData.is_active.toString()}
                  onChange={(e) => {
                    const newIsActive = e.target.value === "true";
                    console.log("Status changed to:", newIsActive, "from value:", e.target.value);
                    setEditFormData({ ...editFormData, is_active: newIsActive });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465] ${
                    editFormData.is_active === false 
                      ? "border-red-300 bg-red-50 text-red-900" 
                      : "border-green-300 bg-green-50 text-green-900"
                  }`}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
