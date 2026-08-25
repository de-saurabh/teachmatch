import { Alert, Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { signIn } from "../lib/auth-client";
import { AuthLayout } from "./AuthLayout";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish(values: LoginFormValues) {
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await signIn.email({
      email: values.email,
      password: values.password,
    });

    setSubmitting(false);

    if (signInError) {
      setError(signInError.message ?? "Invalid email or password.");
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your TeachMatch account">
      <Form<LoginFormValues> layout="vertical" onFinish={handleFinish} disabled={submitting}>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
        >
          <Input className="chalk-input" variant="underlined" autoComplete="email" />
        </Form.Item>

        <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter your password" }]}>
          <Input.Password className="chalk-input" variant="underlined" autoComplete="current-password" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Log in
          </Button>
        </Form.Item>
      </Form>

      <Typography.Text type="secondary">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </Typography.Text>
    </AuthLayout>
  );
}
