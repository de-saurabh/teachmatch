import { randomUUID } from "node:crypto";

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";
import { createAdminAgent } from "../test-utils/admin-agent";

describe("admin verification review", () => {
  const app = createApp();
  const schoolAgent = request.agent(app);
  let schoolProfileId: string;

  beforeAll(async () => {
    await schoolAgent.post("/api/auth/sign-up/email").send({
      name: "Green Valley School",
      email: `school-${randomUUID()}@example.com`,
      password: "supersecret123",
      accountType: "SCHOOL",
    });
    const profileRes = await schoolAgent.put("/api/school-profile/me").send({
      name: "Green Valley School",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });
    schoolProfileId = profileRes.body.profile.id;
  });

  it("reports no permissions for an ordinary account", async () => {
    const res = await schoolAgent.get("/api/admin/me");
    expect(res.status).toBe(200);
    expect(res.body.permissions).toEqual([]);
  });

  it("blocks an ordinary account from the verification queue", async () => {
    const res = await schoolAgent.get("/api/admin/verifications");
    expect(res.status).toBe(403);
  });

  it("requires authentication entirely", async () => {
    const res = await request(app).get("/api/admin/verifications");
    expect(res.status).toBe(401);
  });

  it("lists the pending school profile for an admin", async () => {
    const admin = await createAdminAgent(app);

    const meRes = await admin.get("/api/admin/me");
    expect(meRes.body.permissions).toContain("CAN_REVIEW_VERIFICATION");

    const res = await admin.get("/api/admin/verifications");
    expect(res.status).toBe(200);
    expect(res.body.schools.some((school: { id: string }) => school.id === schoolProfileId)).toBe(true);
  });

  it("approves a school, unhiding it and clearing it from the pending queue", async () => {
    const admin = await createAdminAgent(app);

    const approveRes = await admin
      .patch(`/api/admin/verifications/school/${schoolProfileId}`)
      .send({ status: "VERIFIED" });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.school.verificationStatus).toBe("VERIFIED");
    expect(approveRes.body.school.isHidden).toBe(false);

    const queueRes = await admin.get("/api/admin/verifications");
    expect(queueRes.body.schools.some((school: { id: string }) => school.id === schoolProfileId)).toBe(false);
  });

  it("rejects an invalid decision value", async () => {
    const admin = await createAdminAgent(app);
    const res = await admin.patch(`/api/admin/verifications/school/${schoolProfileId}`).send({ status: "MAYBE" });
    expect(res.status).toBe(400);
  });
});
