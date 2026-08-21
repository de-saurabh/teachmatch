import { describe, expect, it } from "vitest";

import { computeSalaryBadge } from "./salary";

describe("computeSalaryBadge", () => {
  it("returns null when either side hasn't set a range", () => {
    expect(computeSalaryBadge(null, { min: 20000, max: 30000, leeway: 0 })).toBeNull();
    expect(computeSalaryBadge({ min: 20000, max: 30000, leeway: 0 }, null)).toBeNull();
  });

  it("returns WITHIN_RANGE when the ranges directly overlap", () => {
    const school = { min: 20000, max: 30000, leeway: 0 };
    const teacher = { min: 25000, max: 35000, leeway: 0 };
    expect(computeSalaryBadge(school, teacher)).toBe("WITHIN_RANGE");
  });

  it("returns WITHIN_LEEWAY when ranges only overlap once leeway is applied", () => {
    const school = { min: 20000, max: 25000, leeway: 2000 };
    const teacher = { min: 28000, max: 32000, leeway: 2000 };
    expect(computeSalaryBadge(school, teacher)).toBe("WITHIN_LEEWAY");
  });

  it("returns OUTSIDE_RANGE when even leeway doesn't bridge the gap", () => {
    const school = { min: 20000, max: 25000, leeway: 500 };
    const teacher = { min: 40000, max: 45000, leeway: 500 };
    expect(computeSalaryBadge(school, teacher)).toBe("OUTSIDE_RANGE");
  });
});
