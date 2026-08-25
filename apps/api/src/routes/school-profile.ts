import { Router } from "express";
import { z } from "zod";

import { db } from "../config/db";
import { requireAccountType, requireAuth } from "../middleware/require-auth";

export const schoolProfileRouter = Router();

const upsertSchema = z.object({
  name: z.string().min(1),
  board: z.string().min(1),
  udiseCode: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
});

schoolProfileRouter.get("/api/school-profile/me", requireAuth, async (req, res) => {
  const profile = await db.schoolProfile.findUnique({ where: { userId: req.session!.user.id } });
  res.json({ profile });
});

schoolProfileRouter.put("/api/school-profile/me", requireAuth, requireAccountType("SCHOOL"), async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const profile = await db.schoolProfile.upsert({
    where: { userId: req.session!.user.id },
    create: { userId: req.session!.user.id, ...parsed.data },
    update: parsed.data,
  });

  res.json({ profile });
});
