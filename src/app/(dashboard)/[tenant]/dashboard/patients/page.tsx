"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

type PatientCard = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
};

type PatientDTO = {
  id: number;
  firstName: string;
  lastName: string;
  picture: string;
  address: string;
  ailment?: string;
  age?: number;
  phoneNumber: string;
  email: string;
  [key: string]: string | number | undefined;
};

// Helper function to map API patient data to PatientCard
const mapPatientToCard = (patient: any, index: number): PatientCard => {
  const firstName = patient.first_name || patient.firstName || patient.name?.split(" ")[0] || "";
  const lastName = patient.last_name || patient.lastName || patient.name?.split(" ").slice(1).join(" ") || "";
  const email = patient.email || patient.email_address || "";
  const picture = patient.profile_picture || patient.profilePicture || patient.picture || "/assets/imagePlaceholder.png";

  return {
    id: patient.id || patient._id || index + 1,
    firstName,
    lastName,
    email,
    picture,
  };
};

// Helper function to map API patient data to PatientDTO
const mapPatientToDTO = (patient: any, index: number): PatientDTO => {
  const firstName = patient.first_name || patient.firstName || patient.name?.split(" ")[0] || "";
  const lastName = patient.last_name || patient.lastName || patient.name?.split(" ").slice(1).join(" ") || "";
  const address = patient.address || patient.Address || "N/A";
  const ailment = patient.ailment || patient.condition || patient.diagnosis || patient.medical_condition || "";
  const age = patient.age || patient.Age || patient.date_of_birth ? calculateAge(patient.date_of_birth || patient.dob || patient.dateOfBirth) : undefined;
  const phoneNumber = patient.phone_number || patient.phone || patient.phoneNumber || patient.Phone || patient.mobile || "N/A";
  const email = patient.email || patient.email_address || patient.Email || "";
  const picture = patient.profile_picture || patient.profilePicture || patient.picture || "/assets/imagePlaceholder.png";

  return {
    id: patient.id || patient._id || index + 1,
    firstName,
    lastName,
    picture,
    address,
    ailment,
    age,
    phoneNumber,
    email,
  };
};

// Helper function to calculate age from date of birth
const calculateAge = (dob: string): number | undefined => {
  if (!dob) return undefined;
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch {
    return undefined;
  }
};

// Create columns function that accepts handlers
const createColumns = (
  onEdit: (patient: PatientDTO) => void,
  onDelete: (patient: PatientDTO) => void
): Column<PatientDTO>[] => [
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
    header: "Patient Name",
    render(row) {
      return (
        <div className="flex items-center gap-[10px]">
          <span className="w-[42px] h-[42px] rounded-full overflow-hidden">
          <Image
            src={row.picture}
              alt="patient image"
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
    header: "Address",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">{row.address}</p>
      );
    },
  },
  {
    header: "Ailment",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">{row.ailment || "N/A"}</p>
      );
    },
  },
  {
    header: "Age",
    render: (row) => (
      <p className="font-semibold text-xs text-[#737373]">{row.age || "N/A"}</p>
    ),
  },
  {
    header: "Phone",
    render: (row) => (
      <p className="font-semibold text-xs text-[#737373]">{row.phoneNumber}</p>
    ),
  },
  {
    header: "Email",
    render: (row) => (
      <p className="font-semibold text-xs text-[#737373]">{row.email || "N/A"}</p>
    ),
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

export default function PatientPage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [patientCards, setPatientCards] = useState<PatientCard[]>([]);
  const [patientsTableData, setPatientsTableData] = useState<PatientDTO[]>([]);
  const [fullPatientData, setFullPatientData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientDTO | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PatientDTO & {
    dob?: string;
    gender?: string;
    state?: string;
    bio?: string;
  }>>({});

  useEffect(() => {
    loadPatients();
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

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const response = await processRequestAuth("get", API_ENDPOINTS.GET_PATIENTS);
      
      const patients = Array.isArray(response?.data) 
        ? response.data 
        : Array.isArray(response) 
        ? response 
        : [];

      if (patients.length > 0) {
        setFullPatientData(patients);
        
        const cards = patients.slice(0, 4).map(mapPatientToCard);
        setPatientCards(cards);

        const tableData = patients.map(mapPatientToDTO);
        setPatientsTableData(tableData);
      } else {
        setPatientCards([]);
        setPatientsTableData([]);
        setFullPatientData([]);
      }
    } catch (error: any) {
      console.error("Failed to load patients:", error);
      
      if (error?.response?.status === 403) {
        toast.error("Access denied. Please check your permissions or contact your administrator.", {
          toastId: "patients-403-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "patients-401-error",
          autoClose: 5000,
        });
      } else {
        toast.error("Failed to load patients data", { toastId: "patients-load-error" });
      }
      
      setPatientCards([]);
      setPatientsTableData([]);
      setFullPatientData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  // Filter patients based on search
  const filteredPatients = patientsTableData.filter((patient) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower) ||
      patient.phoneNumber.toLowerCase().includes(searchLower) ||
      (patient.ailment && patient.ailment.toLowerCase().includes(searchLower)) ||
      patient.address.toLowerCase().includes(searchLower)
    );
  });

  // Get full patient data from API response
  const getFullPatientData = (patient: PatientDTO) => {
    let found = fullPatientData.find(p => {
      const patientId = String(p.id || p._id || '');
      return patientId === String(patient.id);
    });
    
    if (!found) {
      found = fullPatientData.find(p => {
        const pFirstName = p.first_name || p.firstName || p.name?.split(" ")[0] || "";
        const pLastName = p.last_name || p.lastName || p.name?.split(" ").slice(1).join(" ") || "";
        return `${pFirstName} ${pLastName}`.trim() === `${patient.firstName} ${patient.lastName}`.trim();
      });
    }
    
    return found;
  };

  // Handle view (opens view modal, which can then open edit)
  const handleView = (patient: PatientDTO) => {
    setSelectedPatient(patient);
    const fullData = getFullPatientData(patient);
    
    setEditFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      address: patient.address,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      ailment: patient.ailment,
      age: patient.age,
      picture: patient.picture,
      dob: fullData?.dob || fullData?.date_of_birth || fullData?.dateOfBirth || fullData?.DOB || fullData?.birth_date || '',
      gender: fullData?.gender || fullData?.Gender || '',
      state: fullData?.state || fullData?.region_state || fullData?.State || fullData?.region || '',
      bio: fullData?.bio || fullData?.biography || fullData?.short_biography || fullData?.Bio || '',
    });
    setIsViewModalOpen(true);
  };

  // Handle edit (opens edit modal directly)
  const handleEdit = (patient: PatientDTO) => {
    setSelectedPatient(patient);
    const fullData = getFullPatientData(patient);
    
    setEditFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      address: patient.address,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      ailment: patient.ailment,
      age: patient.age,
      picture: patient.picture,
      dob: fullData?.dob || fullData?.date_of_birth || fullData?.dateOfBirth || fullData?.DOB || fullData?.birth_date || '',
      gender: fullData?.gender || fullData?.Gender || '',
      state: fullData?.state || fullData?.region_state || fullData?.State || fullData?.region || '',
      bio: fullData?.bio || fullData?.biography || fullData?.short_biography || fullData?.Bio || '',
    });
    setIsEditModalOpen(true);
  };

  // Open edit from view modal
  const handleEditFromView = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (patient: PatientDTO) => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedPatient) return;
    
    try {
      await processRequestAuth("delete", `${API_ENDPOINTS.GET_PATIENTS}/${selectedPatient.id}`);
      
      setPatientsTableData((prev) => prev.filter((p) => p.id !== selectedPatient.id));
      setPatientCards((prev) => prev.filter((card) => card.id !== selectedPatient.id));
      
      toast.success("Patient deleted successfully", { toastId: "patient-delete-success" });
      setIsDeleteModalOpen(false);
      setSelectedPatient(null);
    } catch (error: any) {
      console.error("Failed to delete patient:", error);
      toast.error("Failed to delete patient", { toastId: "patient-delete-error" });
    }
  };

  // Handle edit save
  const handleEditSave = async (updatedData: Partial<PatientDTO>) => {
    if (!selectedPatient) return;
    
    try {
      const patientData = {
        first_name: updatedData.firstName || selectedPatient.firstName,
        last_name: updatedData.lastName || selectedPatient.lastName,
        email: updatedData.email || selectedPatient.email,
        phone_number: updatedData.phoneNumber || selectedPatient.phoneNumber,
        address: updatedData.address || selectedPatient.address,
        ailment: updatedData.ailment || selectedPatient.ailment,
        dob: (updatedData as any).dob || '',
        gender: (updatedData as any).gender || '',
        state: (updatedData as any).state || '',
        bio: (updatedData as any).bio || '',
      };

      const response = await processRequestAuth("patch", `${API_ENDPOINTS.GET_PATIENTS}/${selectedPatient.id}`, patientData);

      if (response?.data || response) {
        toast.success("Patient updated successfully", { toastId: "patient-update-success" });
        setIsEditModalOpen(false);
        setSelectedPatient(null);
        setEditFormData({});
        await loadPatients();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Failed to update patient:", error);
      if (error?.response?.status === 403) {
        toast.error("Access denied. You don't have permission to update patients.", {
          toastId: "patient-update-403-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "patient-update-401-error",
          autoClose: 5000,
        });
      } else if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid patient data";
        toast.error(errorMessage, {
          toastId: "patient-update-400-error",
          autoClose: 5000,
        });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to update patient";
        toast.error(errorMessage, {
          toastId: "patient-update-error",
          autoClose: 5000,
        });
      }
    }
  };

  // Create columns with handlers
  const columns = createColumns(handleEdit, handleDelete);

  return (
    <section>
      <SectionHeader
        title="Patients"
        description="Adequate Health care services improves Patients Health"
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-[19px]">
          {patientCards.map((patientCard) => (
            <div
              key={patientCard.id}
              className="rounded-[10px] shadow-[0px_4px_4px_0px_#00000040] bg-white flex flex-col p-5"
            >
              <div className="flex flex-col items-center">
                <div className="size-[80px] rounded-full mb-4 flex items-center justify-center overflow-hidden border-2 border-[#D9D9D9]">
                  <Image
                    src={patientCard.picture}
                    width={80}
                    height={80}
                    alt={`${patientCard.firstName} ${patientCard.lastName} photo`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-medium text-sm text-black text-center">
                  {patientCard.firstName} {patientCard.lastName}
                </h3>
                <p className="font-normal text-xs text-center mt-1 text-[#999999]">
                  {patientCard.email}
                </p>
              </div>
            </div>
          ))}
        </div>
        <section className="mt-10 shadow-[0px_0px_4px_1px_#0000004D] relative z-0">
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px] px-[27px]">
              <h2 className="font-semibold text-xl text-black">Patient List</h2>
            <Link
              href="/dashboard/patients/create"
              className="flex items-center gap-2 font-normal text-base text-white bg-[#003465] hover:bg-[#003465]/90 px-6 h-[40px] rounded"
            >
              Create Patient <Plus size={20} />
            </Link>
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
                <p className="text-lg">Loading patients...</p>
              </div>
            ) : filteredPatients.length > 0 ? (
              <DataTable columns={columns as any} data={filteredPatients as any} />
            ) : (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <p className="text-lg">No patients found</p>
              </div>
            )}
          </div>
          {filteredPatients.length > 0 && (
          <Pagination
              dataLength={filteredPatients.length}
              numOfPages={Math.ceil(filteredPatients.length / pageSize)}
              pageSize={pageSize}
            handlePageClick={handlePageClick}
          />
          )}
        </section>
      </div>

      {/* View Modal */}
      <AlertDialog 
        open={isViewModalOpen} 
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedPatient(null);
              setEditFormData({});
            }, 150);
          }
        }}
      >
        <AlertDialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto !z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-black">
              Patient Details
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#737373] pt-2">
              View patient information for{" "}
              <span className="font-semibold">
                {selectedPatient?.firstName} {selectedPatient?.lastName}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">First Name</label>
                <p className="text-sm text-[#737373]">{selectedPatient?.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Last Name</label>
                <p className="text-sm text-[#737373]">{selectedPatient?.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <p className="text-sm text-[#737373]">{selectedPatient?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                <p className="text-sm text-[#737373]">{selectedPatient?.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Address</label>
                <p className="text-sm text-[#737373]">{selectedPatient?.address || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Ailment</label>
                <p className="text-sm text-[#737373]">{selectedPatient?.ailment || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Age</label>
                <p className="text-sm text-[#737373]">{selectedPatient?.age || 'N/A'}</p>
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
              setSelectedPatient(null);
              setEditFormData({});
            }, 150);
          }
        }}
      >
        <AlertDialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto !z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-black">
              Edit Patient
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#737373] pt-2">
              Update patient information for{" "}
              <span className="font-semibold">
                {selectedPatient?.firstName} {selectedPatient?.lastName}
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
                  value={(editFormData as any).state || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={(editFormData as any).dob || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Gender</label>
                <select
                  value={(editFormData as any).gender || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Ailment</label>
                <input
                  type="text"
                  value={editFormData.ailment || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, ailment: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Bio/Notes</label>
              <textarea
                value={(editFormData as any).bio || ""}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-[#D9D9D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003465]"
                placeholder="Enter notes..."
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
              setSelectedPatient(null);
            }, 150);
          }
        }}
      >
        <AlertDialogContent className="bg-white max-w-md !z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-black">
              Delete Patient
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#737373] pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-black">
                {selectedPatient?.firstName} {selectedPatient?.lastName}
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
