import { db } from "../config/db";
import { computeMatchScore } from "../domain/matching";

// Recompute (or create) MatchCandidate rows for one job posting against
// every verified teacher. Called on job creation and when a school gets
// verified. A no-op if the job isn't open or its school isn't verified.
export async function syncMatchesForJobPosting(jobPostingId: string) {
  const job = await db.jobPosting.findUnique({ where: { id: jobPostingId }, include: { school: true } });
  if (!job || job.status !== "OPEN" || job.school.isHidden) return;

  const teachers = await db.teacherProfile.findMany({ where: { isHidden: false } });

  for (const teacher of teachers) {
    const score = computeMatchScore(job, teacher);
    if (score <= 0) continue;

    await db.matchCandidate.upsert({
      where: { jobPostingId_teacherProfileId: { jobPostingId: job.id, teacherProfileId: teacher.id } },
      create: { jobPostingId: job.id, teacherProfileId: teacher.id, score },
      update: { score },
    });
  }
}

// Same idea, the other direction: one teacher against every open
// posting from a verified school. Called on profile update and when
// the teacher gets verified.
export async function syncMatchesForTeacher(teacherProfileId: string) {
  const teacher = await db.teacherProfile.findUnique({ where: { id: teacherProfileId } });
  if (!teacher || teacher.isHidden) return;

  const jobs = await db.jobPosting.findMany({ where: { status: "OPEN", school: { isHidden: false } } });

  for (const job of jobs) {
    const score = computeMatchScore(job, teacher);
    if (score <= 0) continue;

    await db.matchCandidate.upsert({
      where: { jobPostingId_teacherProfileId: { jobPostingId: job.id, teacherProfileId: teacher.id } },
      create: { jobPostingId: job.id, teacherProfileId: teacher.id, score },
      update: { score },
    });
  }
}
