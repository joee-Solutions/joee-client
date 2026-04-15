"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import PatientStepper from "@/components/Org/Patients/PatientStepper";
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
import SuccessModal from "@/components/shared/SuccessModal";

type PatientCard = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  rgbColorCode: string;
  description: string;
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
  gender?: string;
  dateOfBirth?: string;
  [key: string]: string | number | undefined;
};

// Helper function to map API patient data to PatientCard
const mapPatientToCard = (patient: any, index: number): PatientCard => {
  // Extract name - API response uses: firstname, lastname (lowercase, no underscore)
  // Check all variations to handle different API response formats
  const firstName = patient.firstname || patient.first_name || patient.firstName || patient.name?.split(" ")[0] || "";
  const lastName = patient.lastname || patient.last_name || patient.lastName || patient.name?.split(" ").slice(1).join(" ") || "";
  
  const email = patient.contact_info?.email || patient.contact_info?.email_work || patient.email || patient.email_address || "";
  const picture = patient.profile_picture || patient.profilePicture || patient.picture || patient.image || patient.patient_image || "/assets/imagePlaceholder.png";
  
  // Color codes for patient cards (using default blue color)
  const rgbColorCode = "0, 52, 101"; // Default blue color matching the theme
  
  // Description can be ailment or condition
  const description = patient.diagnosis_history?.[0]?.diagnosis ||
                     patient.diagnosis_history?.[0]?.condition ||
                     patient.ailment || 
                     patient.condition || 
                     patient.diagnosis || 
                     patient.medical_condition || 
                     "Patient";

  return {
    id: patient.id || patient._id || index + 1,
    firstName,
    lastName,
    email,
    picture,
    rgbColorCode,
    description,
  };
};

// Helper function to map API patient data to PatientDTO
const mapPatientToDTO = (patient: any, index: number): PatientDTO => {
  // Extract name - API response uses: firstname, lastname (lowercase, no underscore)
  // Check all variations to handle different API response formats
  const firstName = patient.firstname || patient.first_name || patient.firstName || patient.name?.split(" ")[0] || "";
  const lastName = patient.lastname || patient.last_name || patient.lastName || patient.name?.split(" ").slice(1).join(" ") || "";
  
  // Extract address from contact_info or top-level
  const address = patient.contact_info?.address || 
                 patient.contact_info?.current_address ||
                 patient.address || 
                 patient.Address || 
                 "N/A";
  
  // Extract ailment from diagnosis history or medical condition
  const ailment = patient.diagnosis_history?.[0]?.diagnosis ||
                 patient.diagnosis_history?.[0]?.condition ||
                 patient.ailment || 
                 patient.condition || 
                 patient.diagnosis || 
                 patient.medical_condition || 
                 "";
  
  // Extract date of birth
  const dob = patient.date_of_birth || patient.dob || patient.dateOfBirth || patient.birth_date;
  const dateOfBirth = dob ? (typeof dob === 'string' ? dob : new Date(dob).toISOString().split('T')[0]) : undefined;
  
  // Calculate age from date_of_birth
  const age = dob ? calculateAge(dob) : patient.age || patient.Age || undefined;
  
  // Extract gender
  const gender = patient.sex || patient.gender || patient.Gender || "";
  
  // Extract phone number from contact_info or top-level
  const phoneNumber =
    // New API shape (nested contact_info)
    patient.contact_info?.phone_number_mobile ||
    patient.contact_info?.phone_number_home ||
    patient.contact_info?.phone_number ||
    patient.contact_info?.phone ||
    patient.contact_info?.mobile ||
    // Top-level variants
    patient.phone_number_mobile ||
    patient.phone_number_home ||
    patient.phone_number ||
    patient.phone ||
    patient.phoneNumber ||
    patient.Phone ||
    patient.mobile ||
    "N/A";
  
  // Extract email from contact_info or top-level
  const email = patient.contact_info?.email ||
               patient.contact_info?.email_work ||
               patient.email || 
               patient.email_address || 
               patient.Email || 
               "";
  
  const picture = patient.profile_picture || 
                 patient.profilePicture || 
                 patient.picture || 
                 patient.image ||
                 patient.patient_image ||
                 "/assets/imagePlaceholder.png";

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
    gender,
    dateOfBirth,
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
    header: "Patient",
    render(row) {
      const patientName = `${row.firstName || ""} ${row.lastName || ""}`.trim() || "Unknown Patient";
      const imageSrc = row.picture && row.picture !== "/assets/imagePlaceholder.png" 
        ? row.picture 
        : "/assets/imagePlaceholder.png";
      
      return (
        <div className="flex items-center gap-[10px]">
          <span className="w-[42px] h-[42px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
              src={imageSrc}
              alt={`${patientName} photo`}
            width={42}
            height={42}
              className="object-cover aspect-square w-full h-full rounded-full"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                if (target.src !== "/assets/imagePlaceholder.png") {
                  target.src = "/assets/imagePlaceholder.png";
                }
              }}
            />
          </span>
          <p className="font-medium text-xs text-black">
            {patientName}
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
    header: "Gender",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">{row.gender || "N/A"}</p>
      );
    },
  },
  {
    header: "Date Of Birth",
    render: (row) => {
      const dob = row.dateOfBirth;
      if (!dob) return <p className="font-semibold text-xs text-[#737373]">N/A</p>;
      
      // Format date for display
      try {
        const date = typeof dob === 'string' ? new Date(dob) : dob;
        const formatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return <p className="font-semibold text-xs text-[#737373]">{formatted}</p>;
      } catch {
        return <p className="font-semibold text-xs text-[#737373]">{String(dob)}</p>;
      }
    },
  },
  {
    header: "Phone Number",
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
    header: "Action",
    render(row) {
      return (
        <div
          className="flex justify-end"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
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
        </div>
      );
    },
  },
];

function slugifyPatientName(patient: Pick<PatientDTO, "firstName" | "lastName" | "id">) {
  const name = `${patient.firstName ?? ""} ${patient.lastName ?? ""}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return name || `patient-${patient.id}`;
}

function patientDetailHref(tenant: string | undefined, patient: PatientDTO) {
  const slug = slugifyPatientName(patient);
  let isSubdomainTenant = false;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("localhost")) {
      const parts = host.split(".");
      isSubdomainTenant = parts.length >= 2 && parts[0] !== "localhost";
    } else {
      const parts = host.split(".");
      isSubdomainTenant = parts.length >= 3 && parts[0] !== "www";
    }
  }
  const path = isSubdomainTenant
    ? `/dashboard/patients/${slug}`
    : tenant
      ? `/${tenant}/dashboard/patients/${slug}`
      : `/dashboard/patients/${slug}`;
  return `${path}?pid=${patient.id}`;
}

export default function PatientPage() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const org = params?.tenant as string || pathname?.split('/organization/')[1]?.split('/')[0] || '';
  const [showForm, setShowForm] = useState(false);
  /** When set, we're editing this patient in the stepper; when null and showForm true, we're creating. */
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [patientCards, setPatientCards] = useState<PatientCard[]>([]);
  const [patientsTableData, setPatientsTableData] = useState<PatientDTO[]>([]);
  const [fullPatientData, setFullPatientData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientDTO | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientSuccessModal, setPatientSuccessModal] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  useEffect(() => {
    loadPatients();
  }, []);

  // Ensure body scroll is restored when modals close
  useEffect(() => {
    if (!isDeleteModalOpen) {
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
  }, [isDeleteModalOpen]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_PATIENTS);
      
      // Handle different API response structures
      const patients = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      if (patients.length > 0) {
        setFullPatientData(patients);
        
        // Map patients to cards (first 4 for display)
        const cards = patients.slice(0, 4).map((patient: any, index: number) => mapPatientToCard(patient, index));
        setPatientCards(cards);

        // Map patients to table data format
        const tableData = patients.map((patient: any, index: number) => mapPatientToDTO(patient, index));
        setPatientsTableData(tableData);
      } else {
        setPatientCards([]);
        setPatientsTableData([]);
        setFullPatientData([]);
      }
    } catch (error: any) {
      console.error("Failed to load patients:", error);
      
      if (error?.response?.status === 403) {
        // Suppress 403 "No token" errors - these are expected when token is missing
        if (!error?.response?.data?.error?.toLowerCase().includes('no token')) {
          toast.error("Access denied. Please check your permissions or contact your administrator.", {
            toastId: "patients-403-error",
            autoClose: 5000,
          });
        }
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
      patient.address.toLowerCase().includes(searchLower) ||
      (patient.gender && patient.gender.toLowerCase().includes(searchLower)) ||
      (patient.dateOfBirth && patient.dateOfBirth.toLowerCase().includes(searchLower))
    );
  });

  const goToPatientDetail = (patient: PatientDTO) => {
    router.push(patientDetailHref(org || undefined, patient));
  };

  // Handle edit: show the same stepper form used for create, with patient data loaded
  const handleEdit = (patient: PatientDTO) => {
    setSelectedPatient(patient);
    setEditingPatientId(patient.id);
    setShowForm(true);
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
      await processRequestOfflineAuth("delete", API_ENDPOINTS.DELETE_PATIENT(selectedPatient.id));
      
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

  // Create columns with handlers
  const columns = createColumns(handleEdit, handleDelete);

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPatientId(null);
    setSelectedPatient(null);
  };

  const handleCreatePatientClick = () => {
    setEditingPatientId(null);
    setSelectedPatient(null);
    setShowForm(true);
  };

  const handleSaveComplete = () => {
    setPatientSuccessModal({ open: true, message: "Patient saved successfully." });
  };

  const handlePatientSuccessModalClose = (open: boolean) => {
    if (!open) {
      setPatientSuccessModal((s) => ({ ...s, open: false }));
      // Keep edit form open after successful update so users can continue editing.
      if (!editingPatientId) {
        setShowForm(false);
        setEditingPatientId(null);
        setSelectedPatient(null);
      }
      loadPatients();
    }
  };

  return (
    <section>
      <SectionHeader
        title="Patients"
        description="Adequate Health care services improves Patients Health"
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        {showForm ? (
          <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPatientId ? "Edit Patient" : "Create New Patient"}
              </h2>
              <Button
                onClick={handleFormCancel}
                variant="outline"
                className="bg-[#003465] text-white hover:bg-[#003465]/90"
              >
                Back to Patient List
              </Button>
            </div>
            <PatientStepper
              slug={org}
              patientId={editingPatientId ?? undefined}
              onSaveComplete={handleSaveComplete}
            />
          </div>
        ) : (
          <>
            {/* Patient Cards - horizontal scroll */}
            <div className="flex gap-[19px] mb-10 overflow-x-auto pb-2">
              {patientCards.map((patientCard) => (
                <div
                  key={patientCard.id}
              className="rounded-[10px] shadow-[0px_4px_4px_0px_#00000040] bg-white flex flex-col overflow-hidden flex-shrink-0 w-[260px] min-w-[260px]"
            >
              <div
                style={{
                      backgroundImage: `linear-gradient(to right, rgba(${patientCard.rgbColorCode},.8)), url('/assets/sectionHeaderBG.png')`,
                }}
                className={`h-[87.2px] bg-cover bg-no-repeat`}
              ></div>
              <div className="pb-5 flex flex-col items-center px-5">
                <div
                  style={{
                    borderWidth: "3px",
                        borderColor: `rgb(${patientCard.rgbColorCode})`,
                  }}
                  className="size-[80px] -mt-10 rounded-full mb-[10px] flex items-center justify-center overflow-hidden"
                >
                  <Image
                        src={patientCard.picture}
                    width={80}
                    height={80}
                        alt={`${patientCard.firstName} ${patientCard.lastName} photo`}
                        className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-medium text-sm text-black">
                      {`${patientCard.firstName || ""} ${patientCard.lastName || ""}`.trim() || "Unknown Patient"}
                </h3>
                <p
                      style={{ color: `rgb(${patientCard.rgbColorCode})` }}
                  className="font-medium text-xs text-center mt-2"
                >
                      Patient
                </p>
                {/* Removed ailment/description text from card as requested */}
                    <button
                      type="button"
                      onClick={() => {
                        const patient = patientsTableData.find(p => p.id === patientCard.id);
                        if (patient) goToPatientDetail(patient);
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
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px] px-[27px]">
              <h2 className="font-semibold text-xl text-black">Patient List</h2>
            <Button
              onClick={handleCreatePatientClick}
              className="flex items-center gap-2 font-normal text-base text-white bg-[#003465] hover:bg-[#003465]/90 px-6 h-[40px] rounded"
            >
              Create Patient <Plus size={20} />
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
                <p className="text-lg">Loading patients...</p>
              </div>
            ) : filteredPatients.length > 0 ? (
              <DataTable
                columns={columns as any}
                data={filteredPatients as any}
                onRowClick={(row) => goToPatientDetail(row as PatientDTO)}
              />
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
          </>
        )}
      </div>

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

      <SuccessModal
        open={patientSuccessModal.open}
        onOpenChange={handlePatientSuccessModalClose}
        title="Success"
        message={patientSuccessModal.message}
      />
    </section>
  );
}
