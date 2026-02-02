'use client';

import { useState, useEffect } from 'react';
import DepartmentCarousel from '@/components/Org/Departments/DepartmentCarousel';
import DepartmentList from '@/components/Org/Departments/DepartmentList';
import AddDepartmentForm from '@/components/Org/Departments/AddDepartmentForm';
// import DepartmentList from '@/components/Org/Departments/DepartmentList';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/table/pagination';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { ListView } from '@/components/shared/table/DataTableFilter';
import { processRequestAuth } from '@/framework/https';
import { API_ENDPOINTS } from '@/framework/api-endpoints';
import { toast } from 'react-toastify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


interface Department {
  id: string;
  code: string;
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
  employeeCount: number;
  dateCreated: string;
  status: 'Active' | 'Inactive';
  image: string;
  description?: string;
  [key: string]: string | number | boolean | undefined;
}

// Helper function to generate color classes based on department name
const getDepartmentColors = (name: string, index: number) => {
  const colors = [
    { color: 'bg-blue-800', textColor: 'text-blue-800', borderColor: 'border-blue-800' },
    { color: 'bg-green-600', textColor: 'text-green-600', borderColor: 'border-green-600' },
    { color: 'bg-red-600', textColor: 'text-red-600', borderColor: 'border-red-600' },
    { color: 'bg-yellow-500', textColor: 'text-yellow-500', borderColor: 'border-yellow-500' },
    { color: 'bg-purple-600', textColor: 'text-purple-600', borderColor: 'border-purple-600' },
    { color: 'bg-indigo-600', textColor: 'text-indigo-600', borderColor: 'border-indigo-600' },
    { color: 'bg-pink-600', textColor: 'text-pink-600', borderColor: 'border-pink-600' },
  ];
  return colors[index % colors.length];
};

// Helper function to generate department code from name
const generateDepartmentCode = (name: string): string => {
  if (!name) return 'DP';
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to format date
const formatDate = (date: string | Date): string => {
  if (!date) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper function to validate and format image URL
const formatImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) {
    return '/assets/department/department-bg.jpg';
  }

  // If it's already a valid absolute URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path starting with /
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // If it's just a filename (like "1705295469684.jpeg"), we need to construct a valid URL
  // This assumes the backend serves images from a specific endpoint
  // You may need to adjust this based on your backend API structure
  // For now, we'll use a default placeholder if it's just a filename
  if (imageUrl.match(/^[^/\\]+\.(jpg|jpeg|png|gif|webp)$/i)) {
    // It's just a filename - use default placeholder
    // TODO: If your backend serves images, construct the full URL here
    // Example: return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${imageUrl}`;
    return '/assets/department/department-bg.jpg';
  }

  // Default fallback
  return '/assets/department/department-bg.jpg';
};

// Helper function to map API department data to Department type
const mapApiToDepartment = (dept: any, index: number): Department => {
  const name = dept.name || dept.department_name || 'Unnamed Department';
  const colors = getDepartmentColors(name, index);
  const code = dept.code || dept.code || generateDepartmentCode(name);
  const employeeCount = dept.employee_count || dept.employeeCount || dept.users?.length || dept.employees?.length || 0;
  const status = dept.status || (dept.is_active !== false ? 'Active' : 'Inactive');
  const dateCreated = formatDate(dept.created_at || dept.dateCreated || dept.createdAt || new Date());
  const image = formatImageUrl(dept.image || dept.image_url || dept.imageUrl);
  const description = dept.description || dept.departmentDescription || "";
  const id = String(dept.id || dept._id || index + 1);

  return {
    id,
    code,
    name,
    ...colors,
    employeeCount,
    dateCreated,
    status: status as 'Active' | 'Inactive',
    image,
    description,
  };
};

// Create columns function that accepts handlers
const createColumns = (
  onEdit: (department: Department) => void,
  onDelete: (department: Department) => void
): Column<Department>[] => [
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
  { header: "Department Name", key: "name" },
  { header: "No. of Employee", key: "employeeCount" },
  { header: "Date Created", key: "dateCreated" },
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

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [recentlyViewedDepartment, setRecentlyViewedDepartment] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name?: string;
    code?: string;
    status?: 'Active' | 'Inactive';
    employeeCount?: number;
    description?: string;
    departmentDescription?: string;
    departmentImage?: string;
  }>({});

  useEffect(() => {
    loadDepartments();
    // Load recently viewed department from localStorage on component mount
    const recent = localStorage.getItem('recentlyViewedDepartment');
    if (recent) {
      setRecentlyViewedDepartment(recent);
    }
  }, []);

  // Ensure body scroll is restored when modals close
  useEffect(() => {
    if (!isEditModalOpen && !isDeleteModalOpen && !isViewModalOpen) {
      // Small delay to ensure modal animation completes
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        // Remove any lingering overlays
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
  }, [isEditModalOpen, isDeleteModalOpen]);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await processRequestAuth("get", API_ENDPOINTS.GET_DEPARTMENTS);
      
      // Handle different response structures
      const depts = Array.isArray(response?.data) 
        ? response.data 
        : Array.isArray(response) 
        ? response 
        : [];

      if (depts.length > 0) {
        const mappedDepartments = depts.map(mapApiToDepartment);
        setDepartments(mappedDepartments);
        
        // Reorder if there's a recently viewed department
        if (recentlyViewedDepartment) {
          reorderDepartments(recentlyViewedDepartment);
        }
      } else {
        setDepartments([]);
      }
    } catch (error: any) {
      console.error("Failed to load departments:", error);
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        toast.error("Access denied. Please check your permissions or contact your administrator.", {
          toastId: "departments-403-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "departments-401-error",
          autoClose: 5000,
        });
      } else {
        toast.error("Failed to load departments data", { toastId: "departments-load-error" });
      }
      
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter((dept) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      dept.name.toLowerCase().includes(searchLower) ||
      dept.code.toLowerCase().includes(searchLower) ||
      (dept.description && dept.description.toLowerCase().includes(searchLower))
    );
  });


  // Function to reorder departments based on recently viewed
  const reorderDepartments = (departmentId: string) => {
    setDepartments(prevDepartments => {
      const recentDept = prevDepartments.find(dept => dept.id === departmentId);
      if (!recentDept) return prevDepartments;

      const otherDepts = prevDepartments.filter(dept => dept.id !== departmentId);
      return [recentDept, ...otherDepts];
    });
  };

  // Handle department card click
  const handleDepartmentClick = (departmentId: string) => {
    localStorage.setItem('recentlyViewedDepartment', departmentId);
    setRecentlyViewedDepartment(departmentId);
    // Navigation will be handled by the Link component in DepartmentCard
  };

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsViewModalOpen(true);
  };

  const handleEditFromView = () => {
    setIsViewModalOpen(false);
    if (selectedDepartment) {
      setEditFormData({
        name: selectedDepartment.name,
        code: selectedDepartment.code,
        status: selectedDepartment.status,
        employeeCount: selectedDepartment.employeeCount,
        description: selectedDepartment.description,
        departmentImage: selectedDepartment.image,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleCreateDepartment = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (newDepartment: any) => {
    try {
      // Prepare the data for API
      const departmentData = {
      name: String(newDepartment.name),
        code: newDepartment.code || generateDepartmentCode(newDepartment.name),
        description: newDepartment.departmentDescription || newDepartment.description || "",
        status: newDepartment.status === 'Inactive' ? 'inactive' : 'active',
        image: newDepartment.image || newDepartment.departmentImage || null,
        // Include any other fields your API expects
      };

      // Make API call to create department using POST to /tenant/department
      const response = await processRequestAuth("post", API_ENDPOINTS.GET_DEPARTMENTS, departmentData);
      
      // Handle response
      if (response?.data || response) {
        toast.success("Department created successfully", { toastId: "department-create-success" });
    setShowForm(false);
        
        // Reload departments to update the table with fresh data
        await loadDepartments();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Failed to create department:", error);
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        toast.error("Access denied. You don't have permission to create departments.", {
          toastId: "department-create-403-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "department-create-401-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid department data";
        toast.error(errorMessage, {
          toastId: "department-create-400-error",
          autoClose: 5000,
        });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to create department";
        toast.error(errorMessage, {
          toastId: "department-create-error",
          autoClose: 5000,
        });
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setEditFormData({
      name: department.name,
      code: department.code,
      status: department.status,
      employeeCount: department.employeeCount,
      departmentDescription: department.description || "",
      departmentImage: department.image,
    });
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedDepartment) return;
    
    try {
      // Make API call to delete department
      await processRequestAuth("delete", `${API_ENDPOINTS.GET_DEPARTMENTS}/${selectedDepartment.id}`);
      
      toast.success("Department deleted successfully", { toastId: "department-delete-success" });
      setIsDeleteModalOpen(false);
      setSelectedDepartment(null);
      
      // Reload departments to update the table
      await loadDepartments();
    } catch (error: any) {
      console.error("Failed to delete department:", error);
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        toast.error("Access denied. You don't have permission to delete departments.", {
          toastId: "department-delete-403-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "department-delete-401-error",
          autoClose: 5000,
        });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete department";
        toast.error(errorMessage, {
          toastId: "department-delete-error",
          autoClose: 5000,
        });
      }
    }
  };

  // Handle edit save
  const handleEditSave = async (updatedData: Partial<Department>) => {
    if (!selectedDepartment) return;
    
    try {
      // Prepare the data for API
      const departmentData = {
        name: updatedData.name || selectedDepartment.name,
        code: updatedData.code || selectedDepartment.code,
        description: updatedData.departmentDescription || "",
        status: updatedData.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active',
        image: updatedData.departmentImage || updatedData.image || null,
        // Include any other fields your API expects
      };

      // Make API call to update department using PATCH
      const response = await processRequestAuth("patch", `${API_ENDPOINTS.GET_DEPARTMENTS}/${selectedDepartment.id}`, departmentData);
      
      if (response?.data || response) {
        toast.success("Department updated successfully", { toastId: "department-update-success" });
        setIsEditModalOpen(false);
        
        // Reload departments to update the table
        await loadDepartments();
        
        // Reset state after modal closes (handled by onOpenChange)
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Failed to update department:", error);
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        toast.error("Access denied. You don't have permission to update departments.", {
          toastId: "department-update-403-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "department-update-401-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid department data";
        toast.error(errorMessage, {
          toastId: "department-update-400-error",
          autoClose: 5000,
        });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to update department";
        toast.error(errorMessage, {
          toastId: "department-update-error",
          autoClose: 5000,
        });
      }
    }
  };

  // Create columns with handlers
  const columns = createColumns(handleEdit, handleDelete);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/department/department-bg.jpg')`,
          backgroundColor: '#003465',
        }}
      >
        <div className="absolute inset-0 bg-[#003465] bg-opacity-80"></div>
        <div className="relative w-full px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-white text-4xl font-bold text-center">Departments</h1>
          <p className="text-white text-center mt-2">
            Employees are the foundation for ensuring good health
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Departments</h2>

        {/* Department Cards Carousel */}
        <div className="mb-8">
        <DepartmentCarousel
          departments={departments}
          onDepartmentClick={handleDepartmentClick}
          onViewClick={handleViewDepartment}
          recentlyViewedId={recentlyViewedDepartment}
        />
        </div>

        {/* Department List/Form Section */}
        <div className="w-full pb-8">

          {showForm ? (
            <AddDepartmentForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          ) : (
            <section className="w-full py-4 p-4 md:p-6 shadow-[0px_0px_4px_1px_#0000004D] rounded-md mx-2 md:mx-4 relative z-0">
              <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5 border-b border-[#D9D9D9] h-auto sm:h-[90px] py-4 sm:py-0">
                <h2 className="text-xl font-semibold text-black">Department List</h2>
                <Button
                  onClick={handleCreateDepartment}
                  className="px-4 py-2 bg-[#003465] text-white rounded hover:bg-[#003465]/90 w-full sm:w-auto font-medium"
                >
                  Add Department
                </Button>
              </header>
              <div className="py-[30px] flex flex-col sm:flex-row justify-between gap-4 sm:gap-10">
                <ListView pageSize={pageSize} setPageSize={setPageSize} />
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search data..."
                    className="py-[10px] px-5 pr-11 rounded-[30px] min-w-[200px] sm:min-w-[318px] bg-[#E6EBF0] w-full font-medium text-sm text-[#4F504F] border-[0.2px] border-[#F9F9F9] outline-none"
                  />
                  <Search className="size-5 text-[#999999] absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-500">
                  <p className="text-lg">Loading departments...</p>
                </div>
              ) : filteredDepartments.length > 0 ? (
                <>
                  <div className="w-full -mx-2 md:mx-0 relative z-0">
                    <DataTable columns={columns as any} data={filteredDepartments as any} />
                  </div>
                  <div className="mt-4">
              <Pagination
                dataLength={filteredDepartments.length}
                numOfPages={Math.ceil(filteredDepartments.length / pageSize)}
                pageSize={pageSize}
                handlePageClick={handlePageClick}
              />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-20 text-gray-500">
                  <p className="text-lg">No departments found</p>
                </div>
              )}
            </section>

          )}
        </div>

        {/* Edit Modal */}
        <AlertDialog 
          open={isEditModalOpen} 
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) {
              // Reset state when modal closes (cancel or outside click)
              setTimeout(() => {
                setSelectedDepartment(null);
                setEditFormData({});
                // Force cleanup of any lingering overlays
                const overlays = document.querySelectorAll('[data-radix-portal]');
                overlays.forEach((overlay) => {
                  const element = overlay as HTMLElement;
                  if (element.getAttribute('data-state') === 'closed') {
                    element.remove();
                  }
                });
              }, 150); // Small delay to ensure modal animation completes
            }
          }}
        >
          <AlertDialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto !z-[110]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-black">
                Edit Department
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-[#737373] pt-2">
                Update department information for{" "}
                <span className="font-semibold">
                  {selectedDepartment?.name}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-6">
              <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6">
                <div className="flex-1">
                  <label className="block text-base text-black font-normal mb-2">
                    Department name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter here"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full h-14 p-3 border border-[#737373] rounded focus:outline-none focus:ring-2 focus:ring-[#003465]"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-base text-black font-normal mb-2">
                    Upload Department Image
                  </label>
                  <div className="flex">
                    <div className="flex-1 border h-14 border-[#737373] rounded flex items-center px-4">
                      <span className="mr-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.29241 11.1974C9.26108 11.1664 9.21878 11.149 9.1747 11.149C9.13062 11.149 9.08832 11.1664 9.057 11.1974L6.63624 13.6184C5.51545 14.7393 3.62384 14.858 2.38638 13.6184C1.14684 12.3787 1.26558 10.4891 2.38638 9.36817L4.80714 6.94721C4.87172 6.88263 4.87172 6.77637 4.80714 6.71179L3.978 5.88258C3.94667 5.85156 3.90437 5.83416 3.86029 5.83416C3.81621 5.83416 3.77391 5.85156 3.74259 5.88258L1.32183 8.30353C-0.440611 10.0661 -0.440611 12.9183 1.32183 14.6788C3.08427 16.4393 5.93627 16.4414 7.69663 14.6788L10.1174 12.2579C10.182 12.1933 10.182 12.087 10.1174 12.0225L9.29241 11.1974ZM14.6797 1.32194C12.9173 -0.440647 10.0653 -0.440647 8.30494 1.32194L5.8821 3.74289C5.85108 3.77422 5.83369 3.81652 5.83369 3.86061C5.83369 3.90469 5.85108 3.94699 5.8821 3.97832L6.70916 4.80544C6.77374 4.87003 6.87998 4.87003 6.94457 4.80544L9.36532 2.38449C10.4861 1.2636 12.3777 1.14485 13.6152 2.38449C14.8547 3.62414 14.736 5.51381 13.6152 6.6347L11.1944 9.05565C11.1634 9.08698 11.146 9.12928 11.146 9.17336C11.146 9.21745 11.1634 9.25975 11.1944 9.29108L12.0236 10.1203C12.0881 10.1849 12.1944 10.1849 12.259 10.1203L14.6797 7.69933C16.4401 5.93675 16.4401 3.08453 14.6797 1.32194ZM10.0445 5.09087C10.0131 5.05985 9.97084 5.04245 9.92676 5.04245C9.88268 5.04245 9.84038 5.05985 9.80906 5.09087L5.09046 9.80777C5.05944 9.8391 5.04204 9.8814 5.04204 9.92548C5.04204 9.96957 5.05944 10.0119 5.09046 10.0432L5.91543 10.8682C5.98001 10.9328 6.08626 10.9328 6.15084 10.8682L10.8674 6.15134C10.9319 6.08676 10.9319 5.9805 10.8674 5.91591L10.0445 5.09087Z" fill="#737373"/>
                        </svg>
                      </span>
                      <span className="text-gray-500">
                        {editFormData.departmentImage && typeof editFormData.departmentImage === 'string'
                          ? editFormData.departmentImage.split('/').pop() 
                          : "Choose File"}
                      </span>
                    </div>
                    <Button 
                      type="button"
                      className="bg-[#003465] hover:bg-[#102437] text-white px-6 py-2 h-14 rounded"
                      onClick={() => document.getElementById('editFileInput')?.click()}
                    >
                      Browse
                    </Button>
                    <input 
                      id="editFileInput"
                      type="file" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditFormData({ ...editFormData, departmentImage: file.name });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-base text-black font-normal mb-2">
                  Department Description
                </label>
                <textarea
                  placeholder="Your Message"
                  value={editFormData.departmentDescription || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, departmentDescription: e.target.value })}
                  className="w-full p-3 min-h-52 border border-[#737373] rounded focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              
              <div>
                <h3 className="block text-base text-black font-normal mb-2">Status</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-active"
                      checked={editFormData.status !== 'Inactive'}
                      onChange={() => setEditFormData({ ...editFormData, status: 'Active' })}
                      className="accent-green-600 w-6 h-6 rounded"
                    />
                    <label htmlFor="edit-active">Active</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-inactive"
                      checked={editFormData.status === 'Inactive'}
                      onChange={() => setEditFormData({ ...editFormData, status: 'Inactive' })}
                      className="accent-green-600 w-6 h-6 rounded"
                    />
                    <label htmlFor="edit-inactive">Inactive</label>
                  </div>
                </div>
              </div>
            </div>
            <AlertDialogFooter className="flex space-x-4 pt-4">
              <AlertDialogCancel
                onClick={() => {
                  setIsEditModalOpen(false);
                }}
                className="border border-[#EC0909] text-[#EC0909] hover:bg-[#ec090922] py-8 px-16 text-md rounded"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleEditSave(editFormData);
                }}
                className="bg-[#003465] hover:bg-[#0d2337] text-white py-8 px-16 text-md rounded"
              >
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Warning Modal */}
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent className="bg-white max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-black">
                Delete Department
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-[#737373] pt-2">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-black">
                  {selectedDepartment?.name}
                </span>
                ? This action cannot be undone and will remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedDepartment(null);
                }}
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
      </div>
    </div>
  );
}