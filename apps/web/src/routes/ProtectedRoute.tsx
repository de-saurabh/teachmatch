import { Flex, Spin } from "antd";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router";

import { useSession } from "../lib/auth-client";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
