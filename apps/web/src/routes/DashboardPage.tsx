import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Space, Spin, Typography } from "antd";
import { Link } from "react-router";

import { useSession } from "../lib/auth-client";
import { apiFetch } from "../lib/api";
import type { SchoolProfile, TeacherProfile } from "../lib/types";

const { Title, Paragraph } = Typography;

export function DashboardPage() {
  const { data: session } = useSession();
  const accountType = session?.user.accountType;

  const schoolProfile = useQuery({
    queryKey: ["school-profile", "me"],
    queryFn: () => apiFetch<{ profile: SchoolProfile | null }>("/api/school-profile/me"),
    enabled: accountType === "SCHOOL",
  });

  const teacherProfile = useQuery({
    queryKey: ["teacher-profile", "me"],
    queryFn: () => apiFetch<{ profile: TeacherProfile | null }>("/api/teacher-profile/me"),
    enabled: accountType === "TEACHER",
  });

  const loadingProfile =
    (accountType === "SCHOOL" && schoolProfile.isPending) || (accountType === "TEACHER" && teacherProfile.isPending);

  if (loadingProfile) {
    return (
      <Flex align="center" justify="center" flex={1}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={8}>
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 44, margin: 0 }}>
          Welcome, {session?.user.name}
        </Title>
      </div>
      <Paragraph type="secondary">
        Signed in as {session?.user.email} · {accountType}
      </Paragraph>

      {accountType === "SCHOOL" && !schoolProfile.data?.profile && (
        <div className="chalk-frame" style={{ padding: 24, maxWidth: 420, marginTop: 16 }}>
          <Paragraph>Finish setting up your school profile before posting a job.</Paragraph>
          <Link to="/onboarding/school">
            <Button type="primary">Complete school profile</Button>
          </Link>
        </div>
      )}

      {accountType === "SCHOOL" && schoolProfile.data?.profile && (
        <Space style={{ marginTop: 16 }}>
          <Link to="/jobs/new">
            <Button type="primary">Post a job</Button>
          </Link>
          <Link to="/jobs/mine">
            <Button>My postings</Button>
          </Link>
        </Space>
      )}

      {accountType === "TEACHER" && !teacherProfile.data?.profile && (
        <div className="chalk-frame" style={{ padding: 24, maxWidth: 420, marginTop: 16 }}>
          <Paragraph>Finish setting up your teacher profile before applying to jobs.</Paragraph>
          <Link to="/onboarding/teacher">
            <Button type="primary">Complete teacher profile</Button>
          </Link>
        </div>
      )}

      {accountType === "TEACHER" && teacherProfile.data?.profile && (
        <Space style={{ marginTop: 16 }}>
          <Link to="/jobs">
            <Button type="primary">Browse jobs</Button>
          </Link>
        </Space>
      )}
    </Flex>
  );
}
