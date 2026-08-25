import { useQuery } from "@tanstack/react-query";
import { Flex, Tag, Typography } from "antd";
import { useParams } from "react-router";

import { apiFetch } from "../lib/api";
import type { JobApplicant } from "../lib/types";

const { Title, Paragraph, Text } = Typography;

export function JobApplicantsPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isPending } = useQuery({
    queryKey: ["job-postings", id, "applications"],
    queryFn: () => apiFetch<{ applications: JobApplicant[] }>(`/api/job-postings/${id}/applications`),
    enabled: Boolean(id),
  });

  return (
    <div style={{ maxWidth: 640 }}>
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
            <Tag color="gold" style={{ marginTop: 8 }}>
              {application.status}
            </Tag>
          </div>
        ))}
      </Flex>
    </div>
  );
}
