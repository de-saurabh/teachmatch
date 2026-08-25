import { Router } from "express";
import { z } from "zod";

import { db } from "../config/db";
import { requireAccountType, requireAuth } from "../middleware/require-auth";

export const applicationsRouter = Router();

const statusSchema = z.object({
  status: z.enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]),
});

// A teacher's own applications, across every job they've applied to.
applicationsRouter.get("/api/applications/mine", requireAuth, requireAccountType("TEACHER"), async (req, res) => {
  const teacherProfile = await db.teacherProfile.findUnique({ where: { userId: req.session!.user.id } });
  if (!teacherProfile) {
    res.json({ applications: [] });
    return;
  }

  const applications = await db.application.findMany({
    where: { teacherProfileId: teacherProfile.id },
    include: { jobPosting: { include: { school: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    applications: applications.map((application) => ({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      jobPosting: {
        id: application.jobPosting.id,
        subject: application.jobPosting.subject,
        gradeLevel: application.jobPosting.gradeLevel,
        board: application.jobPosting.board,
        city: application.jobPosting.city,
        state: application.jobPosting.state,
        schoolName: application.jobPosting.school.name,
      },
    })),
  });
});

// School moving one of its applicants through the pipeline.
applicationsRouter.patch(
  "/api/applications/:id/status",
  requireAuth,
  requireAccountType("SCHOOL"),
  async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const schoolProfile = await db.schoolProfile.findUnique({ where: { userId: req.session!.user.id } });
    const application = await db.application.findUnique({
      where: { id: String(req.params.id) },
      include: { jobPosting: true },
    });

    if (!application || !schoolProfile || application.jobPosting.schoolId !== schoolProfile.id) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const updated = await db.application.update({
      where: { id: application.id },
      data: { status: parsed.data.status },
    });

    res.json({ application: updated });
  },
);
