import { Router } from "express";

import { db } from "../config/db";
import { requireAuth } from "../middleware/require-auth";

export const notificationsRouter = Router();

notificationsRouter.get("/api/notifications/mine", requireAuth, async (req, res) => {
  const notifications = await db.notification.findMany({
    where: { userId: req.session!.user.id },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  res.json({
    notifications: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      payload: notification.payload,
      sentAt: notification.sentAt.toISOString(),
      readAt: notification.readAt?.toISOString() ?? null,
    })),
  });
});

notificationsRouter.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
  const notification = await db.notification.findUnique({ where: { id: String(req.params.id) } });

  if (!notification || notification.userId !== req.session!.user.id) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  const updated = await db.notification.update({
    where: { id: notification.id },
    data: { readAt: notification.readAt ?? new Date() },
  });

  res.json({
    notification: {
      id: updated.id,
      type: updated.type,
      payload: updated.payload,
      sentAt: updated.sentAt.toISOString(),
      readAt: updated.readAt?.toISOString() ?? null,
    },
  });
});
