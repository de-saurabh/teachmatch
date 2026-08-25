import { randomUUID } from "node:crypto";

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";
import { createAdminAgent } from "../test-utils/admin-agent";

describe("job posting flow", () => {
  const app = createApp();
  const schoolAgent = request.agent(app);
  const teacherAgent = request.agent(app);

  const schoolEmail = `school-${randomUUID()}@example.com`;
  const teacherEmail = `teacher-${randomUUID()}@example.com`;

  beforeAll(async () => {
    await schoolAgent.post("/api/auth/sign-up/email").send({
      name: "Green Valley School",
      email: schoolEmail,
      password: "supersecret123",
      accountType: "SCHOOL",
    });

    await teacherAgent.post("/api/auth/sign-up/email").send({
      name: "Asha Verma",
      email: teacherEmail,
      password: "supersecret123",
      accountType: "TEACHER",
    });
  });

  const jobBody = {
    subject: "Mathematics",
    gradeLevel: "Grade 8",
    board: "CBSE",
    city: "Pune",
    state: "Maharashtra",
    isUrgent: true,
  };

  it("rejects posting a job before a school profile exists", async () => {
    const res = await schoolAgent.post("/api/job-postings").send(jobBody);
    expect(res.status).toBe(409);
  });

  it("rejects anonymous job posting creation", async () => {
    const res = await request(app).post("/api/job-postings").send(jobBody);
    expect(res.status).toBe(401);
  });

  it("lets a school complete its profile and post a job", async () => {
    const profileRes = await schoolAgent.put("/api/school-profile/me").send({
      name: "Green Valley School",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });
    expect(profileRes.status).toBe(200);

    const postRes = await schoolAgent.post("/api/job-postings").send(jobBody);
    expect(postRes.status).toBe(201);
    expect(postRes.body.posting.status).toBe("OPEN");
  });

  it("keeps a teacher from posting jobs (role gating)", async () => {
    const res = await teacherAgent.post("/api/job-postings").send(jobBody);
    expect(res.status).toBe(403);
  });

  it("stays out of the open listing until the school is verified", async () => {
    const mineRes = await schoolAgent.get("/api/job-postings/mine");
    const postingId = mineRes.body.postings[0].id;

    const before = await request(app).get("/api/job-postings");
    expect(before.body.postings.some((posting: { id: string }) => posting.id === postingId)).toBe(false);

    const schoolProfileRes = await schoolAgent.get("/api/school-profile/me");
    const admin = await createAdminAgent(app);
    const verifyRes = await admin
      .patch(`/api/admin/verifications/school/${schoolProfileRes.body.profile.id}`)
      .send({ status: "VERIFIED" });
    expect(verifyRes.status).toBe(200);

    const after = await request(app).get("/api/job-postings");
    expect(after.status).toBe(200);
    expect(
      after.body.postings.some(
        (posting: { id: string; schoolName: string }) => posting.id === postingId && posting.schoolName === "Green Valley School",
      ),
    ).toBe(true);
  });

  it("blocks a teacher from applying before completing their profile", async () => {
    const mineRes = await schoolAgent.get("/api/job-postings/mine");
    const postingId = mineRes.body.postings[0].id;

    const applyRes = await teacherAgent.post(`/api/job-postings/${postingId}/apply`);
    expect(applyRes.status).toBe(409);
  });

  it("lets a teacher complete their profile, apply once, and blocks a duplicate apply", async () => {
    await teacherAgent.put("/api/teacher-profile/me").send({
      fullName: "Asha Verma",
      subjects: ["Mathematics"],
      gradeLevels: ["Grade 8"],
      experienceYears: 5,
      city: "Pune",
      state: "Maharashtra",
    });

    const mineRes = await schoolAgent.get("/api/job-postings/mine");
    const postingId = mineRes.body.postings[0].id;

    const applyRes = await teacherAgent.post(`/api/job-postings/${postingId}/apply`);
    expect(applyRes.status).toBe(201);

    const dupRes = await teacherAgent.post(`/api/job-postings/${postingId}/apply`);
    expect(dupRes.status).toBe(409);

    const applicantsRes = await schoolAgent.get(`/api/job-postings/${postingId}/applications`);
    expect(applicantsRes.status).toBe(200);
    expect(applicantsRes.body.applications).toHaveLength(1);
    expect(applicantsRes.body.applications[0].teacher.fullName).toBe("Asha Verma");
  });

  it("keeps one school from viewing another school's applicants", async () => {
    const otherSchoolAgent = request.agent(app);
    await otherSchoolAgent.post("/api/auth/sign-up/email").send({
      name: "Other School",
      email: `other-school-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "SCHOOL",
    });

    const mineRes = await schoolAgent.get("/api/job-postings/mine");
    const postingId = mineRes.body.postings[0].id;

    const res = await otherSchoolAgent.get(`/api/job-postings/${postingId}/applications`);
    expect(res.status).toBe(404);
  });
});
