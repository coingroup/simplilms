/**
 * Citizenship status constants, document requirements,
 * and mismatch detection for the admissions application flow.
 *
 * Two-Layer Verification:
 *   Layer 1: Stripe Identity (verifies identity via document + selfie)
 *   Layer 2: Self-declared status + document type mapping (verified here)
 */

// ============================================================
// Citizenship Status Types
// ============================================================

export const CITIZENSHIP_STATUSES = [
  "us_citizen",
  "permanent_resident",
  "ead",
  "h1b",
  "other",
] as const;

export type CitizenshipStatus = (typeof CITIZENSHIP_STATUSES)[number];

export const CITIZENSHIP_LABELS: Record<CitizenshipStatus, string> = {
  us_citizen: "U.S. Citizen",
  permanent_resident: "U.S. Permanent Resident (Green Card)",
  ead: "Work Authorization (EAD)",
  h1b: "H1B Visa Holder",
  other: "None / Other",
};

// ============================================================
// Document Types
// ============================================================

export const DOCUMENT_TYPES = [
  "us_passport",
  "birth_certificate",
  "green_card",
  "ead_card",
  "visa_page",
  "i797_approval",
  "drivers_license",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  us_passport: "U.S. Passport",
  birth_certificate: "Birth Certificate",
  green_card: "Green Card (Permanent Resident Card)",
  ead_card: "Employment Authorization Document (EAD)",
  visa_page: "Visa Page",
  i797_approval: "I-797 Approval Notice",
  drivers_license: "Driver's License",
  other: "Other Document",
};

// ============================================================
// Required Documents Per Citizenship Status
// ============================================================

/**
 * Maps each citizenship status to the document types that are accepted
 * as proof of that status.
 */
export const REQUIRED_DOCUMENTS: Record<CitizenshipStatus, DocumentType[]> = {
  us_citizen: ["us_passport", "birth_certificate"],
  permanent_resident: ["green_card"],
  ead: ["ead_card"],
  h1b: ["visa_page", "i797_approval"],
  other: ["other"],
};

/**
 * Optional secondary documents that support the declared status
 * but are not required on their own.
 */
export const SECONDARY_DOCUMENTS: Record<CitizenshipStatus, DocumentType[]> = {
  us_citizen: ["drivers_license"],
  permanent_resident: [],
  ead: [],
  h1b: [],
  other: [],
};

// ============================================================
// Mismatch Detection
// ============================================================

export interface MismatchResult {
  hasMismatch: boolean;
  reason?: string;
  severity: "none" | "warning" | "flag";
}

/**
 * Detects mismatches between self-declared citizenship status
 * and the document type uploaded/verified.
 *
 * Returns a mismatch result indicating whether admin review is needed.
 */
export function detectCitizenshipMismatch(
  declaredStatus: CitizenshipStatus | string | null,
  documentType: DocumentType | string | null
): MismatchResult {
  // If either is missing, can't determine
  if (!declaredStatus || !documentType) {
    return {
      hasMismatch: false,
      severity: "none",
    };
  }

  // "other" status is always flagged for admin review
  if (declaredStatus === "other") {
    return {
      hasMismatch: true,
      reason: `Citizenship status is "None / Other" — requires admin review.`,
      severity: "flag",
    };
  }

  // Check if the document type is in the accepted list
  const accepted = REQUIRED_DOCUMENTS[declaredStatus as CitizenshipStatus];
  const secondary = SECONDARY_DOCUMENTS[declaredStatus as CitizenshipStatus];

  if (!accepted) {
    return {
      hasMismatch: true,
      reason: `Unknown citizenship status: ${declaredStatus}`,
      severity: "flag",
    };
  }

  const allAccepted = [...accepted, ...(secondary || [])];

  if (allAccepted.includes(documentType as DocumentType)) {
    return {
      hasMismatch: false,
      severity: "none",
    };
  }

  // Mismatch: document type doesn't match declared status
  const statusLabel =
    CITIZENSHIP_LABELS[declaredStatus as CitizenshipStatus] || declaredStatus;
  const docLabel =
    DOCUMENT_LABELS[documentType as DocumentType] || documentType;

  return {
    hasMismatch: true,
    reason: `Declared status "${statusLabel}" but uploaded "${docLabel}". Expected: ${accepted.map((d) => DOCUMENT_LABELS[d]).join(" or ")}.`,
    severity: "flag",
  };
}

// ============================================================
// File Upload Constants
// ============================================================

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;
export const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

export const STORAGE_BUCKET = "citizenship-documents";

/**
 * Generate the storage path for a citizenship document upload.
 */
export function getDocumentStoragePath(
  prospectId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prospectId}/${timestamp}-${sanitized}`;
}
