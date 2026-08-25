import type { JobPostingSummary } from "@teachmatch/shared";
import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { computeSalaryBadge } from "../domain/salary";
import { db } from "../config/db";
import { getOptionalSession, requireAccountType, requireAuth } from "../middleware/require-auth";
import { syncMatchesForJobPosting } from "../services/match-sync";

export const jobPostingsRouter = Router();

const createSchema = z.object({
  subject: z.string().min(1),
  gradeLevel: z.string().min(1),
  board: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  isUrgent: z.boolean().optional(),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryLeeway: z.number().int().min(0).optional(),
});

const updateSchema = z.object({
  subject: z.string().min(1).optional(),
  gradeLevel: z.string().min(1).optional(),
  board: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  isUrgent: z.boolean().optional(),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryLeeway: z.number().int().min(0).optional(),
  status: z.enum(["OPEN", "FILLED", "CLOSED"]).optional(),
});

const browseQuerySchema = z.object({
  subject: z.string().optional(),
  city: z.string().optional(),
  board: z.string().optional(),
  isUrgent: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
});

// Open postings a teacher can browse. Only from schools the admin
// team has verified — a posting stays invisible here until then.
jobPostingsRouter.get("/api/job-postings", async (req, res) => {
  const query = browseQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.issues[0].message });
    return;
  }

  const session = await getOptionalSession(req);
  const teacherProfile = session
    ? await db.teacherProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  const postings = await db.jobPosting.findMany({
    where: {
      status: "OPEN",
      school: { isHidden: false },
      ...(query.data.subject && { subject: { contains: query.data.subject, mode: "insensitive" } }),
      ...(query.data.city && { city: { contains: query.data.city, mode: "insensitive" } }),
      ...(query.data.board && { board: { contains: query.data.board, mode: "insensitive" } }),
      ...(query.data.isUrgent !== undefined && { isUrgent: query.data.isUrgent }),
    },
    include: { school: { select: { name: true } } },
    orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
  });

  const summaries: JobPostingSummary[] = postings.map((posting) => ({
    id: posting.id,
    schoolName: posting.school.name,
    subject: posting.subject,
    gradeLevel: posting.gradeLevel,
    board: posting.board,
    city: posting.city,
    state: posting.state,
    isUrgent: posting.isUrgent,
    status: posting.status,
    createdAt: posting.createdAt.toISOString(),
    salaryBadge: teacherProfile
      ? computeSalaryBadge(
          posting.salaryMin != null && posting.salaryMax != null
            ? { min: posting.salaryMin, max: posting.salaryMax, leeway: posting.salaryLeeway ?? 0 }
            : null,
          teacherProfile.salaryMin != null && teacherProfile.salaryMax != null
            ? { min: teacherProfile.salaryMin, max: teacherProfile.salaryMax, leeway: teacherProfile.salaryLeeway ?? 0 }
            : null,
        )
      : null,
  }));

  res.json({ postings: summaries });
});

jobPostingsRouter.get("/api/job-postings/mine", requireAuth, requireAccountType("SCHOOL"), async (req, res) => {
  const schoolProfile = await db.schoolProfile.findUnique({ where: { userId: req.session!.user.id } });
  if (!schoolProfile) {
    res.json({ postings: [] });
    return;
  }

  const postings = await db.jobPosting.findMany({
    where: { schoolId: schoolProfile.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    postings: postings.map((posting) => ({
      id: posting.id,
      subject: posting.subject,
      gradeLevel: posting.gradeLevel,
      board: posting.board,
      city: posting.city,
      state: posting.state,
      isUrgent: posting.isUrgent,
      status: posting.status,
      createdAt: posting.createdAt.toISOString(),
      applicationCount: posting._count.applications,
    })),
  });
});

// Single posting, for the owning school to load into an edit form.
jobPostingsRouter.get("/api/job-postings/:id", requireAuth, requireAccountType("SCHOOL"), async (req, res) => {
  const schoolProfile = await db.schoolProfile.findUnique({ where: { userId: req.session!.user.id } });
  const posting = await db.jobPosting.findUnique({ where: { id: String(req.params.id) } });

  if (!posting || !schoolProfile || posting.schoolId !== schoolProfile.id) {
    res.status(404).json({ error: "Job posting not found" });
    return;
  }

  res.json({ posting });
});

jobPostingsRouter.patch("/api/job-postings/:id", requireAuth, requireAccountType("SCHOOL"), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const schoolProfile = await db.schoolProfile.findUnique({ where: { userId: req.session!.user.id } });
  const existing = await db.jobPosting.findUnique({ where: { id: String(req.params.id) } });

  if (!existing || !schoolProfile || existing.schoolId !== schoolProfile.id) {
    res.status(404).json({ error: "Job posting not found" });
    return;
  }

  const { status, ...rest } = parsed.data;

  const posting = await db.jobPosting.update({
    where: { id: existing.id },
    data: {
      ...rest,
      ...(status && { status }),
      ...(status === "FILLED" && !existing.filledAt && { filledAt: new Date() }),
    },
  });

  res.json({ posting });
});

jobPostingsRouter.post("/api/job-postings", requireAuth, requireAccountType("SCHOOL"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const schoolProfile = await db.schoolProfile.findUnique({ where: { userId: req.session!.user.id } });
  if (!schoolProfile) {
    res.status(409).json({ error: "Complete your school profile before posting a job" });
    return;
  }

  const posting = await db.jobPosting.create({
    data: { schoolId: schoolProfile.id, ...parsed.data },
  });

  await syncMatchesForJobPosting(posting.id);

  res.status(201).json({ posting });
});

jobPostingsRouter.post(
  "/api/job-postings/:id/apply",
  requireAuth,
  requireAccountType("TEACHER"),
  async (req, res) => {
    const teacherProfile = await db.teacherProfile.findUnique({ where: { userId: req.session!.user.id } });
    if (!teacherProfile) {
      res.status(409).json({ error: "Complete your teacher profile before applying" });
      return;
    }

    const posting = await db.jobPosting.findUnique({ where: { id: String(req.params.id) } });
    if (!posting || posting.status !== "OPEN") {
      res.status(404).json({ error: "Job posting not found" });
      return;
    }

    try {
      const application = await db.application.create({
        data: {
          jobPostingId: posting.id,
          teacherProfileId: teacherProfile.id,
          source: "SEARCH",
        },
      });
      res.status(201).json({ application });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        res.status(409).json({ error: "You've already applied to this job" });
        return;
      }
      throw err;
    }
  },
);

// School-only view of who has applied to one of its postings.
jobPostingsRouter.get(
  "/api/job-postings/:id/applications",
  requireAuth,
  requireAccountType("SCHOOL"),
  async (req, res) => {
    const schoolProfile = await db.schoolProfile.findUnique({ where: { userId: req.session!.user.id } });
    const posting = await db.jobPosting.findUnique({ where: { id: String(req.params.id) } });

    if (!posting || !schoolProfile || posting.schoolId !== schoolProfile.id) {
      res.status(404).json({ error: "Job posting not found" });
      return;
    }

    const applications = await db.application.findMany({
      where: { jobPostingId: posting.id },
      include: { teacherProfile: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      applications: applications.map((application) => ({
        id: application.id,
        status: application.status,
        source: application.source,
        createdAt: application.createdAt.toISOString(),
        teacher: {
          fullName: application.teacherProfile.fullName,
          subjects: application.teacherProfile.subjects,
          gradeLevels: application.teacherProfile.gradeLevels,
          experienceYears: application.teacherProfile.experienceYears,
          city: application.teacherProfile.city,
          state: application.teacherProfile.state,
        },
      })),
    });
  },
);
