import { randomUUID } from "node:crypto";

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";

describe("teacher profile", () => {
  const app = createApp();
  const teacherAgent = request.agent(app);
  const schoolAgent = request.agent(app);

  const teacherEmail = `teacher-${randomUUID()}@example.com`;
  const schoolEmail = `school-${randomUUID()}@example.com`;

  beforeAll(async () => {
    await teacherAgent.post("/api/auth/sign-up/email").send({
      name: "Asha Verma",
      email: teacherEmail,
      password: "supersecret123",
      accountType: "TEACHER",
    });

    await schoolAgent.post("/api/auth/sign-up/email").send({
      name: "Test School Admin",
      email: schoolEmail,
      password: "supersecret123",
      accountType: "SCHOOL",
    });
  });

  it("creates then updates the profile", async () => {
    const createRes = await teacherAgent.put("/api/teacher-profile/me").send({
      fullName: "Asha Verma",
      subjects: ["Mathematics"],
      gradeLevels: ["Grade 6", "Grade 7"],
      experienceYears: 4,
      city: "Pune",
      state: "Maharashtra",
    });
    expect(createRes.status).toBe(200);
    expect(createRes.body.profile.subjects).toEqual(["Mathematics"]);

    const updateRes = await teacherAgent.put("/api/teacher-profile/me").send({
      fullName: "Asha Verma",
      subjects: ["Mathematics", "Science"],
      gradeLevels: ["Grade 6", "Grade 7"],
      experienceYears: 5,
      city: "Pune",
      state: "Maharashtra",
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.profile.subjects).toEqual(["Mathematics", "Science"]);
  });

  it("rejects a profile with no subjects", async () => {
    const res = await teacherAgent.put("/api/teacher-profile/me").send({
      fullName: "Asha Verma",
      subjects: [],
      gradeLevels: ["Grade 6"],
      experienceYears: 4,
      city: "Pune",
      state: "Maharashtra",
    });
    expect(res.status).toBe(400);
  });

  it("blocks a school account from creating a teacher profile", async () => {
    const res = await schoolAgent.put("/api/teacher-profile/me").send({
      fullName: "Not A Teacher",
      subjects: ["Mathematics"],
      gradeLevels: ["Grade 6"],
      experienceYears: 1,
      city: "Pune",
      state: "Maharashtra",
    });
    expect(res.status).toBe(403);
  });
});
