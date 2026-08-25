import type { AccountType } from "@teachmatch/shared";
import { Alert, Button, Form, Input, Segmented, Typography } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { signUp } from "../lib/auth-client";
import { AuthLayout } from "./AuthLayout";

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  accountType: AccountType;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish(values: SignupFormValues) {
    setError(null);
    setSubmitting(true);

    const { error: signUpError } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      accountType: values.accountType,
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message ?? "Something went wrong. Please try again.");
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join TeachMatch as a school, agency, or teacher">
      <Form<SignupFormValues>
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ accountType: "TEACHER" }}
        disabled={submitting}
      >
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

        <Form.Item name="accountType" label="I am a">
          <Segmented
            block
            options={[
              { label: "Teacher", value: "TEACHER" },
              { label: "School", value: "SCHOOL" },
              { label: "Agency", value: "AGENCY" },
            ]}
          />
        </Form.Item>

        <Form.Item name="name" label="Full name" rules={[{ required: true, message: "Enter your name" }]}>
          <Input className="chalk-input" variant="underlined" autoComplete="name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
        >
          <Input className="chalk-input" variant="underlined" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, min: 8, message: "At least 8 characters" }]}
        >
          <Input.Password className="chalk-input" variant="underlined" autoComplete="new-password" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Sign up
          </Button>
        </Form.Item>
      </Form>

      <Typography.Text type="secondary">
        Already have an account? <Link to="/login">Log in</Link>
      </Typography.Text>
    </AuthLayout>
  );
}
