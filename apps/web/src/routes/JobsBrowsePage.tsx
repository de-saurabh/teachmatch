import type { JobPostingSummary } from "@teachmatch/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Flex, Input, Switch, Tag, Typography, message } from "antd";
import { useState } from "react";

import { apiFetch, ApiError } from "../lib/api";

const { Title, Paragraph, Text } = Typography;

const badgeLabel: Record<string, string> = {
  WITHIN_RANGE: "Within your range",
  WITHIN_LEEWAY: "Within your flexible range",
  OUTSIDE_RANGE: "Outside your range",
};

interface Filters {
  subject: string;
  city: string;
  urgentOnly: boolean;
}

export function JobsBrowsePage() {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [messageApi, contextHolder] = message.useMessage();
  const [filters, setFilters] = useState<Filters>({ subject: "", city: "", urgentOnly: false });

  const params = new URLSearchParams();
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.city) params.set("city", filters.city);
  if (filters.urgentOnly) params.set("isUrgent", "true");
  const queryString = params.toString();

  const { data, isPending } = useQuery({
    queryKey: ["job-postings", "open", filters],
    queryFn: () => apiFetch<{ postings: JobPostingSummary[] }>(`/api/job-postings${queryString ? `?${queryString}` : ""}`),
  });

  const applyMutation = useMutation({
    mutationFn: (postingId: string) => apiFetch(`/api/job-postings/${postingId}/apply`, { method: "POST" }),
    onSuccess: (_data, postingId) => {
      setAppliedIds((prev) => new Set(prev).add(postingId));
      messageApi.success("Applied!");
    },
    onError: (err) => {
      messageApi.error(err instanceof ApiError ? err.message : "Something went wrong");
    },
  });

  return (
    <div style={{ maxWidth: 640 }}>
      {contextHolder}
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 40, margin: "0 0 6px" }}>
          Open positions
        </Title>
      </div>
      <Paragraph type="secondary">{data?.postings.length ?? 0} jobs open right now.</Paragraph>

      <Flex gap={12} wrap align="center" style={{ marginBottom: 8 }}>
        <Input
          placeholder="Subject"
          value={filters.subject}
          onChange={(e) => setFilters((prev) => ({ ...prev, subject: e.target.value }))}
          style={{ width: 180 }}
          allowClear
        />
        <Input
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
          style={{ width: 180 }}
          allowClear
        />
        <Flex align="center" gap={8}>
          <Text type="secondary">Urgent only</Text>
          <Switch
            checked={filters.urgentOnly}
            onChange={(checked) => setFilters((prev) => ({ ...prev, urgentOnly: checked }))}
          />
        </Flex>
      </Flex>

      <Flex vertical gap={16} style={{ marginTop: 16 }}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.postings.length === 0 && <Text type="secondary">No open postings match your search.</Text>}

        {data?.postings.map((posting) => (
          <div key={posting.id} className="chalk-frame" style={{ padding: "20px 24px" }}>
            <Flex justify="space-between" align="flex-start" gap={12} wrap>
              <div>
                <Text strong style={{ fontSize: 17 }}>
                  {posting.subject} · {posting.gradeLevel}
                </Text>
                <div>
                  <Text type="secondary">
                    {posting.schoolName} · {posting.board} · {posting.city}, {posting.state}
                  </Text>
                </div>
                <Flex gap={8} style={{ marginTop: 8 }}>
                  {posting.isUrgent && <Tag color="gold">Urgent</Tag>}
                  {posting.salaryBadge && <Tag color="green">{badgeLabel[posting.salaryBadge]}</Tag>}
                </Flex>
              </div>
              <Button
                type="primary"
                disabled={appliedIds.has(posting.id)}
                loading={applyMutation.isPending && applyMutation.variables === posting.id}
                onClick={() => applyMutation.mutate(posting.id)}
              >
                {appliedIds.has(posting.id) ? "Applied" : "Apply"}
              </Button>
            </Flex>
          </div>
        ))}
      </Flex>
    </div>
  );
}
