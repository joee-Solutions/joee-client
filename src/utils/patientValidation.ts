import { FormDataStepper } from "@/components/Org/Patients/PatientStepper";

/**
 * Validate required fields before saving to API.
 * Only first name and last name (patient demographics) are required.
 */
export function validateRequiredFields(formData: FormDataStepper): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.demographic?.firstName || formData.demographic.firstName.trim() === '') {
    errors.push('First name is required');
  }
  if (!formData.demographic?.lastName || formData.demographic.lastName.trim() === '') {
    errors.push('Last name is required');
  }

  // Email is optional; if provided, validate format
  if (formData.addDemographic?.email && formData.addDemographic.email.trim() !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.addDemographic.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get the step index for the first step with missing required data.
 * Only first name and last name are required (demographics step).
 */
export function getFirstStepWithMissingData(formData: FormDataStepper): number {
  if (!formData.demographic?.firstName?.trim() || !formData.demographic?.lastName?.trim()) {
    return 0; // Demographics step
  }
  return 0;
}

