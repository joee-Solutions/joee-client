import { FormDataStepper } from "@/components/Org/Patients/PatientStepper";

/**
 * Validate required fields before saving to API
 */
export function validateRequiredFields(formData: FormDataStepper): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check patient name (firstName and lastName)
  if (!formData.demographic?.firstName || formData.demographic.firstName.trim() === '') {
    errors.push('First name is required');
  }
  if (!formData.demographic?.lastName || formData.demographic.lastName.trim() === '') {
    errors.push('Last name is required');
  }
  
  // Check sex/gender
  if (!formData.demographic?.sex || formData.demographic.sex.trim() === '') {
    errors.push('Gender is required');
  }
  
  // Check email
  if (!formData.addDemographic?.email || formData.addDemographic.email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.addDemographic.email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Check address
  if (!formData.addDemographic?.address || formData.addDemographic.address.trim() === '') {
    errors.push('Address is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get the step index for the first step with missing required data
 */
export function getFirstStepWithMissingData(formData: FormDataStepper): number {
  if (!formData.demographic?.firstName || !formData.demographic?.lastName || !formData.demographic?.sex) {
    return 0; // Demographics step
  }
  if (!formData.addDemographic?.email || !formData.addDemographic?.address) {
    return 1; // Additional demographics step
  }
  return 0; // Default to first step
}

