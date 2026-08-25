import { useQuery } from "@tanstack/react-query";
import { Flex, Tag, Typography } from "antd";

import { apiFetch } from "../lib/api";
import type { MyApplication } from "../lib/types";

const { Title, Text } = Typography;

const statusColor: Record<MyApplication["status"], string> = {
  APPLIED: "default",
  SHORTLISTED: "gold",
  INTERVIEW: "blue",
  OFFER: "purple",
  HIRED: "green",
  REJECTED: "red",
};

export function MyApplicationsPage() {
  const { data, isPending } = useQuery({
    queryKey: ["applications", "mine"],
    queryFn: () => apiFetch<{ applications: MyApplication[] }>("/api/applications/mine"),
  });

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 40, margin: "0 0 6px" }}>
          My applications
        </Title>
      </div>
      <Text type="secondary">{data?.applications.length ?? 0} jobs applied to.</Text>

      <Flex vertical gap={16} style={{ marginTop: 24 }}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.applications.length === 0 && (
          <Text type="secondary">You haven't applied to any jobs yet.</Text>
        )}

        {data?.applications.map((application) => (
          <div key={application.id} className="chalk-frame" style={{ padding: "20px 24px" }}>
            <Text strong style={{ fontSize: 17 }}>
              {application.jobPosting.subject} · {application.jobPosting.gradeLevel}
            </Text>
            <div>
              <Text type="secondary">
                {application.jobPosting.schoolName} · {application.jobPosting.board} ·{" "}
                {application.jobPosting.city}, {application.jobPosting.state}
              </Text>
            </div>
            <Tag color={statusColor[application.status]} style={{ marginTop: 8 }}>
              {application.status}
            </Tag>
          </div>
        ))}
      </Flex>
    </div>
  );
}
