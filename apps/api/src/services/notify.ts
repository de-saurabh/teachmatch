import type { Prisma } from "@prisma/client";

import { db } from "../config/db";

// No push/email delivery is wired up yet — this just writes the row
// the in-app notification list reads. channel is always PUSH for now;
// swap in real delivery (APNs/FCM, email) behind this one function
// when that infra exists, without touching call sites.
export async function notifyUser(userId: string, type: string, payload: Prisma.InputJsonValue) {
  await db.notification.create({
    data: { userId, channel: "PUSH", type, payload },
  });
}
