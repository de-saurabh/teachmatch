import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import { signOut, useSession } from "../lib/auth-client";

const { Title, Paragraph } = Typography;

export function DashboardPage() {
  const { data: session } = useSession();

  return (
    <Flex vertical align="center" justify="center" gap="middle" style={{ minHeight: "100vh" }}>
      <CheckCircleOutlined style={{ fontSize: 36, color: "var(--chalk-yellow)" }} />
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 48, margin: 0 }}>
          Welcome, {session?.user.name}
        </Title>
      </div>
      <Paragraph type="secondary">
        Signed in as {session?.user.email} · {session?.user.accountType}
      </Paragraph>
      <Button onClick={() => signOut()}>Log out</Button>
    </Flex>
  );
}
