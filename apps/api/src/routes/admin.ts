import { Router } from "express";
import { z } from "zod";

import { db } from "../config/db";
import { requireAuth, requirePermission } from "../middleware/require-auth";
import { syncMatchesForJobPosting, syncMatchesForTeacher } from "../services/match-sync";

export const adminRouter = Router();

const decisionSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
});

// Lets the web app know whether to show admin nav at all.
adminRouter.get("/api/admin/me", requireAuth, async (req, res) => {
  const grants = await db.adminPermission.findMany({ where: { userId: req.session!.user.id } });
  res.json({ permissions: grants.map((grant) => grant.permission) });
});

adminRouter.get(
  "/api/admin/verifications",
  requireAuth,
  requirePermission("CAN_REVIEW_VERIFICATION"),
  async (_req, res) => {
    const [schools, teachers] = await Promise.all([
      db.schoolProfile.findMany({
        where: { verificationStatus: "PENDING" },
        orderBy: { createdAt: "asc" },
      }),
      db.teacherProfile.findMany({
        where: { verificationStatus: "PENDING" },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    res.json({
      schools: schools.map((school) => ({
        id: school.id,
        name: school.name,
        board: school.board,
        udiseCode: school.udiseCode,
        city: school.city,
        state: school.state,
        createdAt: school.createdAt.toISOString(),
      })),
      teachers: teachers.map((teacher) => ({
        id: teacher.id,
        fullName: teacher.fullName,
        subjects: teacher.subjects,
        gradeLevels: teacher.gradeLevels,
        experienceYears: teacher.experienceYears,
        city: teacher.city,
        state: teacher.state,
        createdAt: teacher.createdAt.toISOString(),
      })),
    });
  },
);

adminRouter.patch(
  "/api/admin/verifications/school/:id",
  requireAuth,
  requirePermission("CAN_REVIEW_VERIFICATION"),
  async (req, res) => {
    const parsed = decisionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const school = await db.schoolProfile.update({
      where: { id: String(req.params.id) },
      data: {
        verificationStatus: parsed.data.status,
        verifiedById: req.session!.user.id,
        verifiedAt: new Date(),
        isHidden: parsed.data.status !== "VERIFIED",
      },
    });

    if (parsed.data.status === "VERIFIED") {
      const openPostings = await db.jobPosting.findMany({
        where: { schoolId: school.id, status: "OPEN" },
        select: { id: true },
      });
      await Promise.all(openPostings.map((posting) => syncMatchesForJobPosting(posting.id)));
    }

    res.json({ school });
  },
);

adminRouter.patch(
  "/api/admin/verifications/teacher/:id",
  requireAuth,
  requirePermission("CAN_REVIEW_VERIFICATION"),
  async (req, res) => {
    const parsed = decisionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const teacher = await db.teacherProfile.update({
      where: { id: String(req.params.id) },
      data: {
        verificationStatus: parsed.data.status,
        verifiedById: req.session!.user.id,
        verifiedAt: new Date(),
        isHidden: parsed.data.status !== "VERIFIED",
      },
    });

    if (parsed.data.status === "VERIFIED") {
      await syncMatchesForTeacher(teacher.id);
    }

    res.json({ teacher });
  },
);
