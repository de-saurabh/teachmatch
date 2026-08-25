import { randomUUID } from "node:crypto";

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";
import { createAdminAgent } from "../test-utils/admin-agent";

describe("notifications", () => {
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
  });

  it("starts with an empty list", async () => {
    const res = await teacherAgent.get("/api/notifications/mine");
    expect(res.status).toBe(200);
    expect(res.body.notifications).toEqual([]);
  });

  it("notifies the school when a teacher applies directly", async () => {
    const applyRes = await teacherAgent.post(`/api/job-postings/${postingId}/apply`);
    expect(applyRes.status).toBe(201);

    const res = await schoolAgent.get("/api/notifications/mine");
    expect(res.status).toBe(200);
    const notification = res.body.notifications.find((n: { type: string }) => n.type === "NEW_APPLICATION");
    expect(notification).toBeDefined();
    expect(notification.payload.teacherName).toBe("Asha Verma");
    expect(notification.readAt).toBeNull();
  });

  it("notifies the teacher when the school changes the application status", async () => {
    const applicantsRes = await schoolAgent.get(`/api/job-postings/${postingId}/applications`);
    const applicationId = applicantsRes.body.applications[0].id;

    const statusRes = await schoolAgent
      .patch(`/api/applications/${applicationId}/status`)
      .send({ status: "SHORTLISTED" });
    expect(statusRes.status).toBe(200);

    const res = await teacherAgent.get("/api/notifications/mine");
    const notification = res.body.notifications.find(
      (n: { type: string }) => n.type === "APPLICATION_STATUS_CHANGED",
    );
    expect(notification).toBeDefined();
    expect(notification.payload.status).toBe("SHORTLISTED");
  });

  it("marks a notification read, and only for its owner", async () => {
    const res = await teacherAgent.get("/api/notifications/mine");
    const notificationId = res.body.notifications[0].id;

    const otherTeacher = request.agent(app);
    await otherTeacher.post("/api/auth/sign-up/email").send({
      name: "Other Teacher",
      email: `teacher-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "TEACHER",
    });
    const forbiddenRes = await otherTeacher.patch(`/api/notifications/${notificationId}/read`);
    expect(forbiddenRes.status).toBe(404);

    const readRes = await teacherAgent.patch(`/api/notifications/${notificationId}/read`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.notification.readAt).not.toBeNull();
  });

  it("notifies both sides on a mutual match", async () => {
    const admin = await createAdminAgent(app);
    const schoolProfileRes = await schoolAgent.get("/api/school-profile/me");
    await admin
      .patch(`/api/admin/verifications/school/${schoolProfileRes.body.profile.id}`)
      .send({ status: "VERIFIED" });
    const teacherProfileRes = await teacherAgent.get("/api/teacher-profile/me");
    await admin
      .patch(`/api/admin/verifications/teacher/${teacherProfileRes.body.profile.id}`)
      .send({ status: "VERIFIED" });

    const matchesRes = await teacherAgent.get("/api/matches/mine");
    const match = matchesRes.body.matches.find((m: { jobPosting: { id: string } }) => m.jobPosting.id === postingId);
    expect(match).toBeDefined();

    await teacherAgent.post(`/api/matches/${match.id}/swipe`).send({ direction: "LIKE" });
    const swipeRes = await schoolAgent.post(`/api/matches/${match.id}/swipe`).send({ direction: "LIKE" });
    expect(swipeRes.body.matched).toBe(true);

    const schoolNotifications = await schoolAgent.get("/api/notifications/mine");
    const teacherNotifications = await teacherAgent.get("/api/notifications/mine");

    expect(schoolNotifications.body.notifications.some((n: { type: string }) => n.type === "MATCH")).toBe(true);
    expect(teacherNotifications.body.notifications.some((n: { type: string }) => n.type === "MATCH")).toBe(true);
  });
});
