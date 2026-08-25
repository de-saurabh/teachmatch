import { randomUUID } from "node:crypto";

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";

describe("school profile", () => {
  const app = createApp();
  const agent = request.agent(app);
  const email = `school-${randomUUID()}@example.com`;

  beforeAll(async () => {
    await agent.post("/api/auth/sign-up/email").send({
      name: "Test School Admin",
      email,
      password: "supersecret123",
      accountType: "SCHOOL",
    });
  });

  it("returns null before a profile is created", async () => {
    const res = await agent.get("/api/school-profile/me");
    expect(res.status).toBe(200);
    expect(res.body.profile).toBeNull();
  });

  it("rejects an incomplete profile", async () => {
    const res = await agent.put("/api/school-profile/me").send({ name: "Test School" });
    expect(res.status).toBe(400);
  });

  it("creates then updates the profile", async () => {
    const createRes = await agent.put("/api/school-profile/me").send({
      name: "Test School",
      board: "CBSE",
      city: "Pune",
      state: "Maharashtra",
    });
    expect(createRes.status).toBe(200);
    expect(createRes.body.profile.city).toBe("Pune");

    const updateRes = await agent.put("/api/school-profile/me").send({
      name: "Test School",
      board: "CBSE",
      city: "Mumbai",
      state: "Maharashtra",
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.profile.city).toBe("Mumbai");
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/school-profile/me");
    expect(res.status).toBe(401);
  });
});
