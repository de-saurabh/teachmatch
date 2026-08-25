import { randomUUID } from "node:crypto";

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";
import { createAdminAgent } from "../test-utils/admin-agent";

describe("matching engine and swipe flow", () => {
  const app = createApp();
  const schoolAgent = request.agent(app);
  const teacherAgent = request.agent(app);
  let admin: request.Agent;
  let postingId: string;
  let schoolProfileId: string;
  let teacherProfileId: string;

  beforeAll(async () => {
    admin = await createAdminAgent(app);

    await schoolAgent.post("/api/auth/sign-up/email").send({
      name: "Green Valley School",
      email: `school-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "SCHOOL",
    });
    const schoolProfileRes = await schoolAgent.put("/api/school-profile/me").send({
      name: "Green Valley School",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });
    schoolProfileId = schoolProfileRes.body.profile.id;
    await admin.patch(`/api/admin/verifications/school/${schoolProfileId}`).send({ status: "VERIFIED" });

    await teacherAgent.post("/api/auth/sign-up/email").send({
      name: "Asha Verma",
      email: `teacher-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "TEACHER",
    });
    const teacherProfileRes = await teacherAgent.put("/api/teacher-profile/me").send({
      fullName: "Asha Verma",
      subjects: ["Mathematics"],
      gradeLevels: ["Grade 8"],
      experienceYears: 5,
      city: "Pune",
      state: "Maharashtra",
    });
    teacherProfileId = teacherProfileRes.body.profile.id;
    await admin.patch(`/api/admin/verifications/teacher/${teacherProfileId}`).send({ status: "VERIFIED" });

    const postRes = await schoolAgent.post("/api/job-postings").send({
      subject: "Mathematics",
      gradeLevel: "Grade 8",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });
    postingId = postRes.body.posting.id;
  });

  it("surfaces the verified teacher as a candidate for the school's posting", async () => {
    const res = await schoolAgent.get(`/api/matches/job-postings/${postingId}`);
    expect(res.status).toBe(200);
    expect(res.body.matches).toHaveLength(1);
    expect(res.body.matches[0].teacher.fullName).toBe("Asha Verma");
    expect(res.body.matches[0].score).toBeGreaterThan(0);
  });

  it("surfaces the posting as a recommendation for the teacher", async () => {
    // Teacher sync runs against every open posting from a verified
    // school across the (shared, parallel-test) database, so other
    // test files' fixtures can legitimately show up here too — assert
    // presence, not an exact count.
    const res = await teacherAgent.get("/api/matches/mine");
    expect(res.status).toBe(200);
    expect(res.body.matches.some((m: { jobPosting: { id: string } }) => m.jobPosting.id === postingId)).toBe(true);
  });

  it("does not match yet after only one side swipes", async () => {
    const schoolMatches = await schoolAgent.get(`/api/matches/job-postings/${postingId}`);
    const matchId = schoolMatches.body.matches[0].id;

    const res = await schoolAgent.post(`/api/matches/${matchId}/swipe`).send({ direction: "LIKE" });
    expect(res.status).toBe(200);
    expect(res.body.matched).toBe(false);

    const applicationsRes = await teacherAgent.get("/api/applications/mine");
    expect(applicationsRes.body.applications).toHaveLength(0);
  });

  it("matches and auto-creates an application once both sides like", async () => {
    const teacherMatches = await teacherAgent.get("/api/matches/mine");
    const matchId = teacherMatches.body.matches.find(
      (m: { jobPosting: { id: string } }) => m.jobPosting.id === postingId,
    )?.id;

    const res = await teacherAgent.post(`/api/matches/${matchId}/swipe`).send({ direction: "LIKE" });
    expect(res.status).toBe(200);
    expect(res.body.matched).toBe(true);

    const applicationsRes = await teacherAgent.get("/api/applications/mine");
    expect(
      applicationsRes.body.applications.some((a: { jobPosting: { id: string } }) => a.jobPosting.id === postingId),
    ).toBe(true);

    const schoolMatchesAfter = await schoolAgent.get(`/api/matches/job-postings/${postingId}`);
    expect(schoolMatchesAfter.body.matches).toHaveLength(0);
  });

  it("keeps a teacher from swiping on a match that isn't theirs", async () => {
    const otherPosting = await schoolAgent.post("/api/job-postings").send({
      subject: "Mathematics",
      gradeLevel: "Grade 8",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });

    const otherTeacher = request.agent(app);
    await otherTeacher.post("/api/auth/sign-up/email").send({
      name: "Other Teacher",
      email: `teacher-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "TEACHER",
    });
    await otherTeacher.put("/api/teacher-profile/me").send({
      fullName: "Other Teacher",
      subjects: ["Mathematics"],
      gradeLevels: ["Grade 8"],
      experienceYears: 3,
      city: "Pune",
      state: "Maharashtra",
    });
    const matchesRes = await schoolAgent.get(`/api/matches/job-postings/${otherPosting.body.posting.id}`);
    const matchId = matchesRes.body.matches.find((m: { teacher: { fullName: string } }) => m.teacher.fullName === "Asha Verma")?.id;

    const res = await otherTeacher.post(`/api/matches/${matchId}/swipe`).send({ direction: "LIKE" });
    expect(res.status).toBe(404);
  });

  it("rejects an invalid swipe direction", async () => {
    const res = await schoolAgent.post(`/api/matches/${randomUUID()}/swipe`).send({ direction: "SIDEWAYS" });
    expect(res.status).toBe(400);
  });

  it("404s a swipe on a match that doesn't exist", async () => {
    const res = await teacherAgent.post(`/api/matches/${randomUUID()}/swipe`).send({ direction: "LIKE" });
    expect(res.status).toBe(404);
  });

  it("never creates a match candidate for an unrelated subject", async () => {
    await teacherAgent.put("/api/teacher-profile/me").send({
      fullName: "Asha Verma",
      subjects: ["Art"],
      gradeLevels: ["Grade 8"],
      experienceYears: 5,
      city: "Pune",
      state: "Maharashtra",
    });

    const secondPosting = await schoolAgent.post("/api/job-postings").send({
      subject: "Physics",
      gradeLevel: "Grade 10",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });

    const res = await schoolAgent.get(`/api/matches/job-postings/${secondPosting.body.posting.id}`);
    expect(res.body.matches).toHaveLength(0);
  });
});
