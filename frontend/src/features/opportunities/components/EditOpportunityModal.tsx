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
import { useUpdateOpportunity } from "../hooks/useOpportunitiesMutation";

import type {
  GigStatus,
  JobStatus,
  Opportunity,
} from "../types/opportunityTypes";

interface EditOpportunityModalProps {
  opportunity: Opportunity;
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

const toDateTimeLocal = (date: string | null): string => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const localDate = new Date(
    parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
};

const EditOpportunityModal = ({
  opportunity,
  opened,
  onClose,
}: EditOpportunityModalProps) => {
  const [title, setTitle] = useState(opportunity.title);
  const [organizationName, setOrganizationName] = useState(
    opportunity.organizationName ?? "",
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    opportunity.category?._id ?? null,
  );
  const [status, setStatus] = useState(opportunity.status);
  const [link, setLink] = useState(opportunity.link ?? "");
  const [notes, setNotes] = useState(opportunity.notes ?? "");
  const [followUpAt, setFollowUpAt] = useState(
    toDateTimeLocal(opportunity.followUpAt),
  );

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();

  const updateOpportunity = useUpdateOpportunity();

  const categories = (categoriesData?.categories ?? []).filter(
    (category) => category.type === opportunity.type,
  );

  const statusOptions =
    opportunity.type === "job" ? JOB_STATUSES : GIG_STATUSES;

  useEffect(() => {
    if (!opened) return;

    setTitle(opportunity.title);
    setOrganizationName(opportunity.organizationName ?? "");
    setCategoryId(opportunity.category?._id ?? null);
    setStatus(opportunity.status);
    setLink(opportunity.link ?? "");
    setNotes(opportunity.notes ?? "");
    setFollowUpAt(toDateTimeLocal(opportunity.followUpAt));
    updateOpportunity.reset();
  }, [opened, opportunity, updateOpportunity.reset]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    updateOpportunity.mutate(
      {
        id: opportunity._id,
        payload: {
          title: trimmedTitle,
          organizationName: organizationName.trim() || null,
          categoryId,
          status,
          link: link.trim() || null,
          notes: notes.trim() || null,
          followUpAt: followUpAt
            ? new Date(followUpAt).toISOString()
            : null,
        },
      },
      {
        onSuccess: onClose,
      },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit opportunity"
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {updateOpportunity.isError && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Unable to update opportunity"
              color="red"
            >
              {updateOpportunity.error instanceof Error
                ? updateOpportunity.error.message
                : "Something went wrong. Please try again."}
            </Alert>
          )}

          <TextInput
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            required
            maxLength={150}
          />

          <TextInput
            label={
              opportunity.type === "job" ? "Company" : "Client"
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
              disabled={isCategoriesLoading}
            />

            <Select
              label="Status"
              data={statusOptions}
              value={status}
              onChange={(value) => {
                if (value) {
                  setStatus(value as JobStatus | GigStatus);
                }
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
              disabled={updateOpportunity.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={updateOpportunity.isPending}
            >
              Save changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EditOpportunityModal;
