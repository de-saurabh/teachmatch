import type { SalaryBadge } from "@teachmatch/shared";

export interface SalaryRange {
  min: number;
  max: number;
  leeway: number;
}

// See pitch doc section 04: neither side's numbers are ever shown,
// just this computed badge. null means one side hasn't set a range.
export function computeSalaryBadge(
  school: SalaryRange | null,
  teacher: SalaryRange | null
): SalaryBadge | null {
  if (!school || !teacher) return null;

  if (school.min <= teacher.max && teacher.min <= school.max) {
    return "WITHIN_RANGE";
  }

  const schoolWithLeeway = { min: school.min - school.leeway, max: school.max + school.leeway };
  const teacherWithLeeway = { min: teacher.min - teacher.leeway, max: teacher.max + teacher.leeway };

  if (schoolWithLeeway.min <= teacherWithLeeway.max && teacherWithLeeway.min <= schoolWithLeeway.max) {
    return "WITHIN_LEEWAY";
  }

  return "OUTSIDE_RANGE";
}
