import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Space, Tag, Typography } from "antd";
import { Link } from "react-router";

import { apiFetch } from "../lib/api";
import type { MyJobPosting } from "../lib/types";

const { Title, Text } = Typography;

const statusColor: Record<MyJobPosting["status"], string> = {
  OPEN: "green",
  FILLED: "blue",
  CLOSED: "default",
};

export function MyJobPostingsPage() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["job-postings", "mine"],
    queryFn: () => apiFetch<{ postings: MyJobPosting[] }>("/api/job-postings/mine"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ postingId, status }: { postingId: string; status: MyJobPosting["status"] }) =>
      apiFetch(`/api/job-postings/${postingId}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job-postings", "mine"] }),
  });

  return (
    <div style={{ maxWidth: 640 }}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <div style={{ overflow: "hidden" }}>
          <Title level={2} className="chalk-h1" style={{ fontSize: 40, margin: 0 }}>
            My postings
          </Title>
        </div>
        <Link to="/jobs/new">
          <Button type="primary">Post a job</Button>
        </Link>
      </Flex>

      <Flex vertical gap={16} style={{ marginTop: 24 }}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.postings.length === 0 && (
          <Text type="secondary">You haven't posted any jobs yet.</Text>
        )}

        {data?.postings.map((posting) => (
          <div key={posting.id} className="chalk-frame" style={{ padding: "20px 24px" }}>
            <Flex justify="space-between" align="flex-start" gap={12} wrap>
              <div>
                <Text strong style={{ fontSize: 17 }}>
                  {posting.subject} · {posting.gradeLevel}
                </Text>
                <div>
                  <Text type="secondary">
                    {posting.board} · {posting.city}, {posting.state}
                  </Text>
                </div>
                <Flex gap={8} style={{ marginTop: 8 }}>
                  <Tag color={statusColor[posting.status]}>{posting.status}</Tag>
                  {posting.isUrgent && <Tag color="gold">Urgent</Tag>}
                  <Tag>
                    {posting.applicationCount} applicant{posting.applicationCount === 1 ? "" : "s"}
                  </Tag>
                </Flex>
              </div>
              <Space direction="vertical" align="end">
                <Space>
                  <Link to={`/jobs/${posting.id}/edit`}>
                    <Button size="small">Edit</Button>
                  </Link>
                  <Link to={`/jobs/${posting.id}/applicants`}>
                    <Button size="small">Applicants</Button>
                  </Link>
                  <Link to={`/jobs/${posting.id}/matches`}>
                    <Button size="small">Suggested</Button>
                  </Link>
                </Space>
                <Space>
                  {posting.status !== "FILLED" && (
                    <Button
                      size="small"
                      loading={statusMutation.isPending && statusMutation.variables?.postingId === posting.id}
                      onClick={() => statusMutation.mutate({ postingId: posting.id, status: "FILLED" })}
                    >
                      Mark filled
                    </Button>
                  )}
                  {posting.status !== "CLOSED" && (
                    <Button
                      size="small"
                      loading={statusMutation.isPending && statusMutation.variables?.postingId === posting.id}
                      onClick={() => statusMutation.mutate({ postingId: posting.id, status: "CLOSED" })}
                    >
                      Close
                    </Button>
                  )}
                  {posting.status !== "OPEN" && (
                    <Button
                      size="small"
                      loading={statusMutation.isPending && statusMutation.variables?.postingId === posting.id}
                      onClick={() => statusMutation.mutate({ postingId: posting.id, status: "OPEN" })}
                    >
                      Reopen
                    </Button>
                  )}
                </Space>
              </Space>
            </Flex>
          </div>
        ))}
      </Flex>
    </div>
  );
}
