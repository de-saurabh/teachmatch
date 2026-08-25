import type { ApplicationSource, ApplicationStatus } from "@teachmatch/shared";

export interface SchoolProfile {
  id: string;
  name: string;
  board: string;
  udiseCode: string | null;
  city: string;
  state: string;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  subjects: string[];
  gradeLevels: string[];
  experienceYears: number;
  city: string;
  state: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryLeeway: number | null;
}

export interface MyJobPosting {
  id: string;
  subject: string;
  gradeLevel: string;
  board: string;
  city: string;
  state: string;
  isUrgent: boolean;
  status: "OPEN" | "FILLED" | "CLOSED";
  createdAt: string;
  applicationCount: number;
}

export interface MyApplication {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  jobPosting: {
    id: string;
    subject: string;
    gradeLevel: string;
    board: string;
    city: string;
    state: string;
    schoolName: string;
  };
}

export interface JobPosting {
  id: string;
  subject: string;
  gradeLevel: string;
  board: string;
  city: string;
  state: string;
  isUrgent: boolean;
  status: "OPEN" | "FILLED" | "CLOSED";
  salaryMin: number | null;
  salaryMax: number | null;
  salaryLeeway: number | null;
}

export interface JobApplicant {
  id: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  createdAt: string;
  teacher: {
    fullName: string;
    subjects: string[];
    gradeLevels: string[];
    experienceYears: number;
    city: string;
    state: string;
  };
}
