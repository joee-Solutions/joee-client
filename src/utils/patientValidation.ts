import { FormDataStepper } from "@/components/Org/Patients/PatientStepper";

/**
 * Validate required fields before saving to API.
 * Requires: first name, last name, date of birth (patient demographics).
 */
export function validateRequiredFields(formData: FormDataStepper): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.demographic?.firstName || formData.demographic.firstName.trim() === '') {
    errors.push('First name is required');
  }
  if (!formData.demographic?.lastName || formData.demographic.lastName.trim() === '') {
    errors.push('Last name is required');
  }
  if (!formData.demographic?.dateOfBirth || formData.demographic.dateOfBirth.trim() === '') {
    errors.push('Date of birth is required');
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
 * Missing demographic data => demographics step.
 */
export function getFirstStepWithMissingData(formData: FormDataStepper): number {
  if (
    !formData.demographic?.firstName?.trim() ||
    !formData.demographic?.lastName?.trim() ||
    !formData.demographic?.dateOfBirth?.trim()
  ) {
    return 0; // Demographics step
  }
  return 0;
}

