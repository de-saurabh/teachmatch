import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flex, Select, Tag, Typography, message } from "antd";
import { useParams } from "react-router";

import { apiFetch, ApiError } from "../lib/api";
import type { JobApplicant } from "../lib/types";

const { Title, Paragraph, Text } = Typography;

const statusOptions: JobApplicant["status"][] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

const statusColor: Record<JobApplicant["status"], string> = {
  APPLIED: "default",
  SHORTLISTED: "gold",
  INTERVIEW: "blue",
  OFFER: "purple",
  HIRED: "green",
  REJECTED: "red",
};

export function JobApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isPending } = useQuery({
    queryKey: ["job-postings", id, "applications"],
    queryFn: () => apiFetch<{ applications: JobApplicant[] }>(`/api/job-postings/${id}/applications`),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: JobApplicant["status"] }) =>
      apiFetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings", id, "applications"] });
      messageApi.success("Status updated");
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
          Applicants
        </Title>
      </div>
      <Paragraph type="secondary">{data?.applications.length ?? 0} teachers have applied.</Paragraph>

      <Flex vertical gap={16} style={{ marginTop: 16 }}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.applications.length === 0 && (
          <Text type="secondary">No applications yet — check back soon.</Text>
        )}

        {data?.applications.map((application) => (
          <div key={application.id} className="chalk-frame" style={{ padding: "20px 24px" }}>
            <Flex justify="space-between" align="flex-start" gap={12} wrap>
              <div>
                <Text strong style={{ fontSize: 17 }}>
                  {application.teacher.fullName}
                </Text>
                <div>
                  <Text type="secondary">
                    {application.teacher.experienceYears} yrs experience · {application.teacher.city},{" "}
                    {application.teacher.state}
                  </Text>
                </div>
                <Flex gap={8} style={{ marginTop: 8 }} wrap>
                  {application.teacher.subjects.map((subject) => (
                    <Tag key={subject}>{subject}</Tag>
                  ))}
                  {application.teacher.gradeLevels.map((grade) => (
                    <Tag key={grade} color="blue">
                      {grade}
                    </Tag>
                  ))}
                </Flex>
              </div>
              <Select<JobApplicant["status"]>
                value={application.status}
                style={{ width: 150 }}
                loading={statusMutation.isPending && statusMutation.variables?.applicationId === application.id}
                onChange={(status) => statusMutation.mutate({ applicationId: application.id, status })}
                options={statusOptions.map((status) => ({
                  value: status,
                  label: <Tag color={statusColor[status]}>{status}</Tag>,
                }))}
              />
            </Flex>
          </div>
        ))}
      </Flex>
    </div>
  );
}
