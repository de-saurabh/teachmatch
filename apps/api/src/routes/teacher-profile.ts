import { Router } from "express";
import { z } from "zod";

import { db } from "../config/db";
import { requireAccountType, requireAuth } from "../middleware/require-auth";
import { syncMatchesForTeacher } from "../services/match-sync";

export const teacherProfileRouter = Router();

const upsertSchema = z.object({
  fullName: z.string().min(1),
  subjects: z.array(z.string().min(1)).min(1),
  gradeLevels: z.array(z.string().min(1)).min(1),
  experienceYears: z.number().int().min(0),
  city: z.string().min(1),
  state: z.string().min(1),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryLeeway: z.number().int().min(0).optional(),
});

teacherProfileRouter.get("/api/teacher-profile/me", requireAuth, async (req, res) => {
  const profile = await db.teacherProfile.findUnique({ where: { userId: req.session!.user.id } });
  res.json({ profile });
});

teacherProfileRouter.put("/api/teacher-profile/me", requireAuth, requireAccountType("TEACHER"), async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const profile = await db.teacherProfile.upsert({
    where: { userId: req.session!.user.id },
    create: { userId: req.session!.user.id, ...parsed.data },
    update: parsed.data,
  });

  await syncMatchesForTeacher(profile.id);

  res.json({ profile });
});
