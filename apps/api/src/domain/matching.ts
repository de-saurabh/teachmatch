import { computeSalaryBadge } from "./salary";

export interface MatchJobInput {
  subject: string;
  gradeLevel: string;
  city: string;
  state: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryLeeway: number | null;
}

export interface MatchTeacherInput {
  subjects: string[];
  gradeLevels: string[];
  city: string;
  state: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryLeeway: number | null;
}

const WEIGHT = {
  subject: 0.4,
  gradeLevel: 0.25,
  location: 0.2,
  salary: 0.15,
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

// A subject match is the floor for a candidate to be worth surfacing
// at all — everything else just ranks within that. 0 means "don't
// bother creating a MatchCandidate row for this pair."
export function computeMatchScore(job: MatchJobInput, teacher: MatchTeacherInput): number {
  const subjectMatch = teacher.subjects.some((subject) => normalize(subject) === normalize(job.subject));
  if (!subjectMatch) return 0;

  let score = WEIGHT.subject;

  const gradeMatch = teacher.gradeLevels.some((grade) => normalize(grade) === normalize(job.gradeLevel));
  if (gradeMatch) score += WEIGHT.gradeLevel;

  if (normalize(teacher.city) === normalize(job.city)) {
    score += WEIGHT.location;
  } else if (normalize(teacher.state) === normalize(job.state)) {
    score += WEIGHT.location * 0.5;
  }

  const badge = computeSalaryBadge(
    job.salaryMin != null && job.salaryMax != null
      ? { min: job.salaryMin, max: job.salaryMax, leeway: job.salaryLeeway ?? 0 }
      : null,
    teacher.salaryMin != null && teacher.salaryMax != null
      ? { min: teacher.salaryMin, max: teacher.salaryMax, leeway: teacher.salaryLeeway ?? 0 }
      : null,
  );
  if (badge === "WITHIN_RANGE") score += WEIGHT.salary;
  else if (badge === "WITHIN_LEEWAY") score += WEIGHT.salary * 0.5;
  else if (badge === null) score += WEIGHT.salary * 0.3; // unknown on one side isn't a strike

  return Math.round(score * 100) / 100;
}
