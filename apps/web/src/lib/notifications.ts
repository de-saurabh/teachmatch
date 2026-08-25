export interface Notification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  sentAt: string;
  readAt: string | null;
}

export function describeNotification(notification: Notification): string {
  const payload = notification.payload;

  switch (notification.type) {
    case "NEW_APPLICATION":
      return `${payload.teacherName} applied to your ${payload.subject} posting.`;
    case "APPLICATION_STATUS_CHANGED":
      return `Your application for ${payload.subject} is now ${payload.status}.`;
    case "MATCH":
      return payload.schoolName
        ? `You matched with ${payload.schoolName} for ${payload.subject}.`
        : `You matched with ${payload.teacherName} for ${payload.subject}.`;
    default:
      return notification.type;
  }
}
