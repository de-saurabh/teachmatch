import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Space, Tag, Typography, message } from "antd";

import { apiFetch, ApiError } from "../lib/api";

const { Title, Paragraph, Text } = Typography;

interface PendingSchool {
  id: string;
  name: string;
  board: string;
  udiseCode: string | null;
  city: string;
  state: string;
}

interface PendingTeacher {
  id: string;
  fullName: string;
  subjects: string[];
  gradeLevels: string[];
  experienceYears: number;
  city: string;
  state: string;
}

export function AdminVerificationsPage() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: me, isPending: mePending } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => apiFetch<{ permissions: string[] }>("/api/admin/me"),
  });
  const isAdmin = me?.permissions.includes("CAN_REVIEW_VERIFICATION") ?? false;

  const { data, isPending } = useQuery({
    queryKey: ["admin", "verifications"],
    queryFn: () => apiFetch<{ schools: PendingSchool[]; teachers: PendingTeacher[] }>("/api/admin/verifications"),
    enabled: isAdmin,
  });

  if (!mePending && !isAdmin) {
    return (
      <div>
        <Title level={2} style={{ margin: "0 0 6px" }}>
          Not authorized
        </Title>
        <Paragraph type="secondary">You don't have access to the verification queue.</Paragraph>
      </div>
    );
  }

  const decide = useMutation({
    mutationFn: ({
      kind,
      id,
      status,
    }: {
      kind: "school" | "teacher";
      id: string;
      status: "VERIFIED" | "REJECTED";
    }) => apiFetch(`/api/admin/verifications/${kind}/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      messageApi.success("Saved");
    },
    onError: (err) => {
      messageApi.error(err instanceof ApiError ? err.message : "Something went wrong");
    },
  });

  return (
    <div style={{ maxWidth: 720 }}>
      {contextHolder}
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 40, margin: "0 0 6px" }}>
          Verification queue
        </Title>
      </div>
      <Paragraph type="secondary">
        {(data?.schools.length ?? 0) + (data?.teachers.length ?? 0)} profiles waiting on review.
      </Paragraph>

      <Title level={4} style={{ marginTop: 24 }}>
        Schools
      </Title>
      <Flex vertical gap={16}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.schools.length === 0 && <Text type="secondary">Nothing pending.</Text>}
        {data?.schools.map((school) => (
          <div key={school.id} className="chalk-frame" style={{ padding: "18px 22px" }}>
            <Flex justify="space-between" align="center" wrap gap={12}>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {school.name}
                </Text>
                <div>
                  <Text type="secondary">
                    {school.board} · {school.city}, {school.state}
                    {school.udiseCode ? ` · UDISE ${school.udiseCode}` : ""}
                  </Text>
                </div>
              </div>
              <Space>
                <Button
                  type="primary"
                  loading={decide.isPending && decide.variables?.id === school.id}
                  onClick={() => decide.mutate({ kind: "school", id: school.id, status: "VERIFIED" })}
                >
                  Verify
                </Button>
                <Button
                  danger
                  loading={decide.isPending && decide.variables?.id === school.id}
                  onClick={() => decide.mutate({ kind: "school", id: school.id, status: "REJECTED" })}
                >
                  Reject
                </Button>
              </Space>
            </Flex>
          </div>
        ))}
      </Flex>

      <Title level={4} style={{ marginTop: 32 }}>
        Teachers
      </Title>
      <Flex vertical gap={16}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.teachers.length === 0 && <Text type="secondary">Nothing pending.</Text>}
        {data?.teachers.map((teacher) => (
          <div key={teacher.id} className="chalk-frame" style={{ padding: "18px 22px" }}>
            <Flex justify="space-between" align="flex-start" wrap gap={12}>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {teacher.fullName}
                </Text>
                <div>
                  <Text type="secondary">
                    {teacher.experienceYears} yrs · {teacher.city}, {teacher.state}
                  </Text>
                </div>
                <Flex gap={8} style={{ marginTop: 6 }} wrap>
                  {teacher.subjects.map((subject) => (
                    <Tag key={subject}>{subject}</Tag>
                  ))}
                  {teacher.gradeLevels.map((grade) => (
                    <Tag key={grade} color="blue">
                      {grade}
                    </Tag>
                  ))}
                </Flex>
              </div>
              <Space>
                <Button
                  type="primary"
                  loading={decide.isPending && decide.variables?.id === teacher.id}
                  onClick={() => decide.mutate({ kind: "teacher", id: teacher.id, status: "VERIFIED" })}
                >
                  Verify
                </Button>
                <Button
                  danger
                  loading={decide.isPending && decide.variables?.id === teacher.id}
                  onClick={() => decide.mutate({ kind: "teacher", id: teacher.id, status: "REJECTED" })}
                >
                  Reject
                </Button>
              </Space>
            </Flex>
          </div>
        ))}
      </Flex>
    </div>
  );
}
