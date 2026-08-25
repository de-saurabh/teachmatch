import { randomUUID } from "node:crypto";

import type { Express } from "express";
import request from "supertest";

import { db } from "../config/db";

// Admin status is granted out-of-band (see scripts/grant-admin.ts), not
// through any HTTP endpoint — this recreates that for tests.
export async function createAdminAgent(app: Express) {
  const agent = request.agent(app);
  const email = `admin-${randomUUID()}@example.com`;

  await agent.post("/api/auth/sign-up/email").send({
    name: "Admin",
    email,
    password: "supersecret123",
    accountType: "TEACHER",
  });

  const user = await db.user.findUniqueOrThrow({ where: { email } });
  await db.adminPermission.create({ data: { userId: user.id, permission: "CAN_REVIEW_VERIFICATION" } });

  return agent;
}
