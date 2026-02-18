import { useCallback, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { FormDataStepper } from "@/components/Org/Patients/PatientStepper";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { mapFormDataToPatientDto, normalizePatientData } from "../utils/patientDataMapper";
import { validateRequiredFields, getFirstStepWithMissingData } from "@/utils/patientValidation";

interface UsePatientFormOptions {
  methods: UseFormReturn<FormDataStepper>;
  slug: string;
  patientId: number | null;
  currentStep: number;
  completedSteps: Set<number>;
  setPatientId: (id: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setIsSavedToAPI: (saved: boolean) => void;
  setCurrentStep?: (step: number) => void;
  onSaveSuccess?: () => void;
}

/**
 * Custom hook for patient form management including auto-save and API submission
 */
export function usePatientForm({
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
  onSaveSuccess,
}: UsePatientFormOptions) {
  
  // Save function - saves to localStorage and optionally to API
  const saveToLocalStorage = useCallback(async (showNotification = false, saveToAPI = false) => {
    const formData = methods.getValues();
    try {
      localStorage.setItem(`patient-${slug}`, JSON.stringify({
        currentStep,
        completedSteps: Array.from(completedSteps),
        data: formData,
        patientId: patientId // Store patient ID in localStorage
      }));
      
      if (saveToAPI) {
        // Validate required fields before saving to API
        const validation = validateRequiredFields(formData);
        if (!validation.isValid) {
          toast.error(`Please fill in required fields: ${validation.errors.join(', ')}`, { 
            toastId: "validation-error",
            autoClose: 5000,
            position: "bottom-right"
          });
          setError(validation.errors.join(', '));
          // Navigate to the first step with missing data
          if (setCurrentStep) {
            setCurrentStep(getFirstStepWithMissingData(formData));
          }
          return;
        }
        
        setLoading(true);
        setError(null);
        try {
          // Map and normalize form data for API
          const mappedData = mapFormDataToPatientDto(formData);
          normalizePatientData(mappedData, formData);
          
          let response;
          if (patientId) {
            // Update existing patient
            response = await processRequestAuth(
              "patch",
              API_ENDPOINTS.UPDATE_PATIENT(patientId),
              mappedData
            );
          } else {
            // Check if patient with this email already exists before creating
            const patientEmail = formData.addDemographic?.email;
            if (patientEmail) {
              try {
                // Fetch all patients to check for duplicate email
                const allPatientsResponse = await processRequestAuth(
                  "get",
                  API_ENDPOINTS.GET_PATIENTS
                );
                
                const allPatients = allPatientsResponse?.data?.data || allPatientsResponse?.data || [];
                const existingPatient = Array.isArray(allPatients) 
                  ? allPatients.find((p: any) => 
                      (p.email?.toLowerCase() === patientEmail.toLowerCase()) ||
                      (p.contact_info?.email?.toLowerCase() === patientEmail.toLowerCase())
                    )
                  : null;
                
                if (existingPatient) {
                  toast.error(`A patient with email ${patientEmail} already exists. Please use a different email or edit the existing patient.`, {
                    toastId: "duplicate-email-error",
                    autoClose: 5000,
                    position: "bottom-right"
                  });
                  setError(`Patient with email ${patientEmail} already exists`);
                  setLoading(false);
                  return;
                }
              } catch (checkError) {
                // If check fails, log but continue with creation (might be offline)
                console.warn("Could not check for duplicate email:", checkError);
              }
            }
            
            // Create new patient
            response = await processRequestAuth(
              "post",
              API_ENDPOINTS.CREATE_PATIENT,
              mappedData
            );
            
            // Store the created patient ID
            if (response?.data?.id) {
              setPatientId(response.data.id);
              // Update localStorage with patient ID
              const savedData = localStorage.getItem(`patient-${slug}`);
              if (savedData) {
                const parsed = JSON.parse(savedData);
                parsed.patientId = response.data.id;
                localStorage.setItem(`patient-${slug}`, JSON.stringify(parsed));
              }
            }
          }
          
          toast.success(patientId ? "Patient updated successfully" : "Patient created successfully", { 
            toastId: "save-success",
            autoClose: 2000,
            position: "bottom-right"
          });
          setHasUnsavedChanges(false);
          setIsSavedToAPI(true); // Mark as saved to API
          setError(null);
          
          // Call onSaveSuccess callback if provided
          if (onSaveSuccess) {
            setTimeout(() => {
              onSaveSuccess();
            }, 500);
          }
        } catch (error: any) {
          console.error("Failed to save to API:", error);
          const errorMessage = error?.response?.data?.message || error?.message || "Failed to save to server";
          toast.error(`${errorMessage}. Data saved locally.`, { 
            toastId: "save-api-error",
            autoClose: 4000 
          });
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
      
      if (showNotification && !saveToAPI) {
        toast.success("Data auto-saved", { 
          toastId: "auto-save",
          autoClose: 2000,
          position: "bottom-right"
        });
      }
      // Don't reset hasUnsavedChanges on localStorage save - only on API save
      // This ensures navigation warnings work correctly
    } catch (error) {
      console.error("Failed to save patient data:", error);
      toast.error("Failed to save patient data", { 
        toastId: "auto-save-error",
        autoClose: 3000 
      });
    }
  }, [methods, currentStep, completedSteps, slug, patientId, setPatientId, setLoading, setError, setHasUnsavedChanges, setIsSavedToAPI, setCurrentStep, onSaveSuccess]);

  // Track if save is in progress to prevent multiple simultaneous saves
  const isSavingRef = useRef(false);

  // Manual save handler - validates and saves to API
  const handleSave = useCallback(async () => {
    // Prevent multiple simultaneous saves
    if (isSavingRef.current) {
      toast.info("Save already in progress, please wait...", { 
        toastId: "save-in-progress",
        autoClose: 2000,
        position: "bottom-right"
      });
      return;
    }

    const formData = methods.getValues();
    const validation = validateRequiredFields(formData);
    
    if (!validation.isValid) {
      // Show detailed error message
      const errorMessage = `Cannot save: Please fill in all required fields:\n\n${validation.errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n')}\n\nRequired fields: First Name, Last Name, Gender, Email, and Address.`;
      toast.error(errorMessage, { 
        toastId: "save-validation-error",
        autoClose: 7000,
        position: "bottom-right"
      });
      setError(validation.errors.join(', '));
      // Navigate to the first step with missing data
      if (setCurrentStep) {
        setCurrentStep(getFirstStepWithMissingData(formData));
      }
      return;
    }
    
    isSavingRef.current = true;
    try {
      await saveToLocalStorage(true, true);
    } finally {
      isSavingRef.current = false;
    }
  }, [methods, saveToLocalStorage, setError, setCurrentStep]);

  // Auto-save progress whenever form data changes (on input)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let saveCount = 0;
    
    const subscription = methods.watch(() => {
      // Clear previous timeout
      clearTimeout(timeoutId);
      setHasUnsavedChanges(true);
      
      // Debounce auto-save to avoid too frequent saves
      timeoutId = setTimeout(() => {
        saveCount++;
        // Show notification every 5 saves to avoid spam
        saveToLocalStorage(saveCount % 5 === 0);
      }, 1000); // Save 1 second after last change
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [methods, saveToLocalStorage, setHasUnsavedChanges]);

  // Auto-save on blur (when user clicks out of field)
  useEffect(() => {
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Check if the blurred element is a form input
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        // Small delay to ensure the value is updated in the form
        setTimeout(() => {
          saveToLocalStorage(true); // Show notification on blur
        }, 100);
      }
    };

    // Use capture phase to catch blur events
    document.addEventListener('focusout', handleBlur, true);
    return () => {
      document.removeEventListener('focusout', handleBlur, true);
    };
  }, [saveToLocalStorage]);

  return {
    saveToLocalStorage,
    handleSave,
  };
}

