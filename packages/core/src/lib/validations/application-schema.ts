import { z } from "zod";
import { CITIZENSHIP_STATUSES } from "../citizenship";

// ============================================================
// Step 1: Personal Information
// ============================================================

export const personalInfoSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less"),
  middle_name: z
    .string()
    .max(100, "Middle name must be 100 characters or less")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
      "Please enter a valid US phone number"
    ),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => {
        const date = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 16 && age <= 120;
      },
      { message: "Applicant must be at least 16 years old" }
    ),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;

// ============================================================
// Step 2: Address
// ============================================================

const addressFields = {
  address_line1: z
    .string()
    .min(1, "Street address is required")
    .max(200, "Address must be 200 characters or less"),
  address_line2: z
    .string()
    .max(200, "Address must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be 100 characters or less"),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State must be 100 characters or less"),
  zip_code: z
    .string()
    .min(1, "ZIP code is required")
    .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code (e.g., 30301 or 30301-1234)"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be 100 characters or less"),
};

export const addressSchema = z
  .object({
    ...addressFields,
    same_as_residential: z.boolean().default(false),
    mailing_address_line1: z.string().optional().or(z.literal("")),
    mailing_address_line2: z.string().optional().or(z.literal("")),
    mailing_city: z.string().optional().or(z.literal("")),
    mailing_state: z.string().optional().or(z.literal("")),
    mailing_zip: z.string().optional().or(z.literal("")),
    mailing_country: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.same_as_residential) return true;
      return (
        data.mailing_address_line1 &&
        data.mailing_address_line1.length > 0 &&
        data.mailing_city &&
        data.mailing_city.length > 0 &&
        data.mailing_state &&
        data.mailing_state.length > 0 &&
        data.mailing_zip &&
        data.mailing_zip.length > 0 &&
        data.mailing_country &&
        data.mailing_country.length > 0
      );
    },
    {
      message: "Mailing address is required when different from residential address",
      path: ["mailing_address_line1"],
    }
  );

export type AddressData = z.infer<typeof addressSchema>;

// ============================================================
// Step 3: Program Selection
// ============================================================

export const programSchema = z.object({
  program_id: z.string().min(1, "Please select a program"),
  isa_consent_given: z.boolean().default(false),
  isa_consent_text: z.string().optional(),
  tuition_payment_preference: z
    .enum(["full_payment", "isa", "undecided"])
    .default("undecided"),
});

export type ProgramData = z.infer<typeof programSchema>;

// ============================================================
// Step 4: Identity / KYC
// ============================================================

export const identitySchema = z.object({
  citizenship_status: z.enum(CITIZENSHIP_STATUSES, {
    errorMap: () => ({ message: "Please select your citizenship status" }),
  }),
  citizenship_document_type: z.string().optional(),
  citizenship_document_url: z.string().optional(),
  stripe_identity_session_id: z.string().optional(),
  stripe_identity_status: z.string().optional(),
});

export type IdentityData = z.infer<typeof identitySchema>;

// ============================================================
// Step 5: Review (no additional data — uses combined data)
// ============================================================

// Combined schema for full application validation on submit
export const applicationFormSchema = z.object({
  // Step 1: Personal Info
  first_name: personalInfoSchema.shape.first_name,
  last_name: personalInfoSchema.shape.last_name,
  middle_name: personalInfoSchema.shape.middle_name,
  email: personalInfoSchema.shape.email,
  phone: personalInfoSchema.shape.phone,
  date_of_birth: personalInfoSchema.shape.date_of_birth,

  // Step 2: Address
  address_line1: z.string().min(1, "Street address is required"),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  mailing_address_line1: z.string().optional().or(z.literal("")),
  mailing_address_line2: z.string().optional().or(z.literal("")),
  mailing_city: z.string().optional().or(z.literal("")),
  mailing_state: z.string().optional().or(z.literal("")),
  mailing_zip: z.string().optional().or(z.literal("")),
  mailing_country: z.string().optional().or(z.literal("")),

  // Step 3: Program
  program_id: z.string().min(1, "Program selection is required"),
  isa_consent_given: z.boolean().default(false),
  isa_consent_text: z.string().optional(),
  tuition_payment_preference: z
    .enum(["full_payment", "isa", "undecided"])
    .default("undecided"),

  // Step 4: Identity
  citizenship_status: z.enum(CITIZENSHIP_STATUSES, {
    errorMap: () => ({ message: "Citizenship status is required" }),
  }),
  citizenship_document_type: z.string().optional(),
  citizenship_document_url: z.string().optional(),
  stripe_identity_session_id: z.string().optional(),
  stripe_identity_status: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

// ============================================================
// Default Values
// ============================================================

export const DEFAULT_FORM_DATA: ApplicationFormData = {
  first_name: "",
  last_name: "",
  middle_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  zip_code: "",
  country: "United States",
  mailing_address_line1: "",
  mailing_address_line2: "",
  mailing_city: "",
  mailing_state: "",
  mailing_zip: "",
  mailing_country: "",
  program_id: "",
  isa_consent_given: false,
  isa_consent_text: "",
  tuition_payment_preference: "undecided",
  citizenship_status: "us_citizen",
  citizenship_document_type: "",
  citizenship_document_url: "",
  stripe_identity_session_id: "",
  stripe_identity_status: "",
};

// ============================================================
// US States
// ============================================================

export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
] as const;
