"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientDemoSchema } from "./PersonalInformation/PatientDemographicsForm";
import { addionalDemoSchema } from "./PersonalInformation/Additionaldemographics";
import { childrenSchema } from "./PersonalInformation/ChildrenInformation";
import { emergencySchema } from "./PersonalInformation/EmergencyContact";
import { patientStatusSchema } from "./MedicalInformation/PatientStatus";
import { allergySchema } from "./MedicalInformation/AllergyInformation";
import { medHistorySchema } from "./MedicalInformation/MedicalHhistory";
import { surgeryHistorySchema } from "./MedicalInformation/SurgeryInformation";
import { immunizationHistorySchema } from "./MedicalInformation/ImmunizationHistory";
import { famHistorySchema } from "./MedicalInformation/FamilyHistory";
import { lifestyleSchema } from "./MedicalInformation/SocialHistory";
import { useRouter, usePathname } from "next/navigation";
import { Check, ChevronRight, ArrowLeft, RotateCcw } from "lucide-react";
import { cn, formatDateLocal } from "@/lib/utils";
import useSWR from "swr";
import { authFectcher } from "@/hooks/swr";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePatientForm } from "../../../hooks/usePatientForm";

// Import form components
import PatientDemographicsForm from "./PersonalInformation/PatientDemographicsForm";
import AdditionalDemographics from "./PersonalInformation/Additionaldemographics";
import ChildrenInformation from "./PersonalInformation/ChildrenInformation";
import EmergencyContact from "./PersonalInformation/EmergencyContact";
import PatientStatus from "./MedicalInformation/PatientStatus";
import AllergyInformation from "./MedicalInformation/AllergyInformation";
import MedicalHistoryForm from "./MedicalInformation/MedicalHhistory";
import SurgeryHistoryForm from "./MedicalInformation/SurgeryInformation";
import ImmunizationForm from "./MedicalInformation/ImmunizationHistory";
import FamilyHistoryForm from "./MedicalInformation/FamilyHistory";
import LifestyleForm from "./MedicalInformation/SocialHistory";
import VitalSignsForm, { vitalSignsSchema } from "./MedicalInformation/VitalsForm";
import MedicalSymptomForm, { reviewOfSystemSchema } from "./MedicalInformation/ReviewOfSystem";
import MedicalSymptomsForm, { additionalReviewSchema } from "./MedicalInformation/AdditionalReview";
import MedicationForm, { prescriptionSchema } from "./MedicalInformation/Prescriptions";
import MedicalVisitForm, { visitEntrySchema } from "./MedicalInformation/Visit";
import DiagnosisHistoryForm, { diagnosisHistorySchema } from "./MedicalInformation/DiagnosisHistory";
import { toast } from "react-toastify";


export const formSchema = z.object({
  demographic: PatientDemoSchema,
  addDemographic: addionalDemoSchema,
  children: childrenSchema,
  emergency: emergencySchema,
  patientStatus: patientStatusSchema,
  allergies: allergySchema,
  medHistory: medHistorySchema,
  diagnosisHistory: diagnosisHistorySchema,
  surgeryHistory: surgeryHistorySchema,
  immunizationHistory: immunizationHistorySchema,
  famhistory: famHistorySchema,
  lifeStyle: lifestyleSchema,
  visits: visitEntrySchema,
  prescriptions: prescriptionSchema,
  vitalSigns: vitalSignsSchema,
  reviewOfSystem: reviewOfSystemSchema,
  additionalReview: additionalReviewSchema,
}).partial();

export type FormDataStepper = z.infer<typeof formSchema>;

const steps = [
  // Personal Information Steps
  {
    id: "demographics",
    title: "Patient Demographics",
    description: "Basic patient information",
    component: PatientDemographicsForm,
    category: "personal",
  },
  {
    id: "additional-demographics",
    title: "Additional Demographics",
    description: "Additional patient details",
    component: AdditionalDemographics,
    category: "personal",
  },
  {
    id: "children-info",
    title: "Children Information",
    description: "Information for patients under 18",
    component: ChildrenInformation,
    category: "personal",
  },
  {
    id: "emergency-contact",
    title: "Emergency Contact",
    description: "Emergency contact information",
    component: EmergencyContact,
    category: "personal",
  },
  // Medical Information Steps
  {
    id: "allergies",
    title: "Allergies",
    description: "Patient allergy information",
    component: AllergyInformation,
    category: "medical",
  },
  {
    id: "medical-history",
    title: "Medication History",
    description: "Medication history",
    component: MedicalHistoryForm,
    category: "medical",
  },
  {
    id: "diagnosis-history",
    title: "Diagnosis History",
    description: "Diagnosis and medical conditions",
    component: DiagnosisHistoryForm,
    category: "medical",
  },
  {
    id: "surgery-history",
    title: "Surgery History",
    description: "Surgery and procedures history",
    component: SurgeryHistoryForm,
    category: "medical",
  },
  {
    id: "immunization-history",
    title: "Immunization History",
    description: "Vaccination history",
    component: ImmunizationForm,
    category: "medical",
  },
  {
    id: "family-history",
    title: "Family History",
    description: "Family medical history",
    component: FamilyHistoryForm,
    category: "medical",
  },
  {
    id: "social-history",
    title: "Social History",
    description: "Lifestyle and social information",
    component: LifestyleForm,
    category: "medical",
  },
  {
    id: "vitals",
    title: "Vital Signs",
    description: "Patient vital signs and measurements",
    component: VitalSignsForm,
    category: "medical",
  },
  {
    id: "review-system",
    title: "Review of System",
    description: "System review and symptoms assessment",
    component: MedicalSymptomForm,
    category: "medical",
  },
  {
    id: "additional-review",
    title: "Additional Review",
    description: "Additional system review details",
    component: MedicalSymptomsForm,
    category: "medical",
  },
  {
    id: "prescriptions",
    title: "Prescriptions",
    description: "Current prescriptions and medications",
    component: MedicationForm,
    category: "medical",
  },
  {
    id: "visit",
    title: "Visit Information",
    description: "Visit details and notes",
    component: MedicalVisitForm,
    category: "medical",
  },
  {
    id: "patient-status",
    title: "Patient Status",
    description: "Current patient status",
    component: PatientStatus,
    category: "medical",
  },
];

interface PatientStepperProps {
  slug: string;
  patientId?: number | null;
  onSaveComplete?: () => void;
}

// Helper function to map API patient data to form structure
const mapPatientDataToForm = (patientData: any): Partial<FormDataStepper> => {
  if (!patientData) return {};
  
  const data = patientData?.data || patientData;
  
  // Extract contact_info if it exists
  const contactInfo = data.contact_info || {};
  
  // Extract emergencyInfo if it exists
  const emergencyInfo = data.emergencyInfo || {};
  
  console.log("=== MAPPING PATIENT DATA ===");
  console.log("data:", data);
  console.log("contactInfo:", contactInfo);
  console.log("emergencyInfo:", emergencyInfo);
  
  return {
    demographic: {
      firstName: data.firstname || data.first_name || '',
      lastName: data.lastname || data.last_name || '',
      middleName: data.middlename || data.middle_name || '',
      preferredName: data.preferred_name || '',
      dateOfBirth: data.date_of_birth ? formatDateLocal(new Date(data.date_of_birth)) : '',
      sex: data.sex || data.gender || '',
      suffix: data.suffix || '',
      maritalStatus: data.marital_status || '',
      race: data.race || '',
      ethnicity: data.ethnicity || '',
      preferredLanguage: data.preferred_language || '',
      interpreterRequired: data.interpreter_required ? (data.interpreter_required === true || data.interpreter_required === 'Yes' ? 'Yes' : 'No') : '',
      religion: data.religion || '',
      genderIdentity: data.gender_identity || '',
      sexualOrientation: data.sexual_orientation || '',
      patientImage: data.image || data.patient_image || '',
    },
    addDemographic: {
      country: contactInfo.country || data.country || '',
      state: contactInfo.state || data.state || '',
      city: contactInfo.city || data.city || '',
      postal: contactInfo.zip_code || contactInfo.postal_code || data.postal_code || data.postal || '',
      email: contactInfo.email || data.email || '',
      workEmail: contactInfo.email_work || contactInfo.work_email || data.work_email || '',
      homePhone: contactInfo.phone_number_home || contactInfo.phone_number_home || data.phone_number_home || data.home_phone || '',
      mobilePhone: contactInfo.phone_number_mobile || contactInfo.phone_number_mobile || data.phone_number_mobile || data.mobile_phone || data.phone_number || '',
      address: contactInfo.address || data.address || '',
      addressFrom: contactInfo.lived_address_from ? (typeof contactInfo.lived_address_from === 'string' ? formatDateLocal(new Date(contactInfo.lived_address_from)) : formatDateLocal(contactInfo.lived_address_from)) : (data.lived_address_from ? (typeof data.lived_address_from === 'string' ? formatDateLocal(new Date(data.lived_address_from)) : formatDateLocal(data.lived_address_from)) : ''),
      addressTo: contactInfo.lived_address_to ? (typeof contactInfo.lived_address_to === 'string' ? formatDateLocal(new Date(contactInfo.lived_address_to)) : formatDateLocal(contactInfo.lived_address_to)) : (data.lived_address_to ? (typeof data.lived_address_to === 'string' ? formatDateLocal(new Date(data.lived_address_to)) : formatDateLocal(data.lived_address_to)) : ''),
      currentAddress: contactInfo.current_address || data.current_address || '',
      contactMethod: contactInfo.method_of_contact || contactInfo.contact_method || data.contact_method || data.method_of_contact || '',
      livingSituation: contactInfo.current_living_situation || contactInfo.living_situation || data.living_situation || data.current_living_situation || '',
      referralSource: contactInfo.referral_source || data.referral_source || '',
      occupationStatus: contactInfo.occupational_status || contactInfo.occupation_status || data.occupation_status || data.occupational_status || '',
      industry: contactInfo.industry || data.industry || '',
      householdSize: contactInfo.household_size || data.household_size || '',
      notes: contactInfo.notes || data.notes || '',
    },
    emergency: emergencyInfo.emergency_contact_name || data.emergencyInfo ? {
      name: emergencyInfo.emergency_contact_name || data.emergencyInfo?.emergency_contact_name || '',
      phone: emergencyInfo.emergency_contact_phone_number || emergencyInfo.emergency_contact_phone || data.emergencyInfo?.emergency_contact_phone_number || data.emergencyInfo?.emergency_contact_phone || '',
      email: emergencyInfo.emergency_contact_email || data.emergencyInfo?.emergency_contact_email || '',
      relationship: emergencyInfo.emergency_contact_relationship || data.emergencyInfo?.emergency_contact_relationship || '',
      permission: emergencyInfo.contact_emergency_contact === true || emergencyInfo.permission_to_contact === true || emergencyInfo.permission_to_contact === 'Yes' || data.emergencyInfo?.contact_emergency_contact === true || data.emergencyInfo?.permission_to_contact === true || data.emergencyInfo?.permission_to_contact === 'Yes' ? 'Yes' : 'No',
    } : undefined,
    children: data.guardian_info ? {
      fullName: data.guardian_info.Guardian_full_name || data.guardian_info.guardian_full_name || '',
      email: data.guardian_info.Guardian_email || data.guardian_info.guardian_email || '',
      phone: data.guardian_info.Guardian_phone_number || data.guardian_info.guardian_phone_number || '',
      relationship: data.guardian_info.Guardian_relationship || data.guardian_info.guardian_relationship || '',
      sex: data.guardian_info.Guardian_sex || data.guardian_info.guardian_sex || '',
    } : undefined,
    allergies: data.allergies || [],
    medHistory: data.medHistory || data.medicalHistories || data.medical_history || [],
    diagnosisHistory: data.diagnosisHistory || data.diagnosis_history || [],
    surgeryHistory: data.surgeryHistory || data.surgeries || data.surgery_history || [],
    immunizationHistory: data.immunizationHistory || data.immunizations || data.immunization_history || [],
    famhistory: data.famhistory || data.familyHistory || data.family_history || [],
    visits: data.visits || [],
    prescriptions: data.prescriptions || [],
    // Transform vitals object back to vitalSigns array
    vitalSigns: (() => {
      if (data.vitalSigns && Array.isArray(data.vitalSigns)) {
        return data.vitalSigns;
      }
      if (data.vital_signs && Array.isArray(data.vital_signs)) {
        return data.vital_signs;
      }
      // Backend returns vitals as object, transform to array
      if (data.vitals && typeof data.vitals === 'object') {
        const vitals = data.vitals;
        return [{
          id: vitals.id || undefined,
          date: vitals.date || formatDateLocal(new Date()),
          temperature: vitals.temperature || "",
          systolic: vitals.blood_pressure_systolic || "",
          diastolic: vitals.blood_pressure_diastolic || "",
          heartRate: vitals.heart_rate || "",
          respiratoryRate: vitals.respiratory_rate || "",
          oxygenSaturation: vitals.oxygen_saturation || "",
          glucose: vitals.glucose || "",
          height: vitals.height ? String(vitals.height) : "",
          weight: vitals.weight ? String(vitals.weight) : "",
          bmi: vitals.bmi ? String(vitals.bmi) : "",
          painScore: vitals.pain_score ? String(vitals.pain_score) : "",
        }];
      }
      return [];
    })(),
    patientStatus: data.patientStatus || data.status ? {
      dischargeEntries: (data.patientStatus || data.status)?.dischargeEntries || (data.patientStatus || data.status)?.discharge_entries || []
    } : { dischargeEntries: [] },
    // Transform reviewOfSystems nested structure back to reviewOfSystem flat structure
    reviewOfSystem: (() => {
      if (data.reviewOfSystem && typeof data.reviewOfSystem === 'object') {
        return data.reviewOfSystem;
      }
      if (data.review_of_system && typeof data.review_of_system === 'object') {
        return data.review_of_system;
      }
      // Backend returns reviewOfSystems as nested object, transform to flat structure
      if (data.reviewOfSystems && typeof data.reviewOfSystems === 'object') {
        const ros = data.reviewOfSystems;
        return {
          // Neurological
          headaches: ros.neurological?.headache || false,
          dizziness: ros.neurological?.dizziness || false,
          numbnessWeakness: ros.neurological?.weakness || false,
          seizures: ros.neurological?.seizures || false,
          neurologicalDetails: ros.neurological?.notes || "",
          // Psychiatric
          depression: ros.psychiatric?.depression || false,
          anxiety: ros.psychiatric?.anxiety || false,
          sleepingDisturbances: ros.psychiatric?.sleeping_disturbance || false,
          psychiatricDetails: ros.psychiatric?.notes || "",
          // Endocrine
          heatColdIntolerance: ros.endocrine?.heat_cold_intolerance || false,
          excessiveThirstHunger: ros.endocrine?.excessive_thirst_hunger || false,
          endocrineDetails: ros.endocrine?.notes || "",
          // Haematologic/Lymphatic
          easyBruising: ros.haematologic_lymphatic?.easy_bruising || false,
          bleedingTendencies: ros.haematologic_lymphatic?.bleeding_tendencies || false,
          haematologicDetails: ros.haematologic_lymphatic?.notes || "",
          // Allergic/Immunologic
          frequentInfections: ros.allergic_immunologic?.frequent_infections || false,
          allergicReactions: ros.allergic_immunologic?.allergic_reactions || false,
          allergicDetails: ros.allergic_immunologic?.notes || "",
          // Genitourinary (if exists in backend)
          urinaryFrequency: ros.genitourinary?.urinary_frequency || false,
          dysuria: ros.genitourinary?.dysuria || false,
          incontinence: ros.genitourinary?.incontinence || false,
          genitourinaryDetails: ros.genitourinary?.notes || "",
          // Musculoskeletal (if exists in backend)
          jointPain: ros.musculoskeletal?.joint_pain || false,
          muscleWeakness: ros.musculoskeletal?.muscle_weakness || false,
          stiffness: ros.musculoskeletal?.stiffness || false,
          musculoskeletalDetails: ros.musculoskeletal?.notes || "",
        };
      }
      return {};
    })(),
    // Transform additionalReview nested structure back to form structure
    additionalReview: data.additionalReview ? {
      psychiatric: data.additionalReview.psychiatric ? {
        depression: data.additionalReview.psychiatric.depression || false,
        anxiety: data.additionalReview.psychiatric.anxiety || false,
        sleepingDisturbances: data.additionalReview.psychiatric.sleeping_disturbance || false,
        details: data.additionalReview.psychiatric.notes || "",
      } : undefined,
      endocrine: data.additionalReview.endocrine ? {
        heatColdIntolerance: data.additionalReview.endocrine.heat_cold_intolerance || false,
        excessiveThirstHunger: data.additionalReview.endocrine.excessive_thirst_hunger || false,
        details: data.additionalReview.endocrine.notes || "",
      } : undefined,
      haematologic: data.additionalReview.haematologic ? {
        easyBruising: data.additionalReview.haematologic.easy_bruising || false,
        bleedingTendencies: data.additionalReview.haematologic.bleeding_tendencies || false,
        details: data.additionalReview.haematologic.notes || "",
      } : undefined,
      allergic: data.additionalReview.allergic ? {
        frequentInfections: data.additionalReview.allergic.frequent_infections || false,
        allergicReactions: data.additionalReview.allergic.allergic_reactions || false,
        details: data.additionalReview.allergic.notes || "",
      } : undefined,
    } : undefined,
    // Transform socialHistory back to lifeStyle structure
    lifeStyle: (() => {
      if (data.lifeStyle && typeof data.lifeStyle === 'object') {
        return data.lifeStyle;
      }
      if (data.lifestyle && typeof data.lifestyle === 'object') {
        return data.lifestyle;
      }
      // Backend returns socialHistory, transform to lifeStyle
      if (data.socialHistory && typeof data.socialHistory === 'object') {
        const sh = data.socialHistory;
        return {
          tobaccoUse: sh.tobacco_use || "",
          tobaccoQuantity: sh.tobacco_quantity ? String(sh.tobacco_quantity) : "",
          tobaccoDuration: sh.years ? String(sh.years) : "",
          alcoholUse: sh.alcohol_use || "",
          alcoholInfo: sh.alcohol_info || "",
          drugUse: sh.illicit_drugs === true ? "yes" : (sh.illicit_drugs === false ? "no" : ""),
          drugInfo: sh.illicit_drugs_info || "",
          dietExercise: sh.diet_and_exercise || "",
          dietExerciseInfo: sh.diet_and_exercise_info || "",
          partners: sh.partners || "",
          protection: sh.protection || "",
          comment: sh.comment || sh.notes || "",
        };
      }
      if (data.social_history && typeof data.social_history === 'object') {
        const sh = data.social_history;
        return {
          tobaccoUse: sh.tobacco_use || "",
          tobaccoQuantity: sh.tobacco_quantity ? String(sh.tobacco_quantity) : "",
          tobaccoDuration: sh.years ? String(sh.years) : "",
          alcoholUse: sh.alcohol_use || "",
          alcoholInfo: sh.alcohol_info || "",
          drugUse: sh.illicit_drugs === true ? "yes" : (sh.illicit_drugs === false ? "no" : ""),
          drugInfo: sh.illicit_drugs_info || "",
          dietExercise: sh.diet_and_exercise || "",
          dietExerciseInfo: sh.diet_and_exercise_info || "",
          partners: sh.partners || "",
          protection: sh.protection || "",
          comment: sh.comment || sh.notes || "",
        };
      }
      return {};
    })(),
  };
};

export default function PatientStepper({ slug, patientId: propPatientId, onSaveComplete }: PatientStepperProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(propPatientId || null);
  const [isSavedToAPI, setIsSavedToAPI] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Detect if this is a new patient page (not edit mode)
  const isNewPatient = pathname?.includes('/patients/new') || pathname?.endsWith('/new');
  
  // Extract patient ID from URL if editing (e.g., /patients/[patientId]/edit)
  // Or use propPatientId if provided (for modal edit)
  useEffect(() => {
    if (propPatientId) {
      setPatientId(propPatientId);
    } else if (!isNewPatient && pathname) {
      const patientIdMatch = pathname.match(/\/patients\/(\d+)/);
      if (patientIdMatch) {
        setPatientId(Number(patientIdMatch[1]));
      }
    }
  }, [pathname, isNewPatient, propPatientId]);

  // Fetch patient data if patientId is provided (for edit mode)
  const { data: patientData, isLoading: isLoadingPatient, error: patientDataError } = useSWR(
    patientId ? API_ENDPOINTS.GET_PATIENT(patientId) : null,
    authFectcher
  );

  // Debug logging
  console.log("=== PATIENT STEPPER DEBUG ===");
  console.log("patientId:", patientId);
  console.log("slug:", slug);
  console.log("patientData:", patientData);
  console.log("isLoadingPatient:", isLoadingPatient);
  console.log("patientDataError:", patientDataError);
  console.log("API Endpoint:", patientId ? API_ENDPOINTS.GET_PATIENT(patientId) : "null");

  const methods = useForm<FormDataStepper>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      patientStatus: {
        dischargeEntries: []
      },
      allergies: [],
      medHistory: [],
      diagnosisHistory: [],
      surgeryHistory: [],
      immunizationHistory: [],
      famhistory: [],
      visits: [],
      prescriptions: [],
      vitalSigns: [],
      reviewOfSystem: {},
      additionalReview: {},
    }
  });

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  // Track if patient data has been loaded to prevent re-loading
  const patientDataLoadedRef = useRef<number | null>(null);

  // Load patient data into form when fetched
  useEffect(() => {
    // Reset ref when patientId changes (including when modal opens with new patientId)
    if (patientId !== patientDataLoadedRef.current) {
      patientDataLoadedRef.current = null;
    }

    if (patientData && patientId && !isLoadingPatient && patientDataLoadedRef.current !== patientId) {
      patientDataLoadedRef.current = patientId;
      
      console.log("=== LOADING PATIENT DATA ===");
      console.log("patientData:", patientData);
      
      // Try different response structures
      let actualData = patientData;
      if (patientData?.data?.data) {
        actualData = patientData.data.data;
        console.log("Using patientData.data.data");
      } else if (patientData?.data) {
        actualData = patientData.data;
        console.log("Using patientData.data");
      } else {
        console.log("Using patientData directly");
      }
      
      console.log("actualData:", actualData);
      
      const mappedData = mapPatientDataToForm(actualData);
      console.log("mappedData:", mappedData);
      console.log("mappedData keys:", Object.keys(mappedData || {}));
      
      if (mappedData && Object.keys(mappedData).length > 0) {
        methods.reset(mappedData);
        setIsSavedToAPI(true); // Data is loaded from API, so it's already saved
        setHasUnsavedChanges(false);
        console.log("Patient data loaded successfully into form");
        toast.success("Patient data loaded successfully", { autoClose: 2000 });
      } else {
        console.warn("Mapped data is empty or invalid");
        toast.warning("Patient data structure may be different than expected", { autoClose: 3000 });
      }
    }
    
    if (patientDataError) {
      console.error("=== PATIENT DATA ERROR ===");
      console.error("Error:", patientDataError);
      console.error("patientId:", patientId);
      console.error("slug:", slug);
    }
  }, [patientData, patientId, isLoadingPatient, methods, setIsSavedToAPI, setHasUnsavedChanges]);

  // Use the patient form hook for save and auto-save logic
  const { saveToLocalStorage, handleSave } = usePatientForm({
    methods,
    slug,
    patientId,
            currentStep,
    completedSteps,
    setPatientId,
    setLoading,
    setError,
    setHasUnsavedChanges,
    setIsSavedToAPI,
    setCurrentStep,
    onSaveSuccess: onSaveComplete,
  });
  
  // Update isSavedToAPI when patientId changes or when save succeeds
  useEffect(() => {
    if (patientId && !hasUnsavedChanges) {
      setIsSavedToAPI(true);
    }
  }, [patientId, hasUnsavedChanges]);
  
  // Check if form has any data entered (not just saved to API)
  const hasFormData = useCallback(() => {
    const formData = methods.getValues();
    // Check if any field has been filled
    return !!(
      (formData.demographic?.firstName && formData.demographic.firstName.trim() !== '') ||
      (formData.demographic?.lastName && formData.demographic.lastName.trim() !== '') ||
      (formData.demographic?.dateOfBirth && formData.demographic.dateOfBirth.trim() !== '') ||
      (formData.demographic?.sex && formData.demographic.sex.trim() !== '') ||
      (formData.addDemographic?.email && formData.addDemographic.email.trim() !== '') ||
      (formData.addDemographic?.address && formData.addDemographic.address.trim() !== '') ||
      (formData.allergies && formData.allergies.length > 0) ||
      (formData.medHistory && formData.medHistory.length > 0) ||
      (formData.visits && formData.visits.length > 0) ||
      (formData.prescriptions && formData.prescriptions.length > 0) ||
      (formData.vitalSigns && formData.vitalSigns.length > 0) ||
      (formData.patientStatus?.dischargeEntries && formData.patientStatus.dischargeEntries.length > 0) ||
      Object.keys(formData.reviewOfSystem || {}).some(key => {
        const value = (formData.reviewOfSystem as any)?.[key];
        return value !== undefined && value !== null && value !== '' && value !== false;
      }) ||
      Object.keys(formData.additionalReview || {}).some(key => {
        const value = (formData.additionalReview as any)?.[key];
        return value !== undefined && value !== null && value !== '';
      })
    );
  }, [methods]);
  
  // Navigation warning when user tries to navigate away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there's form data AND it hasn't been saved to API
      const hasData = hasFormData();
      if (hasData && !isSavedToAPI) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Please click "Save" to save your data before leaving.';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasFormData, isSavedToAPI]);
  
  // Intercept navigation attempts (for back button and other navigation)
  const handleNavigationAttempt = useCallback((url: string) => {
    const hasData = hasFormData();
    // Show warning if there's form data AND it hasn't been saved to API
    if (hasData && !isSavedToAPI) {
      setPendingNavigation(url);
      setShowNavigationWarning(true);
      return false; // Prevent navigation
    } else {
      router.push(url);
    }
  }, [hasFormData, isSavedToAPI, router]);
  
  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const hasData = hasFormData();
      if (hasData && !isSavedToAPI) {
        // Prevent back navigation
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        setShowNavigationWarning(true);
        setPendingNavigation(window.location.pathname);
      }
    };
    
    // Push a state to track navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasFormData, isSavedToAPI]);
  
  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      setHasUnsavedChanges(false);
      setShowNavigationWarning(false);
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };
  
  const handleCancelNavigation = () => {
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };

  // Auto-save when step changes
  useEffect(() => {
    saveToLocalStorage();
  }, [currentStep, saveToLocalStorage]);

  // Load from localStorage on mount - only if not a new patient page
  useEffect(() => {
    if (isNewPatient) {
      // For new patient page, clear localStorage and start fresh
      localStorage.removeItem(`patient-${slug}`);
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setPatientId(null);
      methods.reset();
    } else {
      // For existing patient or when returning to form, try to load saved data
      const patientData = localStorage.getItem(`patient-${slug}`);
      if (patientData) {
        try {
        const parsedData = JSON.parse(patientData);
          // Load patient ID if it exists
          if (parsedData.patientId) {
            setPatientId(parsedData.patientId);
            setIsSavedToAPI(true); // If patient ID exists, it was saved to API
          }
          if (parsedData.data) {
        methods.reset(parsedData.data);
            if (parsedData.currentStep !== undefined) {
        setCurrentStep(parsedData.currentStep);
            }
            if (parsedData.completedSteps) {
        setCompletedSteps(new Set(parsedData.completedSteps));
            }
            toast.success("Patient data loaded successfully", { autoClose: 2000 });
          }
        } catch (error) {
          console.error("Failed to load patient data:", error);
        }
      }
    }
  }, [slug, methods, isNewPatient]);

  const handleNext = () => {
    // Save before moving to next step
    saveToLocalStorage();
    
    // Mark current step as completed
    handleStepComplete(currentStep);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    // Save before moving to previous step
    saveToLocalStorage();
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (canProceedToStep(stepIndex)) {
      // Save before navigating to step
      saveToLocalStorage();
      setCurrentStep(stepIndex);
    }
  };

  const canProceedToStep = (stepIndex: number) => {
    // Allow navigation to any step - no forced sequential navigation
    return true;
  };


  // Reset form function
  const handleReset = () => {
    // Reset form to default empty values
    methods.reset({
      patientStatus: {
        dischargeEntries: []
      },
      allergies: [],
      medHistory: [],
      diagnosisHistory: [],
      surgeryHistory: [],
      immunizationHistory: [],
      famhistory: [],
      visits: [],
      prescriptions: [],
      vitalSigns: [],
      reviewOfSystem: {},
      additionalReview: {},
    });
    
    // Clear localStorage
    localStorage.removeItem(`patient-${slug}`);
    
    // Reset state
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setError(null);
    setSuccess(false);
    
    // Close dialog
    setShowResetDialog(false);
    
    toast.success("Patient form has been reset successfully");
  };

  const onSubmit = async (data: FormDataStepper) => {
    // Use handleSave from the hook instead
    await handleSave();
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Steps */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Registration</h2>

          {/* Personal Information Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Personal Information
            </h3>
            {steps.filter(step => step.category === "personal").map((step, index) => {
              const stepIndex = steps.findIndex(s => s.id === step.id);
              const isCompleted = completedSteps.has(stepIndex);
              const isActive = currentStep === stepIndex;
              const canAccess = canProceedToStep(stepIndex);

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center p-3 rounded-lg mb-2 transition-colors",
                    isActive ? "bg-blue-50 border-l-4 border-blue-500" : "",
                    isCompleted && !isActive ? "bg-green-50" : "",
                    canAccess ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => handleStepClick(stepIndex)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium",
                    isCompleted ? "bg-green-500 text-white" :
                      isActive ? "bg-blue-500 text-white" :
                        canAccess ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Medical Information Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Medical Information
            </h3>
            {steps.filter(step => step.category === "medical").map((step, index) => {
              const stepIndex = steps.findIndex(s => s.id === step.id);
              const isCompleted = completedSteps.has(stepIndex);
              const isActive = currentStep === stepIndex;
              const canAccess = canProceedToStep(stepIndex);

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center p-3 rounded-lg mb-2 transition-colors",
                    isActive ? "bg-blue-50 border-l-4 border-blue-500" : "",
                    isCompleted && !isActive ? "bg-green-50" : "",
                    canAccess ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => handleStepClick(stepIndex)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium",
                    isCompleted ? "bg-green-500 text-white" :
                      isActive ? "bg-blue-500 text-white" :
                        canAccess ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : steps.filter(s => s.category === "personal").length + index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto min-h-screen">
        <div className="p-8 max-w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                onClick={() => handleNavigationAttempt(`/dashboard/organization/${slug}/patients`)}
                  className="h-[60px] border border-[#003465] text-[#003465] hover:bg-[#003465] hover:text-white font-medium text-base px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h1>
                <p className="text-gray-600 mt-1">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mt-1">
                {completedSteps.size} of {steps.length} forms completed
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Form Content */}
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Patient added successfully! Redirecting to patients list...
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {CurrentStepComponent ? (
                  <CurrentStepComponent />
                ) : (
                  <div className="text-red-500">
                    Error: Component not found for step {currentStep + 1} - {steps[currentStep]?.title}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  
                  {/* Reset Button with Confirmation Dialog */}
                  <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-[60px] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium text-base px-6"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                          Reset Patient Form
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-600 mt-2">
                          Are you sure you want to reset all patient data? This action will clear all form fields and cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex gap-3 mt-4">
                        <AlertDialogCancel className="h-[50px] border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-base px-6">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReset}
                          className="h-[50px] bg-red-500 hover:bg-red-600 text-white font-medium text-base px-6"
                        >
                          Reset All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex gap-3">
                  {currentStep < steps.length - 1 ? (
                    <>
                      <Button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="font-normal text-base text-white bg-green-600 hover:bg-green-700 h-[60px] px-6 flex items-center"
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 flex items-center"
                    >
                      Next Step
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="font-normal text-base text-white bg-green-600 hover:bg-green-700 h-[60px] px-6 flex items-center"
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <p className="text-xs text-gray-500">Data is auto-saved as you enter information</p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
          
          {/* Navigation Warning Dialog */}
          <AlertDialog open={showNavigationWarning} onOpenChange={setShowNavigationWarning}>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                  Unsaved Changes
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base text-gray-600 mt-2">
                  <p className="mb-3">
                    You have unsaved changes. Please click the <strong>"Save"</strong> button to save your data to the server before leaving. Your data is auto-saved locally, but it won't be saved to the server until you click "Save".
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Required fields before saving:</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                      <li>First Name</li>
                      <li>Last Name</li>
                      <li>Gender</li>
                      <li>Email</li>
                      <li>Address</li>
                    </ul>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-3 mt-4">
                <AlertDialogCancel 
                  onClick={handleCancelNavigation}
                  className="h-[50px] border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-base px-6"
                >
                  Stay on Page
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmNavigation}
                  className="h-[50px] bg-red-500 hover:bg-red-600 text-white font-medium text-base px-6"
                >
                  Leave Without Saving
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
} 