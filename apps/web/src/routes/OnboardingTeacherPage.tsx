import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Form, Input, InputNumber, Select, Typography } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { apiFetch, ApiError } from "../lib/api";
import type { TeacherProfile } from "../lib/types";

const { Title, Paragraph } = Typography;

interface TeacherProfileFormValues {
  fullName: string;
  subjects: string[];
  gradeLevels: string[];
  experienceYears: number;
  city: string;
  state: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryLeeway?: number;
}

export function OnboardingTeacherPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<TeacherProfileFormValues>();

  const { data } = useQuery({
    queryKey: ["teacher-profile", "me"],
    queryFn: () => apiFetch<{ profile: TeacherProfile | null }>("/api/teacher-profile/me"),
  });

  useEffect(() => {
    if (data?.profile) {
      form.setFieldsValue({
        ...data.profile,
        salaryMin: data.profile.salaryMin ?? undefined,
        salaryMax: data.profile.salaryMax ?? undefined,
        salaryLeeway: data.profile.salaryLeeway ?? undefined,
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (values: TeacherProfileFormValues) =>
      apiFetch<{ profile: TeacherProfile }>("/api/teacher-profile/me", {
        method: "PUT",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-profile", "me"] });
      navigate("/", { replace: true });
    },
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 40, margin: "0 0 6px" }}>
          Your profile
        </Title>
      </div>
      <Paragraph type="secondary">This is what schools see when they review your applications.</Paragraph>

      <Form<TeacherProfileFormValues>
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

        <Form.Item name="fullName" label="Full name" rules={[{ required: true, message: "Enter your name" }]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="subjects"
          label="Subjects you teach"
          rules={[{ required: true, type: "array", min: 1, message: "Add at least one subject" }]}
        >
          <Select mode="tags" placeholder="Mathematics, Science…" />
        </Form.Item>

        <Form.Item
          name="gradeLevels"
          label="Grade levels"
          rules={[{ required: true, type: "array", min: 1, message: "Add at least one grade level" }]}
        >
          <Select mode="tags" placeholder="Grade 6, Grade 7…" />
        </Form.Item>

        <Form.Item
          name="experienceYears"
          label="Years of experience"
          rules={[{ required: true, message: "Enter your years of experience" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="city" label="City" rules={[{ required: true, message: "Enter your city" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="state" label="State" rules={[{ required: true, message: "Enter your state" }]}>
          <Input />
        </Form.Item>

        <Paragraph type="secondary" style={{ marginBottom: 8 }}>
          Salary expectations (optional — never shown to schools, only used for match badges)
        </Paragraph>

        <Form.Item name="salaryMin" label="Minimum, per month (₹)">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="salaryMax" label="Maximum, per month (₹)">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="salaryLeeway" label="Flexible by up to (₹)">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={mutation.isPending}>
          Save
        </Button>
      </Form>
    </div>
  );
}
