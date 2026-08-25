import { randomUUID } from "node:crypto";

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";

describe("job posting management", () => {
  const app = createApp();
  const schoolAgent = request.agent(app);
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
  });

  it("lets the owning school fetch a single posting", async () => {
    const res = await schoolAgent.get(`/api/job-postings/${postingId}`);
    expect(res.status).toBe(200);
    expect(res.body.posting.subject).toBe("Mathematics");
  });

  it("404s a single posting for a school that doesn't own it", async () => {
    const otherSchool = request.agent(app);
    await otherSchool.post("/api/auth/sign-up/email").send({
      name: "Other School",
      email: `school-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "SCHOOL",
    });

    const res = await otherSchool.get(`/api/job-postings/${postingId}`);
    expect(res.status).toBe(404);
  });

  it("edits posting fields", async () => {
    const res = await schoolAgent.patch(`/api/job-postings/${postingId}`).send({ city: "Mumbai" });
    expect(res.status).toBe(200);
    expect(res.body.posting.city).toBe("Mumbai");
  });

  it("stops showing up in the open browse list once closed", async () => {
    const before = await request(app).get("/api/job-postings");
    expect(before.body.postings.some((p: { id: string }) => p.id === postingId)).toBe(true);

    const closeRes = await schoolAgent.patch(`/api/job-postings/${postingId}`).send({ status: "CLOSED" });
    expect(closeRes.status).toBe(200);

    const after = await request(app).get("/api/job-postings");
    expect(after.body.postings.some((p: { id: string }) => p.id === postingId)).toBe(false);
  });

  it("sets filledAt when marked FILLED", async () => {
    const reopenRes = await schoolAgent.patch(`/api/job-postings/${postingId}`).send({ status: "OPEN" });
    expect(reopenRes.body.posting.filledAt).toBeNull();

    const filledRes = await schoolAgent.patch(`/api/job-postings/${postingId}`).send({ status: "FILLED" });
    expect(filledRes.status).toBe(200);
    expect(filledRes.body.posting.filledAt).not.toBeNull();
  });
});

describe("job posting browse filters", () => {
  const app = createApp();
  const schoolAgent = request.agent(app);

  beforeAll(async () => {
    await schoolAgent.post("/api/auth/sign-up/email").send({
      name: "Filter Test School",
      email: `school-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "SCHOOL",
    });
    await schoolAgent.put("/api/school-profile/me").send({
      name: "Filter Test School",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });
    await schoolAgent.post("/api/job-postings").send({
      subject: "Mathematics",
      gradeLevel: "Grade 8",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
      isUrgent: true,
    });
    await schoolAgent.post("/api/job-postings").send({
      subject: "Science",
      gradeLevel: "Grade 5",
      board: "ICSE",
      city: "Nashik",
      state: "Maharashtra",
    });
  });

  it("filters by subject", async () => {
    const res = await request(app).get("/api/job-postings?subject=math");
    expect(res.status).toBe(200);
    expect(res.body.postings.every((p: { subject: string }) => /math/i.test(p.subject))).toBe(true);
    expect(res.body.postings.length).toBeGreaterThan(0);
  });

  it("filters by city", async () => {
    const res = await request(app).get("/api/job-postings?city=nashik");
    expect(res.status).toBe(200);
    expect(res.body.postings.every((p: { city: string }) => /nashik/i.test(p.city))).toBe(true);
  });

  it("filters by isUrgent", async () => {
    const res = await request(app).get("/api/job-postings?isUrgent=true");
    expect(res.status).toBe(200);
    expect(res.body.postings.every((p: { isUrgent: boolean }) => p.isUrgent)).toBe(true);
  });
});
