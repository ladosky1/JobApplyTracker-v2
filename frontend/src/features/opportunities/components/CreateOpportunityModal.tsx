import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

import { useCategories } from "../../categories/hooks/useCategories";
import { useCreateOpportunity } from "../hooks/useOpportunitiesMutation";

import type {
  CreateOpportunityRequest,
  GigStatus,
  JobStatus,
  OpportunityType,
} from "../types/opportunityTypes";

interface CreateOpportunityModalProps {
  opened: boolean;
  onClose: () => void;
}

const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const GIG_STATUSES: { value: GigStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "negotiating", label: "Negotiating" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
];

const CreateOpportunityModal = ({
  opened,
  onClose,
}: CreateOpportunityModalProps) => {
  const [type, setType] = useState<OpportunityType>("job");
  const [title, setTitle] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("saved");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();

  const createOpportunity = useCreateOpportunity();

  const categories = (categoriesData?.categories ?? []).filter(
    (category) => category.type === type,
  );

  const statusOptions = type === "job" ? JOB_STATUSES : GIG_STATUSES;

  const resetForm = () => {
    setType("job");
    setTitle("");
    setOrganizationName("");
    setCategoryId(null);
    setStatus("saved");
    setLink("");
    setNotes("");
    setFollowUpAt("");
  };

  const resetMutation = createOpportunity.reset;

  useEffect(() => {
    if (opened) {
      resetForm();
      resetMutation();
    }
  }, [opened, resetMutation]);

  const handleTypeChange = (value: string | null) => {
    if (value !== "job" && value !== "gig") return;

    setType(value);
    setCategoryId(null);
    setStatus(value === "job" ? "saved" : "lead");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    const payload: CreateOpportunityRequest = {
      type,
      title: trimmedTitle,
      categoryId: categoryId || null,
      status: status as JobStatus | GigStatus,
      ...(organizationName.trim()
        ? { organizationName: organizationName.trim() }
        : {}),
      ...(link.trim() ? { link: link.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      followUpAt: followUpAt
        ? new Date(followUpAt).toISOString()
        : null,
    };

    createOpportunity.mutate(payload, {
      onSuccess: onClose,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add opportunity"
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {createOpportunity.isError && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Unable to create opportunity"
              color="red"
            >
              {createOpportunity.error instanceof Error
                ? createOpportunity.error.message
                : "Something went wrong. Please try again."}
            </Alert>
          )}

          <Select
            label="Opportunity type"
            data={[
              { value: "job", label: "Job" },
              { value: "gig", label: "Gig" },
            ]}
            value={type}
            onChange={handleTypeChange}
            allowDeselect={false}
          />

          <TextInput
            label="Title"
            placeholder={
              type === "job"
                ? "e.g. Frontend Developer"
                : "e.g. Website redesign"
            }
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            required
            maxLength={150}
          />

          <TextInput
            label={type === "job" ? "Company" : "Client"}
            placeholder={
              type === "job"
                ? "Company name"
                : "Client or organization name"
            }
            value={organizationName}
            onChange={(event) =>
              setOrganizationName(event.currentTarget.value)
            }
          />

          <Group grow align="flex-start">
            <Select
              label="Category"
              placeholder="Select a category"
              data={categories.map((category) => ({
                value: category._id,
                label: category.name,
              }))}
              value={categoryId}
              onChange={setCategoryId}
              clearable
              searchable
              nothingFoundMessage="No categories available"
              disabled={isCategoriesLoading}
            />

            <Select
              label="Status"
              data={statusOptions}
              value={status}
              onChange={(value) => {
                if (value) setStatus(value);
              }}
              allowDeselect={false}
            />
          </Group>

          <TextInput
            label="Link"
            placeholder="https://..."
            value={link}
            onChange={(event) => setLink(event.currentTarget.value)}
            type="url"
          />

          <TextInput
            label="Follow-up date and time"
            type="datetime-local"
            value={followUpAt}
            onChange={(event) =>
              setFollowUpAt(event.currentTarget.value)
            }
          />

          <Textarea
            label="Notes"
            placeholder="Add useful details about this opportunity..."
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            minRows={3}
            autosize
          />

          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={onClose}
              disabled={createOpportunity.isPending}
            >
              Cancel
            </Button>

            <Button type="submit" loading={createOpportunity.isPending}>
              Add opportunity
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateOpportunityModal;
