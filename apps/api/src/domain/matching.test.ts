import { describe, expect, it } from "vitest";

import { computeMatchScore } from "./matching";

const job = {
  subject: "Mathematics",
  gradeLevel: "Grade 8",
  city: "Pune",
  state: "Maharashtra",
  salaryMin: 25000,
  salaryMax: 35000,
  salaryLeeway: 2000,
};

const perfectTeacher = {
  subjects: ["Mathematics"],
  gradeLevels: ["Grade 8"],
  city: "Pune",
  state: "Maharashtra",
  salaryMin: 28000,
  salaryMax: 32000,
  salaryLeeway: 0,
};

describe("computeMatchScore", () => {
  it("returns 0 when the subject doesn't match at all", () => {
    const teacher = { ...perfectTeacher, subjects: ["Science"] };
    expect(computeMatchScore(job, teacher)).toBe(0);
  });

  it("matches subjects case-insensitively", () => {
    const teacher = { ...perfectTeacher, subjects: ["mathematics"] };
    expect(computeMatchScore(job, teacher)).toBeGreaterThan(0);
  });

  it("scores highest for a perfect match on every dimension", () => {
    const score = computeMatchScore(job, perfectTeacher);
    expect(score).toBeCloseTo(1, 2);
  });

  it("gives partial credit for a same-state, different-city match", () => {
    const sameState = computeMatchScore(job, { ...perfectTeacher, city: "Nagpur" });
    const sameCity = computeMatchScore(job, perfectTeacher);
    const otherState = computeMatchScore(job, { ...perfectTeacher, city: "Bengaluru", state: "Karnataka" });

    expect(sameState).toBeLessThan(sameCity);
    expect(otherState).toBeLessThan(sameState);
  });

  it("scores lower when the grade level doesn't overlap", () => {
    const noGradeMatch = computeMatchScore(job, { ...perfectTeacher, gradeLevels: ["Grade 3"] });
    expect(noGradeMatch).toBeLessThan(computeMatchScore(job, perfectTeacher));
  });

  it("still scores something when salary is unset on one side, and less for OUTSIDE_RANGE", () => {
    const unset = computeMatchScore(job, { ...perfectTeacher, salaryMin: null, salaryMax: null });
    const outsideRange = computeMatchScore(job, { ...perfectTeacher, salaryMin: 90000, salaryMax: 95000 });

    expect(unset).toBeGreaterThan(outsideRange);
    expect(unset).toBeGreaterThan(0);
  });
});
