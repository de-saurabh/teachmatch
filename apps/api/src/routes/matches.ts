import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { db } from "../config/db";
import { requireAccountType, requireAuth } from "../middleware/require-auth";
import { notifyUser } from "../services/notify";

export const matchesRouter = Router();

const swipeSchema = z.object({ direction: z.enum(["LIKE", "PASS"]) });

// A school's ranked, not-yet-decided candidates for one of its postings.
matchesRouter.get("/api/matches/job-postings/:id", requireAuth, requireAccountType("SCHOOL"), async (req, res) => {
  const schoolProfile = await db.schoolProfile.findUnique({ where: { userId: req.session!.user.id } });
  const posting = await db.jobPosting.findUnique({ where: { id: String(req.params.id) } });

  if (!posting || !schoolProfile || posting.schoolId !== schoolProfile.id) {
    res.status(404).json({ error: "Job posting not found" });
    return;
  }

  const matches = await db.matchCandidate.findMany({
    where: { jobPostingId: posting.id, schoolSwipe: "PENDING" },
    include: { teacherProfile: true },
    orderBy: { score: "desc" },
  });

  res.json({
    matches: matches.map((match) => ({
      id: match.id,
      score: match.score,
      teacher: {
        fullName: match.teacherProfile.fullName,
        subjects: match.teacherProfile.subjects,
        gradeLevels: match.teacherProfile.gradeLevels,
        experienceYears: match.teacherProfile.experienceYears,
        city: match.teacherProfile.city,
        state: match.teacherProfile.state,
      },
    })),
  });
});

// A teacher's ranked, not-yet-decided job recommendations.
matchesRouter.get("/api/matches/mine", requireAuth, requireAccountType("TEACHER"), async (req, res) => {
  const teacherProfile = await db.teacherProfile.findUnique({ where: { userId: req.session!.user.id } });
  if (!teacherProfile) {
    res.json({ matches: [] });
    return;
  }

  const matches = await db.matchCandidate.findMany({
    where: { teacherProfileId: teacherProfile.id, teacherSwipe: "PENDING" },
    include: { jobPosting: { include: { school: { select: { name: true } } } } },
    orderBy: { score: "desc" },
  });

  res.json({
    matches: matches.map((match) => ({
      id: match.id,
      score: match.score,
      jobPosting: {
        id: match.jobPosting.id,
        subject: match.jobPosting.subject,
        gradeLevel: match.jobPosting.gradeLevel,
        board: match.jobPosting.board,
        city: match.jobPosting.city,
        state: match.jobPosting.state,
        schoolName: match.jobPosting.school.name,
      },
    })),
  });
});

// Either side of a MatchCandidate swiping LIKE/PASS. A mutual LIKE
// auto-creates the Application — see pitch doc section 03: swipe is
// just another entry point into the same pipeline as a direct apply.
matchesRouter.post("/api/matches/:id/swipe", requireAuth, async (req, res) => {
  const parsed = swipeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const match = await db.matchCandidate.findUnique({
    where: { id: String(req.params.id) },
    include: { jobPosting: { include: { school: true } }, teacherProfile: true },
  });
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const accountType = req.session!.user.accountType;
  const userId = req.session!.user.id;

  let data: { schoolSwipe: "LIKE" | "PASS" } | { teacherSwipe: "LIKE" | "PASS" };

  if (accountType === "SCHOOL") {
    const schoolProfile = await db.schoolProfile.findUnique({ where: { userId } });
    if (!schoolProfile || schoolProfile.id !== match.jobPosting.schoolId) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    data = { schoolSwipe: parsed.data.direction };
  } else if (accountType === "TEACHER") {
    const teacherProfile = await db.teacherProfile.findUnique({ where: { userId } });
    if (!teacherProfile || teacherProfile.id !== match.teacherProfileId) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    data = { teacherSwipe: parsed.data.direction };
  } else {
    res.status(403).json({ error: "Not permitted for this account type" });
    return;
  }

  let updated = await db.matchCandidate.update({ where: { id: match.id }, data });

  if (updated.schoolSwipe === "LIKE" && updated.teacherSwipe === "LIKE" && !updated.matchedAt) {
    updated = await db.matchCandidate.update({ where: { id: match.id }, data: { matchedAt: new Date() } });

    try {
      await db.application.create({
        data: {
          jobPostingId: updated.jobPostingId,
          teacherProfileId: updated.teacherProfileId,
          source: "SWIPE_MATCH",
        },
      });
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) {
        throw err;
      }
    }

    await Promise.all([
      notifyUser(match.jobPosting.school.userId, "MATCH", {
        matchId: updated.id,
        jobPostingId: match.jobPosting.id,
        subject: match.jobPosting.subject,
        teacherName: match.teacherProfile.fullName,
      }),
      notifyUser(match.teacherProfile.userId, "MATCH", {
        matchId: updated.id,
        jobPostingId: match.jobPosting.id,
        subject: match.jobPosting.subject,
        schoolName: match.jobPosting.school.name,
      }),
    ]);
  }

  res.json({ match: updated, matched: Boolean(updated.matchedAt) });
});
