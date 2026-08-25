import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flex, Typography } from "antd";

import { apiFetch } from "../lib/api";
import { describeNotification, type Notification } from "../lib/notifications";

const { Title, Text } = Typography;

function timeAgo(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["notifications", "mine"],
    queryFn: () => apiFetch<{ notifications: Notification[] }>("/api/notifications/mine"),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", "mine"] }),
  });

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 40, margin: "0 0 6px" }}>
          Notifications
        </Title>
      </div>

      <Flex vertical gap={12} style={{ marginTop: 16 }}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.notifications.length === 0 && (
          <Text type="secondary">Nothing yet — you'll see application and match updates here.</Text>
        )}

        {data?.notifications.map((notification) => (
          <div
            key={notification.id}
            className="chalk-frame"
            style={{
              padding: "14px 18px",
              cursor: notification.readAt ? "default" : "pointer",
              opacity: notification.readAt ? 0.6 : 1,
            }}
            onClick={() => {
              if (!notification.readAt) markRead.mutate(notification.id);
            }}
          >
            <Text>{describeNotification(notification)}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {timeAgo(notification.sentAt)}
                {!notification.readAt && " · unread"}
              </Text>
            </div>
          </div>
        ))}
      </Flex>
    </div>
  );
}
