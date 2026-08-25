import { randomUUID } from "node:crypto";

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";

describe("applications", () => {
  const app = createApp();
  const schoolAgent = request.agent(app);
  const teacherAgent = request.agent(app);
  let postingId: string;

  beforeAll(async () => {
    await schoolAgent.post("/api/auth/sign-up/email").send({
      name: "Green Valley School",
      email: `school-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "SCHOOL",
    });
    await schoolAgent.put("/api/school-profile/me").send({
      name: "Green Valley School",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });
    const postRes = await schoolAgent.post("/api/job-postings").send({
      subject: "Mathematics",
      gradeLevel: "Grade 8",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });
    postingId = postRes.body.posting.id;

    await teacherAgent.post("/api/auth/sign-up/email").send({
      name: "Asha Verma",
      email: `teacher-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "TEACHER",
    });
    await teacherAgent.put("/api/teacher-profile/me").send({
      fullName: "Asha Verma",
      subjects: ["Mathematics"],
      gradeLevels: ["Grade 8"],
      experienceYears: 5,
      city: "Pune",
      state: "Maharashtra",
    });
    await teacherAgent.post(`/api/job-postings/${postingId}/apply`);
  });

  it("shows the application in the teacher's own list, starting as APPLIED", async () => {
    const res = await teacherAgent.get("/api/applications/mine");
    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.applications[0].status).toBe("APPLIED");
    expect(res.body.applications[0].jobPosting.schoolName).toBe("Green Valley School");
  });

  it("returns an empty list for a teacher with no applications", async () => {
    const otherTeacher = request.agent(app);
    await otherTeacher.post("/api/auth/sign-up/email").send({
      name: "Other Teacher",
      email: `teacher-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "TEACHER",
    });

    const res = await otherTeacher.get("/api/applications/mine");
    expect(res.status).toBe(200);
    expect(res.body.applications).toEqual([]);
  });

  it("lets the owning school move the application through the pipeline", async () => {
    const applicantsRes = await schoolAgent.get(`/api/job-postings/${postingId}/applications`);
    const applicationId = applicantsRes.body.applications[0].id;

    const res = await schoolAgent.patch(`/api/applications/${applicationId}/status`).send({
      status: "SHORTLISTED",
    });
    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe("SHORTLISTED");

    const teacherView = await teacherAgent.get("/api/applications/mine");
    expect(teacherView.body.applications[0].status).toBe("SHORTLISTED");
  });

  it("rejects an invalid status value", async () => {
    const applicantsRes = await schoolAgent.get(`/api/job-postings/${postingId}/applications`);
    const applicationId = applicantsRes.body.applications[0].id;

    const res = await schoolAgent.patch(`/api/applications/${applicationId}/status`).send({
      status: "NOT_A_REAL_STATUS",
    });
    expect(res.status).toBe(400);
  });

  it("keeps one school from updating another school's application", async () => {
    const otherSchool = request.agent(app);
    await otherSchool.post("/api/auth/sign-up/email").send({
      name: "Other School",
      email: `school-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "SCHOOL",
    });

    const applicantsRes = await schoolAgent.get(`/api/job-postings/${postingId}/applications`);
    const applicationId = applicantsRes.body.applications[0].id;

    const res = await otherSchool.patch(`/api/applications/${applicationId}/status`).send({
      status: "REJECTED",
    });
    expect(res.status).toBe(404);
  });

  it("blocks a teacher from updating application status", async () => {
    const applicantsRes = await schoolAgent.get(`/api/job-postings/${postingId}/applications`);
    const applicationId = applicantsRes.body.applications[0].id;

    const res = await teacherAgent.patch(`/api/applications/${applicationId}/status`).send({
      status: "HIRED",
    });
    expect(res.status).toBe(403);
  });
});
