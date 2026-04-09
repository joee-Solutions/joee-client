import { useCallback, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { FormDataStepper } from "@/components/Org/Patients/PatientStepper";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { getApiErrorMessagesString } from "@/utils/api-error";
import { mapFormDataToPatientDto, normalizePatientData, sanitizePatientPayloadForApi, prepareCreatePayload } from "../utils/patientDataMapper";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { isContactEmailValid, isContactMobileE164Valid } from "@/utils/patientContactValidation";

/** Strip contact_info email/phone so backend never receives invalid values (POST/PATCH). */
function stripInvalidContactFields(payload: any): void {
  const ci = payload?.contact_info;
  if (!ci || typeof ci !== "object") return;
  if (!isContactEmailValid(ci.email)) delete ci.email;
  if (!isContactEmailValid(ci.email_work)) delete ci.email_work;

  const normalizePhoneKey = (key: "phone_number_mobile" | "phone_number_home") => {
    const raw = ci[key];
    if (raw == null || String(raw).trim() === "") {
      delete ci[key];
      return;
    }
    const str = String(raw).trim();
    const e164 = isContactMobileE164Valid(str) ? str : formatPhoneNumber(str);
    if (e164 && isContactMobileE164Valid(e164)) ci[key] = e164;
    else delete ci[key];
  };
  normalizePhoneKey("phone_number_mobile");
  normalizePhoneKey("phone_number_home");
}
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
            position: "top-right"
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
          
          let payload = sanitizePatientPayloadForApi(mappedData);
          stripInvalidContactFields(payload);
          if (!patientId) {
            payload = prepareCreatePayload(payload, formData);
          }
          let response;
          if (patientId) {
            // Update existing patient
            response = await processRequestOfflineAuth(
              "patch",
              API_ENDPOINTS.UPDATE_PATIENT(patientId),
              payload
            );
          } else {
            // Check if patient with this email already exists before creating
            const patientEmail = formData.addDemographic?.email;
            if (patientEmail) {
              try {
                // Fetch all patients to check for duplicate email
                const allPatientsResponse = await processRequestOfflineAuth(
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
                    position: "top-right"
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
            response = await processRequestOfflineAuth(
              "post",
              API_ENDPOINTS.CREATE_PATIENT,
              payload
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

          // Show a single success alert for both create and update
          toast.success("Patient saved successfully", {
            toastId: "save-success",
            autoClose: 2000,
            position: "top-right",
          });
          setHasUnsavedChanges(false);
          setIsSavedToAPI(true); // Mark as saved to API
          setError(null);
          
          // For edit mode, keep the form open after success.
          // Only fire external "save complete" callbacks for new patient creation flows.
          const wasCreateOperation = !patientId;
          if (onSaveSuccess && wasCreateOperation) {
            setTimeout(() => {
              onSaveSuccess();
            }, 500);
          }
        } catch (error: any) {
          console.error("Failed to save to API:", error);
          const errorText = getApiErrorMessagesString(error, "Failed to save to server.");
          const lower = errorText.toLowerCase();
          const hasContactValidationError =
            lower.includes("contact_info.email must be an email") ||
            lower.includes("contact_info.phone_number_mobile must be a valid phone number");
          if (lower.includes("date_of_birth must be a valid iso 8601 date string")) {
            toast.error("Date of birth is required and must be a valid date. Data saved locally.", {
              toastId: "save-api-error-dob",
              autoClose: 7000,
              position: "top-right",
            });
          } else if (
            lower.includes("request entity too large") ||
            lower.includes("payload too large") ||
            String(error?.response?.status) === "413"
          ) {
            toast.error(
              "Image size too large for Upload Patient Image. Please upload a smaller image.",
              {
                toastId: "save-api-error-image-too-large",
                autoClose: 7000,
                position: "top-right",
              }
            );
          } else if (hasContactValidationError) {
            toast.error(
              "Contact info is invalid. Enter a valid email and mobile phone (e.g. +12345678901), or clear those fields.",
              {
                toastId: "save-api-error-contact-info",
                autoClose: 7000,
                position: "top-right",
              }
            );
          } else {
            toast.error(`${errorText} Data saved locally.`, { 
              toastId: "save-api-error",
              autoClose: 7000,
              position: "top-right",
            });
          }
          setError(errorText);
        } finally {
          setLoading(false);
        }
      }
      
      // Keep auto-save silent to avoid frequent toast noise while typing.
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
        position: "top-right"
      });
      return;
    }

    const formData = methods.getValues();
    const validation = validateRequiredFields(formData);
    
    if (!validation.isValid) {
      const errorMessage = `Cannot save: Please fill in required fields:\n\n${validation.errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n')}\n\nRequired: First Name and Last Name (Patient Demographics).`;
      toast.error(errorMessage, { 
        toastId: "save-validation-error",
        autoClose: 7000,
        position: "top-right"
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
    
    const subscription = methods.watch(() => {
      // Clear previous timeout
      clearTimeout(timeoutId);
      setHasUnsavedChanges(true);
      
      // Debounce auto-save to avoid too frequent saves
      timeoutId = setTimeout(() => {
        saveToLocalStorage(false);
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
          saveToLocalStorage(false);
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

