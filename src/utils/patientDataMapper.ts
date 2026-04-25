import { FormDataStepper } from "@/components/Org/Patients/PatientStepper";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { isContactEmailValid, isContactMobileE164Valid } from "@/utils/patientContactValidation";

function readContactFieldCaseInsensitive(src: Record<string, unknown>, fieldLower: string): string {
  for (const [key, value] of Object.entries(src)) {
    if (key.toLowerCase() !== fieldLower) continue;
    if (value == null) return "";
    return String(value).trim();
  }
  return "";
}

/**
 * Returns a payload safe for POST/PATCH: contact_info is rebuilt so email/phone are only
 * included when valid (backend rejects empty or invalid values).
 */
export function sanitizePatientPayloadForApi<T extends { contact_info?: any; emergencyInfo?: any }>(payload: T): T {
  const out = JSON.parse(JSON.stringify(payload)) as T;

  const parseDateOnlyOrAnyToISO = (raw: unknown): string | undefined => {
    if (raw == null) return undefined;
    const s = String(raw).trim();
    if (!s) return undefined;

    // Backend validation errors mention "ISO 8601 date string".
    // To be safe, normalize to a date-only ISO string (YYYY-MM-DD) instead of full datetime.
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      // Already in YYYY-MM-DD format
      return s;
    }

    const dt = new Date(s);
    if (isNaN(dt.getTime())) return undefined;
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (out.contact_info && typeof out.contact_info === "object") {
    const src = out.contact_info as Record<string, unknown>;
    // Rebuild contact_info: copy all keys except email/phone, then add those only when valid
    const ci: Record<string, unknown> = {};
    const skipCopy = new Set(["email", "email_work", "phone_number_mobile", "phone_number_home"]);
    for (const key of Object.keys(src)) {
      if (skipCopy.has(key.toLowerCase())) continue;
      ci[key] = src[key];
    }
    const email = readContactFieldCaseInsensitive(src, "email");
    if (email && isContactEmailValid(email)) ci.email = email;
    const emailWork = readContactFieldCaseInsensitive(src, "email_work");
    if (emailWork && isContactEmailValid(emailWork)) ci.email_work = emailWork;
    const mobileStr = readContactFieldCaseInsensitive(src, "phone_number_mobile");
    if (mobileStr) {
      const formatted = formatPhoneNumber(mobileStr);
      if (formatted && isContactMobileE164Valid(formatted)) ci.phone_number_mobile = formatted;
    }
    const homeStr = readContactFieldCaseInsensitive(src, "phone_number_home");
    if (homeStr) {
      const formatted = formatPhoneNumber(homeStr);
      if (formatted && isContactMobileE164Valid(formatted)) ci.phone_number_home = formatted;
    }
    // Final guard: never leave invalid values (Nest validates these if the keys exist on PATCH)
    if (ci.email !== undefined && !isContactEmailValid(ci.email)) delete ci.email;
    if (ci.email_work !== undefined && !isContactEmailValid(ci.email_work)) delete ci.email_work;
    if (ci.phone_number_mobile !== undefined && !isContactMobileE164Valid(ci.phone_number_mobile)) delete ci.phone_number_mobile;
    if (ci.phone_number_home !== undefined && !isContactMobileE164Valid(ci.phone_number_home)) delete ci.phone_number_home;
    if (ci.household_size !== undefined) {
      const n = Number(ci.household_size);
      ci.household_size = typeof n === "number" && !isNaN(n) ? n : 0;
    }
    for (const k of ["email", "email_work", "phone_number_mobile", "phone_number_home"] as const) {
      const v = ci[k];
      if (v === null || v === undefined || v === "") delete ci[k];
    }
    out.contact_info = ci;
  }
  if (out.emergencyInfo && typeof out.emergencyInfo === "object") {
    const ec = out.emergencyInfo as Record<string, unknown>;
    const ecEmail = ec.emergency_contact_email != null ? String(ec.emergency_contact_email).trim() : "";
    if (!ecEmail || !isContactEmailValid(ecEmail)) delete ec.emergency_contact_email;
    else ec.emergency_contact_email = ecEmail;
    ec.contact_emergency_contact = ec.contact_emergency_contact === true || ec.contact_emergency_contact === "Yes";
  }

  // Backend expects ISO 8601 date strings for diagnosis onset/end.
  if (Array.isArray((out as any).diagnosisHistory)) {
    (out as any).diagnosisHistory = (out as any).diagnosisHistory.map((row: any) => {
      const next = { ...row };
      const onsetIso = parseDateOnlyOrAnyToISO(next.onsetDate);
      const endIso = parseDateOnlyOrAnyToISO(next.endDate);

      if (onsetIso) next.onsetDate = onsetIso;
      else delete next.onsetDate;

      if (endIso) next.endDate = endIso;
      else delete next.endDate;

      return next;
    });
  }

  return out;
}

/**
 * For CREATE (POST) only: omit sections that are empty so backend does not validate them.
 * Ensures arrays are arrays and vitals numbers are numbers when sections are kept.
 */
export function prepareCreatePayload<T extends Record<string, any>>(
  payload: T,
  formData: FormDataStepper
): T {
  const out = JSON.parse(JSON.stringify(payload)) as T;

  const hasContactData =
    formData.addDemographic &&
    (formData.addDemographic.email?.trim() ||
      formData.addDemographic.workEmail?.trim() ||
      formData.addDemographic.mobilePhone?.trim() ||
      formData.addDemographic.homePhone?.trim() ||
      formData.addDemographic.address?.trim() ||
      formData.addDemographic.city?.trim() ||
      formData.addDemographic.state?.trim() ||
      formData.addDemographic.postal?.trim() ||
      formData.addDemographic.country?.trim());
  if (!hasContactData && out.contact_info) {
    delete out.contact_info;
  }

  const hasEmergencyData =
    formData.emergency &&
    (formData.emergency.name?.trim() ||
      formData.emergency.relationship?.trim() ||
      formData.emergency.email?.trim() ||
      formData.emergency.phone?.trim());
  if (!hasEmergencyData && out.emergencyInfo) {
    delete out.emergencyInfo;
  }

  const hasVitalsData =
    formData.vitalSigns &&
    Array.isArray(formData.vitalSigns) &&
    formData.vitalSigns.length > 0;
  if (!hasVitalsData && out.vitals) {
    delete out.vitals;
  }

  // Backend requires these to be arrays and interpreter_required to be boolean — always set them
  const o = out as Record<string, unknown>;
  o.allergies = Array.isArray(o.allergies) ? o.allergies : [];
  o.diagnosisHistory = Array.isArray(o.diagnosisHistory) ? o.diagnosisHistory : [];
  o.prescriptions = Array.isArray(o.prescriptions) ? o.prescriptions : [];
  o.visits = Array.isArray(o.visits) ? o.visits : [];
  o.immunizations = Array.isArray(o.immunizations) ? o.immunizations : [];
  o.medicalHistory = Array.isArray(o.medicalHistory) ? o.medicalHistory : [];
  o.familyHistory = Array.isArray(o.familyHistory) ? o.familyHistory : [];
  o.surgeries = Array.isArray(o.surgeries) ? o.surgeries : [];

  if (out.vitals && typeof out.vitals === "object") {
    const v = out.vitals as Record<string, unknown>;
    if (v.height !== undefined) v.height = Number(v.height) || 0;
    if (v.weight !== undefined) v.weight = Number(v.weight) || 0;
    if (v.bmi !== undefined) v.bmi = Number(v.bmi) || 0;
    if (v.pain_score !== undefined) v.pain_score = Number(v.pain_score) || 0;
  }

  o.interpreter_required =
    typeof o.interpreter_required === "boolean"
      ? o.interpreter_required
      : formData.demographic?.interpreterRequired === "Yes" ||
        formData.demographic?.interpreterRequired === "true" ||
        false;
  return out;
}

/**
 * Map form data to API DTO format
 */
export function mapFormDataToPatientDto(formData: FormDataStepper) {
  const { 
    demographic, 
    addDemographic, 
    children, 
    emergency, 
    patientStatus, 
    allergies, 
    medHistory, 
    surgeryHistory, 
    immunizationHistory, 
    famhistory, 
    lifeStyle, 
    visits, 
    prescriptions, 
    vitalSigns,
    reviewOfSystem,
    diagnosisHistory,
    additionalReview,
  } = formData;

  // Map to match backend CreatePatientDto structure
  return {
    // Primary info fields - ensure all optional strings are empty strings, not undefined
    suffix: demographic?.suffix || '',
    first_name: demographic?.firstName || '',
    middle_name: demographic?.middleName || '',
    last_name: demographic?.lastName || '',
    preferred_name: demographic?.preferredName || '',
    sex: demographic?.sex || '',
    date_of_birth: demographic?.dateOfBirth ? (() => {
      try {
        // Parse the date string (YYYY-MM-DD) to avoid timezone issues
        const dateStr = demographic.dateOfBirth;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return !isNaN(date.getTime()) ? date.toISOString() : undefined;
        }
        const date = new Date(demographic.dateOfBirth);
        return !isNaN(date.getTime()) ? date.toISOString() : undefined;
      } catch {
        return undefined;
      }
    })() : undefined,
    marital_status: demographic?.maritalStatus || '',
    race: demographic?.race || '',
    ethnicity: demographic?.ethnicity || '',
    // Backend requires boolean; coerce so we never send undefined
    interpreter_required: typeof demographic?.interpreterRequired === "boolean"
      ? demographic.interpreterRequired
      : (demographic?.interpreterRequired === "Yes" || demographic?.interpreterRequired === "true"),
    religion: demographic?.religion || '',
    gender_identity: demographic?.genderIdentity || '',
    sexual_orientation: demographic?.sexualOrientation || '',
    image: demographic?.patientImage && String(demographic.patientImage).trim() !== '' ? String(demographic.patientImage) : null,

    // Contact info - build object without phone numbers first, then conditionally add them
    contact_info: (() => {
      const rawHs = addDemographic?.householdSize;
      const householdSizeNum =
        typeof rawHs === "number" && !isNaN(rawHs) ? rawHs : Number(rawHs);
      const household_size =
        typeof householdSizeNum === "number" && !isNaN(householdSizeNum)
          ? householdSizeNum
          : 0;

      const contactInfo: any = {
        country: addDemographic?.country || "",
        state: addDemographic?.state || "",
        city: addDemographic?.city || "",
        zip_code: addDemographic?.postal || "",
        address: addDemographic?.address || "",
        current_address: addDemographic?.currentAddress || "",
        method_of_contact: addDemographic?.contactMethod || "",
        // Convert date strings to ISO date strings for lived_address_from and lived_address_to
        lived_address_from: addDemographic?.addressFrom ? (() => {
          try {
            const dateStr = addDemographic.addressFrom;
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              return dateStr;
            }
            const date = new Date(addDemographic.addressFrom);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
            return null;
          } catch {
            return null;
          }
        })() : null,
        lived_address_to: addDemographic?.addressTo ? (() => {
          try {
            const dateStr = addDemographic.addressTo;
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              return dateStr;
            }
            const date = new Date(addDemographic.addressTo);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
            return null;
          } catch {
            return null;
          }
        })() : null,
        current_living_situation: addDemographic?.livingSituation || "",
        referral_source: addDemographic?.referralSource || "",
        occupational_status: addDemographic?.occupationStatus || "",
        industry: addDemographic?.industry || "",
        household_size,
        notes: addDemographic?.notes || "",
      };
      // Only add emails if they are non-empty and valid (backend rejects empty string)
      const emailVal = (addDemographic?.email || "").trim();
      if (emailVal && isContactEmailValid(emailVal)) {
        contactInfo.email = emailVal;
      }
      const workEmailVal = (addDemographic?.workEmail || "").trim();
      if (workEmailVal && isContactEmailValid(workEmailVal)) {
        contactInfo.email_work = workEmailVal;
      }
      const mobilePhone = formatPhoneNumber(addDemographic?.mobilePhone);
      if (mobilePhone && isContactMobileE164Valid(mobilePhone)) {
        contactInfo.phone_number_mobile = mobilePhone;
      }

      const homePhone = formatPhoneNumber(addDemographic?.homePhone);
      if (homePhone && isContactMobileE164Valid(homePhone)) {
        contactInfo.phone_number_home = homePhone;
      }
      
      return contactInfo;
    })(),

    // Emergency info - build object without phone number first, then conditionally add it
    emergencyInfo: (() => {
      const emergencyInfo: any = {
        emergency_contact_name: emergency?.name || "",
        emergency_contact_relationship: emergency?.relationship || "",
        // Backend requires boolean
        contact_emergency_contact: emergency?.permission === "Yes",
      };
      
      // Only add email if it's a valid email address
      if (emergency?.email && isContactEmailValid(emergency.email)) {
        emergencyInfo.emergency_contact_email = emergency.email;
      }

      const phone = formatPhoneNumber(emergency?.phone);
      if (phone && isContactMobileE164Valid(phone)) {
        emergencyInfo.emergency_contact_phone_number = phone;
      }
      
      return emergencyInfo;
    })(),

    // Guardian info
    guardian_info: {
      Guardian_full_name: children?.fullName,
      Guardian_email: children?.email,
      Guardian_phone_number: children?.phone,
      Guardian_relationship: children?.relationship,
      Guardian_sex: children?.sex,
    },

    // Medical data arrays (when "Other" is selected, use the typed text as the value)
    allergies: (allergies || []).map((item: any) => ({
      ...item,
      allergy: item?.allergy === "Other" && item?.otherAllergy ? item.otherAllergy : item?.allergy,
    })),
    medicalHistory: medHistory || [],
    diagnosisHistory: (diagnosisHistory || []).map((item: any) => ({
      ...item,
      condition: item?.condition === "Other" && item?.otherCondition ? item.otherCondition : item?.condition,
    })),
    surgeries: surgeryHistory || [],
    immunizations: immunizationHistory || [],
    familyHistory: (famhistory || []).map((item: any) => ({
      ...item,
      conditions: item?.conditions === "Other" && item?.otherConditions ? item.otherConditions : item?.conditions,
    })),
    status: patientStatus || {},
    socailHistory: lifeStyle ? {
      tobacco_use: lifeStyle.tobaccoUse || "",
      tobacco_quantity: lifeStyle.tobaccoQuantity ? Number(lifeStyle.tobaccoQuantity) || 0 : 0,
      years: lifeStyle.tobaccoDuration ? Number(lifeStyle.tobaccoDuration) || 0 : 0,
      alcohol_use: lifeStyle.alcoholUse || "",
      alcohol_info: lifeStyle.alcoholInfo || "",
      illicit_drugs: lifeStyle.drugUse === "yes" ? true : (lifeStyle.drugUse === "no" ? false : undefined),
      illicit_drugs_info: lifeStyle.drugInfo || "",
      diet_and_exercise: lifeStyle.dietExercise || "",
      diet_and_exercise_info: lifeStyle.dietExerciseInfo || "",
      partners: lifeStyle.partners || "",
      protection: lifeStyle.protection || "",
      comment: lifeStyle.comment || "",
      notes: lifeStyle.comment || "",
    } : {},
    visits: (visits || []).map((item: any) => ({
      ...item,
      diagnosis: item?.diagnosis === "Other" && item?.otherDiagnosis ? item.otherDiagnosis : item?.diagnosis,
    })),
    prescriptions: prescriptions || [],
    // Transform vitalSigns array to vitals object (take first/latest entry)
    vitals: (() => {
      if (!vitalSigns || !Array.isArray(vitalSigns) || vitalSigns.length === 0) {
        // Return empty object instead of null - backend expects object or array
        return {
          id: 0,
          temperature: "",
          blood_pressure_systolic: "",
          blood_pressure_diastolic: "",
          heart_rate: "",
          respiratory_rate: "",
          oxygen_saturation: "",
          glucose: "",
          height: 0,
          weight: 0,
          bmi: 0,
          pain_score: 0,
        };
      }
      // Get the most recent vital signs entry (first in sorted array or last added)
      const latest = vitalSigns[0] as any;
      return {
        id: latest?.id || 0,
        temperature: latest.temperature || "",
        blood_pressure_systolic: latest.systolic || "",
        blood_pressure_diastolic: latest.diastolic || "",
        heart_rate: latest.heartRate || "",
        respiratory_rate: latest.respiratoryRate || "",
        oxygen_saturation: latest.oxygenSaturation || "",
        glucose: latest.glucose || "",
        height: latest.height ? Number(latest.height) || 0 : 0,
        weight: latest.weight ? Number(latest.weight) || 0 : 0,
        bmi: latest.bmi ? Number(latest.bmi) || 0 : 0,
        pain_score: latest.painScore ? Number(latest.painScore) || 0 : 0,
      };
    })(),
    // Backend expects reviewOfSystem (singular)
    reviewOfSystem: reviewOfSystem ? {
      neurological: {
        headache: reviewOfSystem.headaches || false,
        dizziness: reviewOfSystem.dizziness || false,
        weakness: reviewOfSystem.numbnessWeakness || false,
        seizures: reviewOfSystem.seizures || false,
        notes: reviewOfSystem.neurologicalDetails || "",
      },
      psychiatric: {
        depression: reviewOfSystem.depression || false,
        anxiety: reviewOfSystem.anxiety || false,
        sleeping_disturbance: reviewOfSystem.sleepingDisturbances || false,
        notes: reviewOfSystem.psychiatricDetails || "",
      },
      endocrine: {
        heat_cold_intolerance: reviewOfSystem.heatColdIntolerance || false,
        excessive_thirst_hunger: reviewOfSystem.excessiveThirstHunger || false,
        notes: reviewOfSystem.endocrineDetails || "",
      },
      haematologic_lymphatic: {
        easy_bruising: reviewOfSystem.easyBruising || false,
        bleeding_tendencies: reviewOfSystem.bleedingTendencies || false,
        notes: reviewOfSystem.haematologicDetails || "",
      },
      allergic_immunologic: {
        frequent_infections: reviewOfSystem.frequentInfections || false,
        allergic_reactions: reviewOfSystem.allergicReactions || false,
        notes: reviewOfSystem.allergicDetails || "",
      },
      genitourinary: {
        urinary_frequency: reviewOfSystem.urinaryFrequency || false,
        dysuria: reviewOfSystem.dysuria || false,
        incontinence: reviewOfSystem.incontinence || false,
        notes: reviewOfSystem.genitourinaryDetails || "",
      },
      musculoskeletal: {
        joint_pain: reviewOfSystem.jointPain || false,
        muscle_weakness: reviewOfSystem.muscleWeakness || false,
        stiffness: reviewOfSystem.stiffness || false,
        notes: reviewOfSystem.musculoskeletalDetails || "",
      },
    } : {},
    // Transform additionalReview nested structure
    additionalReview: additionalReview ? {
      psychiatric: additionalReview.psychiatric ? {
        depression: additionalReview.psychiatric.depression || false,
        anxiety: additionalReview.psychiatric.anxiety || false,
        sleeping_disturbance: additionalReview.psychiatric.sleepingDisturbances || false,
        notes: additionalReview.psychiatric.details || "",
      } : undefined,
      endocrine: additionalReview.endocrine ? {
        heat_cold_intolerance: additionalReview.endocrine.heatColdIntolerance || false,
        excessive_thirst_hunger: additionalReview.endocrine.excessiveThirstHunger || false,
        notes: additionalReview.endocrine.details || "",
      } : undefined,
      haematologic: additionalReview.haematologic ? {
        easy_bruising: additionalReview.haematologic.easyBruising || false,
        bleeding_tendencies: additionalReview.haematologic.bleedingTendencies || false,
        notes: additionalReview.haematologic.details || "",
      } : undefined,
      allergic: additionalReview.allergic ? {
        frequent_infections: additionalReview.allergic.frequentInfections || false,
        allergic_reactions: additionalReview.allergic.allergicReactions || false,
        notes: additionalReview.allergic.details || "",
      } : undefined,
    } : {},
  };
}

/**
 * Normalize mapped data to ensure all required fields are properly formatted
 */
export function normalizePatientData(mappedData: ReturnType<typeof mapFormDataToPatientDto>, formData: FormDataStepper) {
  // Ensure all optional string fields are empty strings, not undefined
  mappedData.suffix = mappedData.suffix || '';
  mappedData.first_name = mappedData.first_name || '';
  mappedData.last_name = mappedData.last_name || '';
  mappedData.middle_name = mappedData.middle_name || '';
  mappedData.preferred_name = mappedData.preferred_name || '';
  mappedData.marital_status = mappedData.marital_status || '';
  mappedData.race = mappedData.race || '';
  mappedData.ethnicity = mappedData.ethnicity || '';
  mappedData.religion = mappedData.religion || '';
  mappedData.gender_identity = mappedData.gender_identity || '';
  mappedData.sexual_orientation = mappedData.sexual_orientation || '';
  
  // Ensure date is in ISO 8601 format (handle empty/invalid dates)
  if (formData.demographic?.dateOfBirth && formData.demographic.dateOfBirth.trim() !== '') {
    try {
      const dateStr = formData.demographic.dateOfBirth;
      // Parse YYYY-MM-DD format directly to avoid timezone issues
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          mappedData.date_of_birth = date.toISOString();
        } else {
          (mappedData as any).date_of_birth = undefined;
        }
      } else {
        const date = new Date(formData.demographic.dateOfBirth);
        if (!isNaN(date.getTime())) {
          mappedData.date_of_birth = date.toISOString();
        } else {
          (mappedData as any).date_of_birth = undefined;
        }
      }
    } catch (e) {
      (mappedData as any).date_of_birth = undefined;
    }
  } else {
    (mappedData as any).date_of_birth = undefined;
  }
  
  // Ensure contact_info fields are properly formatted
  if (mappedData.contact_info) {
    // Ensure all string fields in contact_info are strings
    mappedData.contact_info.country = mappedData.contact_info.country || '';
    mappedData.contact_info.state = mappedData.contact_info.state || '';
    mappedData.contact_info.city = mappedData.contact_info.city || '';
    mappedData.contact_info.zip_code = mappedData.contact_info.zip_code || '';
    // Backend requires email fields to be valid emails if present; omit when empty/invalid
    const ciEmail = (mappedData.contact_info.email || '').trim();
    if (!ciEmail || !isContactEmailValid(ciEmail)) {
      delete mappedData.contact_info.email;
    } else {
      mappedData.contact_info.email = ciEmail;
    }
    const ciWorkEmail = (mappedData.contact_info.email_work || '').trim();
    if (!ciWorkEmail || !isContactEmailValid(ciWorkEmail)) {
      delete mappedData.contact_info.email_work;
    } else {
      mappedData.contact_info.email_work = ciWorkEmail;
    }
    mappedData.contact_info.address = mappedData.contact_info.address || '';
    mappedData.contact_info.current_address = mappedData.contact_info.current_address || '';
    mappedData.contact_info.method_of_contact = mappedData.contact_info.method_of_contact || '';
    mappedData.contact_info.current_living_situation = mappedData.contact_info.current_living_situation || '';
    mappedData.contact_info.referral_source = mappedData.contact_info.referral_source || '';
    mappedData.contact_info.occupational_status = mappedData.contact_info.occupational_status || '';
    mappedData.contact_info.industry = mappedData.contact_info.industry || '';
    mappedData.contact_info.notes = mappedData.contact_info.notes || '';
    
    // Validate and format phone numbers - only include if valid E.164, otherwise remove (backend rejects invalid/empty)
    if (mappedData.contact_info.phone_number_mobile !== undefined && mappedData.contact_info.phone_number_mobile !== null && String(mappedData.contact_info.phone_number_mobile).trim() !== '') {
      const formattedMobile = formatPhoneNumber(String(mappedData.contact_info.phone_number_mobile));
      if (formattedMobile && isContactMobileE164Valid(formattedMobile)) {
        mappedData.contact_info.phone_number_mobile = formattedMobile;
      } else {
        delete mappedData.contact_info.phone_number_mobile;
      }
    } else {
      delete mappedData.contact_info.phone_number_mobile;
    }

    if (mappedData.contact_info.phone_number_home !== undefined) {
      const formattedHome = formatPhoneNumber(mappedData.contact_info.phone_number_home);
      if (formattedHome && isContactMobileE164Valid(formattedHome)) {
        mappedData.contact_info.phone_number_home = formattedHome;
      } else {
        delete mappedData.contact_info.phone_number_home;
      }
    }
    
    // Ensure dates are date strings (YYYY-MM-DD format) or null
    if (mappedData.contact_info.lived_address_from) {
      try {
        if (typeof mappedData.contact_info.lived_address_from === 'string') {
          // Already a string, ensure it's in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(mappedData.contact_info.lived_address_from)) {
            // Already correct format
          } else {
            // Try to parse and format
            const date = new Date(mappedData.contact_info.lived_address_from);
            if (!isNaN(date.getTime())) {
              mappedData.contact_info.lived_address_from = date.toISOString().split('T')[0];
            } else {
              mappedData.contact_info.lived_address_from = null;
            }
          }
        } else if (mappedData.contact_info.lived_address_from instanceof Date) {
          mappedData.contact_info.lived_address_from = mappedData.contact_info.lived_address_from.toISOString().split('T')[0];
        }
      } catch {
        mappedData.contact_info.lived_address_from = null;
      }
    }
    
    if (mappedData.contact_info.lived_address_to) {
      try {
        if (typeof mappedData.contact_info.lived_address_to === 'string') {
          // Already a string, ensure it's in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(mappedData.contact_info.lived_address_to)) {
            // Already correct format
          } else {
            // Try to parse and format
            const date = new Date(mappedData.contact_info.lived_address_to);
            if (!isNaN(date.getTime())) {
              mappedData.contact_info.lived_address_to = date.toISOString().split('T')[0];
            } else {
              mappedData.contact_info.lived_address_to = null;
            }
          }
        } else if (mappedData.contact_info.lived_address_to instanceof Date) {
          mappedData.contact_info.lived_address_to = mappedData.contact_info.lived_address_to.toISOString().split('T')[0];
        }
      } catch {
        mappedData.contact_info.lived_address_to = null;
      }
    }
  }
  
  // Ensure emergencyInfo fields are properly formatted
  if (mappedData.emergencyInfo) {
    mappedData.emergencyInfo.emergency_contact_name = mappedData.emergencyInfo.emergency_contact_name || '';
    mappedData.emergencyInfo.emergency_contact_relationship = mappedData.emergencyInfo.emergency_contact_relationship || '';
    // Backend requires emergency_contact_email to be valid if present; omit when empty/invalid
    const ecEmail = (mappedData.emergencyInfo.emergency_contact_email || '').trim();
    if (!ecEmail || !isContactEmailValid(ecEmail)) {
      delete mappedData.emergencyInfo.emergency_contact_email;
    } else {
      mappedData.emergencyInfo.emergency_contact_email = ecEmail;
    }
  }
  
  // Ensure arrays are arrays (not undefined or null)
  mappedData.medicalHistory = Array.isArray(mappedData.medicalHistory) ? mappedData.medicalHistory : [];
  mappedData.immunizations = Array.isArray(mappedData.immunizations) ? mappedData.immunizations : [];
  mappedData.familyHistory = Array.isArray(mappedData.familyHistory) ? mappedData.familyHistory : [];
  mappedData.surgeries = Array.isArray(mappedData.surgeries) ? mappedData.surgeries : [];
  mappedData.allergies = Array.isArray(mappedData.allergies) ? mappedData.allergies : [];
  mappedData.diagnosisHistory = Array.isArray(mappedData.diagnosisHistory) ? mappedData.diagnosisHistory : [];
  mappedData.visits = Array.isArray(mappedData.visits) ? mappedData.visits : [];
  mappedData.prescriptions = Array.isArray(mappedData.prescriptions) ? mappedData.prescriptions : [];
  // vitalSigns transformed to vitals object - handled in mapFormDataToPatientDto
  
  // Backend Patient model uses "socailHistory" (typo)
  if (!mappedData.socailHistory || typeof mappedData.socailHistory !== 'object') {
    mappedData.socailHistory = {};
  }
  mappedData.socailHistory.tobacco_use = mappedData.socailHistory.tobacco_use || '';
  mappedData.socailHistory.alcohol_use = mappedData.socailHistory.alcohol_use || '';
  mappedData.socailHistory.diet_and_exercise = mappedData.socailHistory.diet_and_exercise || '';
  mappedData.socailHistory.partners = mappedData.socailHistory.partners || '';
  mappedData.socailHistory.protection = mappedData.socailHistory.protection || '';
  mappedData.socailHistory.comment = mappedData.socailHistory.comment || '';
  mappedData.socailHistory.notes = mappedData.socailHistory.notes || '';

  if (!mappedData.reviewOfSystem || typeof mappedData.reviewOfSystem !== 'object') {
    mappedData.reviewOfSystem = {};
  }

  // Ensure reviewOfSystem nested structure has defaults when present
  if (Object.keys(mappedData.reviewOfSystem).length > 0) {
    const defaultNeurological = { headache: false, dizziness: false, weakness: false, seizures: false, notes: "" };
    const defaultPsychiatric = { depression: false, anxiety: false, sleeping_disturbance: false, notes: "" };
    const defaultEndocrine = { heat_cold_intolerance: false, excessive_thirst_hunger: false, notes: "" };
    const defaultHaematologic = { easy_bruising: false, bleeding_tendencies: false, notes: "" };
    const defaultAllergic = { frequent_infections: false, allergic_reactions: false, notes: "" };
    const defaultGenitourinary = { urinary_frequency: false, dysuria: false, incontinence: false, notes: "" };
    const defaultMusculoskeletal = { joint_pain: false, muscle_weakness: false, stiffness: false, notes: "" };

    mappedData.reviewOfSystem.neurological = mappedData.reviewOfSystem.neurological || defaultNeurological;
    mappedData.reviewOfSystem.psychiatric = mappedData.reviewOfSystem.psychiatric || defaultPsychiatric;
    mappedData.reviewOfSystem.endocrine = mappedData.reviewOfSystem.endocrine || defaultEndocrine;
    mappedData.reviewOfSystem.haematologic_lymphatic = mappedData.reviewOfSystem.haematologic_lymphatic || defaultHaematologic;
    mappedData.reviewOfSystem.allergic_immunologic = mappedData.reviewOfSystem.allergic_immunologic || defaultAllergic;
    mappedData.reviewOfSystem.genitourinary = mappedData.reviewOfSystem.genitourinary || defaultGenitourinary;
    mappedData.reviewOfSystem.musculoskeletal = mappedData.reviewOfSystem.musculoskeletal || defaultMusculoskeletal;
  }

  // Always send additionalReview (Patient model expects it)
  if (!mappedData.additionalReview || typeof mappedData.additionalReview !== 'object') {
    mappedData.additionalReview = {};
  }
    if (mappedData.additionalReview.psychiatric) {
      mappedData.additionalReview.psychiatric.notes = mappedData.additionalReview.psychiatric.notes || '';
    }
    if (mappedData.additionalReview.endocrine) {
      mappedData.additionalReview.endocrine.notes = mappedData.additionalReview.endocrine.notes || '';
    }
    if (mappedData.additionalReview.haematologic) {
      mappedData.additionalReview.haematologic.notes = mappedData.additionalReview.haematologic.notes || '';
    }
    if (mappedData.additionalReview.allergic) {
      mappedData.additionalReview.allergic.notes = mappedData.additionalReview.allergic.notes || '';
  }
  
  // Ensure interpreter_required is boolean (default to false if not set)
  if (typeof mappedData.interpreter_required !== 'boolean') {
    mappedData.interpreter_required = formData.demographic?.interpreterRequired === 'Yes' || formData.demographic?.interpreterRequired === 'true' || false;
  }
  
  return mappedData;
}

