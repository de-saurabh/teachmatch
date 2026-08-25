import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import { signOut, useSession } from "../lib/auth-client";

const { Title, Paragraph } = Typography;

export function DashboardPage() {
  const { data: session } = useSession();

  return (
    <Flex vertical align="center" justify="center" gap="middle" style={{ minHeight: "100vh" }}>
      <CheckCircleOutlined style={{ fontSize: 40, color: "#3B6E55" }} />
      <Title level={2} style={{ margin: 0 }}>
        Welcome, {session?.user.name}
      </Title>
      <Paragraph type="secondary">
        Signed in as {session?.user.email} · {session?.user.accountType}
      </Paragraph>
      <Button onClick={() => signOut()}>Log out</Button>
    </Flex>
  );
}
