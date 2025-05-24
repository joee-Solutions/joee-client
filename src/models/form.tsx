import { z } from "zod";

export const PatientDemographySchema = z.object({
  suffix: z.string({ required_error: "This field is required" }),
  firstName: z.string({ required_error: "This field is required" }),
  lastName: z.string({ required_error: "This field is required" }),
  middleName: z.string({ required_error: "This field is required" }),
  prefferedName: z.string({ required_error: "This field is required" }),
  medicalRecordNumber: z.string({ required_error: "This field is required" }),
  gender: z.string({ required_error: "This field is required" }),
  dob: z.string({ required_error: "This field is required" }),
  maritalStatus: z.string({ required_error: "This field is required" }),
  race: z.string({ required_error: "This field is required" }),
  ethnicity: z.string({ required_error: "This field is required" }),
  preferredLanguage: z.string({ required_error: "This field is required" }),
  interpreterRequired: z.string({ required_error: "This field is required" }),
  religion: z.string({ required_error: "This field is required" }),
  genderIdentity: z.string({ required_error: "This field is required" }),
  sexualOrientation: z.string({ required_error: "This field is required" }),
});

export const PatientAdditionalInfoSchema = z.object({
  country: z.string({ required_error: "This field is required" }),
  city: z.string({ required_error: "This field is required" }),
  email: z
    .string({ required_error: "This field is required" })
    .email("Invalid email address"),
  workEmail: z
    .string({ required_error: "This field is required" })
    .email("Invalid email address")
    .optional(),
  phone: z.object({
    home: z.string({ required_error: "This field is required" }),
    mobile: z.string({ required_error: "This field is required" }),
  }),
  address: z.string({ required_error: "This field is required" }),
  methodOfContact: z.string({ required_error: "This field is required" }),
  currentLivingSituation: z.string({
    required_error: "This field is required",
  }),
  referral: z.string({ required_error: "This field is required" }),
  occupationStatus: z.string({ required_error: "This field is required" }),
  industry: z.string({ required_error: "This field is required" }),
  householdSize: z.string({ required_error: "This field is required" }),
  notes: z.string({ required_error: "This field is required" }),
});

export const PatientEmergencyInfoSchema = z.object({
  name: z.string({ required_error: "This field is required" }),
  phoneNumber: z.string({ required_error: "This field is required" }),
  email: z
    .string({ required_error: "This field is required" })
    .email("Invalid email address"),
  relationship: z.string({ required_error: "This field is required" }),
  permissionToContact: z.string({ required_error: "This field is required" }),
});

export const PatientGuardianSchema = z.object({
  name: z.string({ required_error: "This field is required" }),
  gender: z.string({ required_error: "This field is required" }),
  relationship: z.string({ required_error: "This field is required" }),
  phoneNumber: z.string({ required_error: "This field is required" }),
  email: z
    .string({ required_error: "This field is required" })
    .email("Invalid email address"),
});

export const PersonalInfoSchema = PatientDemographySchema.merge(
  PatientAdditionalInfoSchema
)
  .merge(PatientEmergencyInfoSchema)
  .merge(PatientGuardianSchema);

export type PersonalInfoSchemaType = z.infer<typeof PersonalInfoSchema>;

///////////////////////////////
// Medical Information

export const MedicalStatusAlergySchema = z.object({
  patientStatus: z.string({ required_error: "This field is required" }),
  dischargeDate: z.string({ required_error: "This field is required" }),
  dischargeReason: z.string({ required_error: "This field is required" }),
  allergy: z.object({
    name: z.string({ required_error: "This field is required" }),
    startDate: z.string({ required_error: "This field is required" }),
    endDate: z.string({ required_error: "This field is required" }),
    reaction: z.string({ required_error: "This field is required" }),
    comment: z.string({ required_error: "This field is required" }),
  }),
});

export const MedicationHistorySchema = z.object({
  medical: z.object({
    medicalCondition: z.string({ required_error: "This field is required" }),
    startDate: z.string({ required_error: "This field is required" }),
    endDate: z.string({ required_error: "This field is required" }),
    comment: z.string({ required_error: "This field is required" }),
  }),
  medication: z.object({
    medicationHistory: z.string({ required_error: "This field is required" }),
    startDate: z.string({ required_error: "This field is required" }),
    endDate: z.string({ required_error: "This field is required" }),
    dosage: z.string({ required_error: "This field is required" }),
    frequency: z.string({ required_error: "This field is required" }),
    route: z.string({ required_error: "This field is required" }),
    prescriberName: z.string({ required_error: "This field is required" }),
    comment: z.string({ required_error: "This field is required" }),
  }),
});

export const SurgeryImmunizationHistorySchema = z.object({
  surgeryHistory: z.object({
    type: z.string({ required_error: "This field is required" }),
    date: z.string({ required_error: "This field is required" }),
    additionalInformation: z.string({
      required_error: "This field is required",
    }),
  }),
  immunizationHistory: z.object({
    type: z.string({ required_error: "This field is required" }),
    date: z.string({ required_error: "This field is required" }),
    additionalInformation: z.string({
      required_error: "This field is required",
    }),
  }),
  familyHistory: z.object({
    relative: z.string({ required_error: "This field is required" }),
    condition: z.string({ required_error: "This field is required" }),
    diagnosisAge: z.string({ required_error: "This field is required" }),
    currentAge: z.string({ required_error: "This field is required" }),
  }),
});

export const ReviewAndPrescriptionSchema = z.object({
  review: z.object({
    genitourinary: z.string({ required_error: "This field is required" }),
    musculoskeletal: z.string({ required_error: "This field is required" }),
    neurological: z.string({ required_error: "This field is required" }),
    psychiatric: z.string({
      required_error: "This field is required",
    }),
  }),
  additionalReview: z.object({
    endocrine: z.string({ required_error: "This field is required" }),
    immunologicAllergy: z.string({ required_error: "This field is required" }),
    haematologic: z.string({ required_error: "This field is required" }),
  }),
  prescription: z.object({
    startDate: z.string({ required_error: "This field is required" }),
    endDate: z.string({ required_error: "This field is required" }),
    dosage: z.string({ required_error: "This field is required" }),
    directions: z.string({ required_error: "This field is required" }),
    note: z.string({ required_error: "This field is required" }),
  }),
});

export const SocialHistorySchema = z.object({
  socialHistory: z.object({
    tobaccoUsage: z.string({ required_error: "This field is required" }),
    alcoholUsage: z.string({ required_error: "This field is required" }),
    illicitDrugs: z.string({
      required_error: "This field is required",
    }),
    dietAndExercise: z.string({
      required_error: "This field is required",
    }),
  }),
  sexualHistory: z.object({
    numOfPartners: z.string({ required_error: "This field is required" }),
    protectionUsage: z.string({ required_error: "This field is required" }),
  }),
  familyHistory: z.object({
    relative: z.string({ required_error: "This field is required" }),
    condition: z.string({ required_error: "This field is required" }),
    diagnosisAge: z.string({ required_error: "This field is required" }),
    currentAge: z.string({ required_error: "This field is required" }),
  }),
  vitals: z.object({
    temperature: z.string({ required_error: "This field is required" }),
    heartRate: z.string({ required_error: "This field is required" }),
    systolicBloodPressure: z.string({
      required_error: "This field is required",
    }),
    diastolicBloodPressure: z.string({
      required_error: "This field is required",
    }),
    respiratoryRate: z.string({ required_error: "This field is required" }),
    oxygenSaturation: z.string({ required_error: "This field is required" }),
    glucose: z.string({ required_error: "This field is required" }),
    height: z.string({ required_error: "This field is required" }),
    weight: z.string({ required_error: "This field is required" }),
    painScore: z.string({ required_error: "This field is required" }),
    bmi: z.string({ required_error: "This field is required" }),
  }),
});

export const MedicalInfoSchema = MedicalStatusAlergySchema.merge(
  MedicationHistorySchema
)
  .merge(SurgeryImmunizationHistorySchema)
  .merge(ReviewAndPrescriptionSchema)
  .merge(SocialHistorySchema);

export type MedicalInfoSchemaType = z.infer<typeof MedicalInfoSchema>;

export const MedicalRecordSchema = z.object({
  attachment: z
    .instanceof(File)
    .refine((f) => ["image/jpeg", "image/png"].includes(f.type), {
      message: "Unsupported image file",
    }),
  date: z.date(),
  doctor: z.string({ required_error: "This field is required" }),
  complaint: z.string({ required_error: "This field is required" }),
  diagnosis: z.string({ required_error: "This field is required" }),
  vitalSign: z.string({ required_error: "This field is required" }),
  treatment: z.array(z.string({ required_error: "This field is required" })),
  prescription: z.array(
    z.object({
      drugName: z.string({ required_error: "This field is required" }),
      dosage: z.string({ required_error: "This field is required" }),
      quantity: z.string({ required_error: "This field is required" }),
      instruction: z.string({ required_error: "This field is required" }),
    })
  ),
});

export type MedicalRecordSchemaType = z.infer<typeof MedicalRecordSchema>;
