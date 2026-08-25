// Types shared between apps/api, apps/web, and apps/mobile.
// Kept in sync with apps/api/prisma/schema.prisma by hand for now —
// enum values here must match the Prisma enums exactly.

export type AccountType = "SCHOOL" | "AGENCY" | "TEACHER";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type JobPostingStatus = "OPEN" | "FILLED" | "CLOSED";

export type SwipeDirection = "PENDING" | "LIKE" | "PASS";

export type ApplicationSource = "SEARCH" | "SWIPE_MATCH" | "AGENCY_SUBMITTED";

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export type Permission =
  | "CAN_REVIEW_VERIFICATION"
  | "CAN_REVIEW_REPORTS"
  | "CAN_MANAGE_USERS"
  | "CAN_IMPERSONATE"
  | "CAN_VIEW_ANALYTICS";

export interface JobPostingSummary {
  id: string;
  schoolName: string;
  subject: string;
  gradeLevel: string;
  board: string;
  city: string;
  state: string;
  isUrgent: boolean;
  status: JobPostingStatus;
  salaryBadge: SalaryBadge | null;
  createdAt: string;
}

// Computed comparison result shown instead of raw salary numbers —
// see pitch doc section 04. Only ever computed server-side.
export type SalaryBadge = "WITHIN_RANGE" | "WITHIN_LEEWAY" | "OUTSIDE_RANGE";
