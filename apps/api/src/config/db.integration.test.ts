import { afterAll, describe, expect, it } from "vitest";

import { db } from "./db";

// Runs against the real Postgres started by `docker compose up postgres-test`
// (see .env.test) — see build-notes: DB tests use a real database, not mocks.
describe("db connection", () => {
  afterAll(async () => {
    await db.$disconnect();
  });

  it("connects to the test database", async () => {
    const result = await db.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    expect(result[0].ok).toBe(1);
  });
});
