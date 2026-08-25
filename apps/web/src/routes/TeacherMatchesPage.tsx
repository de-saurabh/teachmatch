import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Progress, Space, Typography, message } from "antd";

import { apiFetch, ApiError } from "../lib/api";

const { Title, Paragraph, Text } = Typography;

interface MatchRecommendation {
  id: string;
  score: number;
  jobPosting: {
    id: string;
    subject: string;
    gradeLevel: string;
    board: string;
    city: string;
    state: string;
    schoolName: string;
  };
}

export function TeacherMatchesPage() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isPending } = useQuery({
    queryKey: ["matches", "mine"],
    queryFn: () => apiFetch<{ matches: MatchRecommendation[] }>("/api/matches/mine"),
  });

  const swipe = useMutation({
    mutationFn: ({ matchId, direction }: { matchId: string; direction: "LIKE" | "PASS" }) =>
      apiFetch<{ matched: boolean }>(`/api/matches/${matchId}/swipe`, {
        method: "POST",
        body: JSON.stringify({ direction }),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["matches", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["applications", "mine"] });
      messageApi.success(result.matched ? "It's a match! Added to your applications." : "Noted.");
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
          Suggested for you
        </Title>
      </div>
      <Paragraph type="secondary">Jobs the matching engine thinks fit your profile.</Paragraph>

      <Flex vertical gap={16} style={{ marginTop: 16 }}>
        {isPending && <Text type="secondary">Loading…</Text>}
        {!isPending && data?.matches.length === 0 && (
          <Text type="secondary">No suggestions yet — check back once more schools post jobs.</Text>
        )}

        {data?.matches.map((match) => (
          <div key={match.id} className="chalk-frame" style={{ padding: "20px 24px" }}>
            <Flex justify="space-between" align="flex-start" gap={16} wrap>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Text strong style={{ fontSize: 17 }}>
                  {match.jobPosting.subject} · {match.jobPosting.gradeLevel}
                </Text>
                <div>
                  <Text type="secondary">
                    {match.jobPosting.schoolName} · {match.jobPosting.board} · {match.jobPosting.city},{" "}
                    {match.jobPosting.state}
                  </Text>
                </div>
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
