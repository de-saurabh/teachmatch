import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Form, Input, Typography } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { apiFetch, ApiError } from "../lib/api";
import type { SchoolProfile } from "../lib/types";

const { Title, Paragraph } = Typography;

interface SchoolProfileFormValues {
  name: string;
  board: string;
  udiseCode?: string;
  city: string;
  state: string;
}

export function OnboardingSchoolPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<SchoolProfileFormValues>();

  const { data } = useQuery({
    queryKey: ["school-profile", "me"],
    queryFn: () => apiFetch<{ profile: SchoolProfile | null }>("/api/school-profile/me"),
  });

  useEffect(() => {
    if (data?.profile) {
      form.setFieldsValue({ ...data.profile, udiseCode: data.profile.udiseCode ?? undefined });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (values: SchoolProfileFormValues) =>
      apiFetch<{ profile: SchoolProfile }>("/api/school-profile/me", {
        method: "PUT",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-profile", "me"] });
      navigate("/", { replace: true });
    },
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 40, margin: "0 0 6px" }}>
          Your school
        </Title>
      </div>
      <Paragraph type="secondary">This shows up on every job posting you create.</Paragraph>

      <Form<SchoolProfileFormValues>
        form={form}
        layout="vertical"
        onFinish={(values) => mutation.mutate(values)}
        disabled={mutation.isPending}
        style={{ marginTop: 24 }}
      >
        {mutation.isError && (
          <Alert
            type="error"
            message={mutation.error instanceof ApiError ? mutation.error.message : "Something went wrong"}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item name="name" label="School name" rules={[{ required: true, message: "Enter the school name" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="board" label="Board" rules={[{ required: true, message: "e.g. CBSE, ICSE, State board" }]}>
          <Input placeholder="CBSE, ICSE, State board, IB…" />
        </Form.Item>

        <Form.Item name="udiseCode" label="UDISE code (optional)">
          <Input />
        </Form.Item>

        <Form.Item name="city" label="City" rules={[{ required: true, message: "Enter the city" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="state" label="State" rules={[{ required: true, message: "Enter the state" }]}>
          <Input />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={mutation.isPending}>
          Save
        </Button>
      </Form>
    </div>
  );
}
