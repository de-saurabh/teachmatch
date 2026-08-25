import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Space, Typography } from "antd";
import type { PropsWithChildren } from "react";
import { Link, useNavigate } from "react-router";

import { signOut, useSession } from "../lib/auth-client";

export function AppShell({ children }: PropsWithChildren) {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const accountType = session?.user.accountType;

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <Flex vertical style={{ minHeight: "100vh" }}>
      <Flex
        align="center"
        justify="space-between"
        wrap
        gap={12}
        style={{ padding: "16px 32px", borderBottom: "2px dashed rgba(244, 241, 230, 0.25)" }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircleOutlined style={{ color: "var(--chalk-yellow)" }} />
          <Typography.Text strong style={{ fontFamily: "'Caveat', cursive", fontSize: 24 }}>
            TeachMatch
          </Typography.Text>
        </Link>
        <Space size="large">
          {accountType === "TEACHER" && <Link to="/jobs">Browse jobs</Link>}
          {accountType === "TEACHER" && <Link to="/applications/mine">My applications</Link>}
          {accountType === "SCHOOL" && <Link to="/jobs/mine">My postings</Link>}
          {accountType === "SCHOOL" && <Link to="/jobs/new">Post a job</Link>}
          <Button size="small" onClick={handleLogout}>
            Log out
          </Button>
        </Space>
      </Flex>
      <Flex vertical flex={1} style={{ padding: "36px 32px" }}>
        {children}
      </Flex>
    </Flex>
  );
}
