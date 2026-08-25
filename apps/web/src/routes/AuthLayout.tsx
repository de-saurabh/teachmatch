import { CheckCircleOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";
import type { PropsWithChildren } from "react";

const { Title, Text } = Typography;

export function AuthLayout({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <Flex align="center" justify="center" style={{ minHeight: "100vh", padding: 24 }}>
      <div className="chalk-frame" style={{ width: "100%", maxWidth: 420, padding: "44px 38px 38px" }}>
        <div className="chalk-dust" aria-hidden="true">
          <i style={{ top: "10%", left: "8%", animationDelay: "0s" }} />
          <i style={{ top: "78%", left: "84%", animationDelay: "2s" }} />
          <i style={{ top: "55%", left: "5%", animationDelay: "1.2s" }} />
          <i style={{ top: "22%", left: "90%", animationDelay: "2.8s" }} />
        </div>

        <CheckCircleOutlined style={{ fontSize: 28, color: "var(--chalk-yellow)" }} />

        <div style={{ overflow: "hidden", marginTop: 14 }}>
          <Title level={2} className="chalk-h1" style={{ fontSize: 44, margin: "0 0 6px" }}>
            {title}
          </Title>
        </div>
        <Text type="secondary">{subtitle}</Text>

        <div style={{ marginTop: 28 }}>{children}</div>
      </div>
    </Flex>
  );
}
