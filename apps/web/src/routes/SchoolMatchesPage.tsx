import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Progress, Space, Tag, Typography, message } from "antd";
import { useParams } from "react-router";

import { apiFetch, ApiError } from "../lib/api";

const { Title, Paragraph, Text } = Typography;

interface MatchCandidateSummary {
  id: string;
  score: number;
  teacher: {
    fullName: string;
    subjects: string[];
    gradeLevels: string[];
    experienceYears: number;
    city: string;
    state: string;
  };
}

export function SchoolMatchesPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isPending } = useQuery({
    queryKey: ["matches", "job-postings", id],
    queryFn: () => apiFetch<{ matches: MatchCandidateSummary[] }>(`/api/matches/job-postings/${id}`),
    enabled: Boolean(id),
  });

  const swipe = useMutation({
    mutationFn: ({ matchId, direction }: { matchId: string; direction: "LIKE" | "PASS" }) =>
      apiFetch<{ matched: boolean }>(`/api/matches/${matchId}/swipe`, {
        method: "POST",
        body: JSON.stringify({ direction }),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["matches", "job-postings", id] });
      queryClient.invalidateQueries({ queryKey: ["job-postings", id, "applications"] });
      messageApi.success(result.matched ? "It's a match! Added to applicants." : "Noted.");
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
          Suggested candidates
        </Title>
      </div>
      <Paragraph type="secondary">Teachers the matching engine thinks are a strong fit for this posting.</Paragraph>

      <Flex vertical gap={16} style={{ marginTop: 16 }}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.matches.length === 0 && (
          <Text type="secondary">No suggestions yet — check back once more teachers sign up.</Text>
        )}

        {data?.matches.map((match) => (
          <div key={match.id} className="chalk-frame" style={{ padding: "20px 24px" }}>
            <Flex justify="space-between" align="flex-start" gap={16} wrap>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Text strong style={{ fontSize: 17 }}>
                  {match.teacher.fullName}
                </Text>
                <div>
                  <Text type="secondary">
                    {match.teacher.experienceYears} yrs experience · {match.teacher.city}, {match.teacher.state}
                  </Text>
                </div>
                <Flex gap={8} style={{ marginTop: 8 }} wrap>
                  {match.teacher.subjects.map((subject) => (
                    <Tag key={subject}>{subject}</Tag>
                  ))}
                  {match.teacher.gradeLevels.map((grade) => (
                    <Tag key={grade} color="blue">
                      {grade}
                    </Tag>
                  ))}
                </Flex>
                <Progress
                  percent={Math.round(match.score * 100)}
                  size="small"
                  showInfo={false}
                  strokeColor="var(--chalk-yellow)"
                  style={{ maxWidth: 200, marginTop: 10 }}
                />
              </div>
              <Space>
                <Button
                  type="primary"
                  loading={swipe.isPending && swipe.variables?.matchId === match.id}
                  onClick={() => swipe.mutate({ matchId: match.id, direction: "LIKE" })}
                >
                  Like
                </Button>
                <Button
                  loading={swipe.isPending && swipe.variables?.matchId === match.id}
                  onClick={() => swipe.mutate({ matchId: match.id, direction: "PASS" })}
                >
                  Pass
                </Button>
              </Space>
            </Flex>
          </div>
        ))}
      </Flex>
    </div>
  );
}
