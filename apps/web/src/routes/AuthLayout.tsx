import { CheckCircleOutlined } from "@ant-design/icons";
import { Card, Flex, Typography } from "antd";
import type { PropsWithChildren } from "react";

const { Title, Text } = Typography;

export function AuthLayout({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <Flex align="center" justify="center" style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Card style={{ width: 400 }}>
        <Flex vertical align="center" gap={4} style={{ marginBottom: 24 }}>
          <CheckCircleOutlined style={{ fontSize: 32, color: "#3B6E55" }} />
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary">{subtitle}</Text>
        </Flex>
        {children}
      </Card>
    </Flex>
  );
}
