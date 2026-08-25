import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Form, Input, InputNumber, Switch, Typography } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { apiFetch, ApiError } from "../lib/api";
import type { JobPosting } from "../lib/types";

const { Title, Paragraph } = Typography;

interface JobPostingFormValues {
  subject: string;
  gradeLevel: string;
  board: string;
  city: string;
  state: string;
  isUrgent?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryLeeway?: number;
}

export function EditJobPostingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<JobPostingFormValues>();

  const { data } = useQuery({
    queryKey: ["job-postings", id],
    queryFn: () => apiFetch<{ posting: JobPosting }>(`/api/job-postings/${id}`),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (data?.posting) {
      form.setFieldsValue({
        ...data.posting,
        salaryMin: data.posting.salaryMin ?? undefined,
        salaryMax: data.posting.salaryMax ?? undefined,
        salaryLeeway: data.posting.salaryLeeway ?? undefined,
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (values: JobPostingFormValues) =>
      apiFetch(`/api/job-postings/${id}`, { method: "PATCH", body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      navigate("/jobs/mine", { replace: true });
    },
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ overflow: "hidden" }}>
        <Title level={2} className="chalk-h1" style={{ fontSize: 40, margin: "0 0 6px" }}>
          Edit posting
        </Title>
      </div>
      <Paragraph type="secondary">Changes go live for teachers immediately.</Paragraph>

      <Form<JobPostingFormValues>
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

        <Form.Item name="subject" label="Subject" rules={[{ required: true, message: "Enter the subject" }]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="gradeLevel"
          label="Grade level"
          rules={[{ required: true, message: "Enter the grade level" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="board" label="Board" rules={[{ required: true, message: "Enter the board" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="city" label="City" rules={[{ required: true, message: "Enter the city" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="state" label="State" rules={[{ required: true, message: "Enter the state" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="isUrgent" label="Urgent, emergency fill" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Paragraph type="secondary" style={{ marginBottom: 8 }}>
          Salary range (optional — never shown to teachers, only used for match badges)
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
          Save changes
        </Button>
      </Form>
    </div>
  );
}
