import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { useDeleteOpportunity } from "../hooks/useOpportunitiesMutation";
import EditOpportunityModal from "./EditOpportunityModal";
import { formatDate, formatStatus } from "../utils/opportunityFormatters";

import type { Opportunity } from "../types/opportunityTypes";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const deleteOpportunity = useDeleteOpportunity();

  const handleDelete = () => {
    deleteOpportunity.mutate(opportunity._id, {
      onSuccess: () => setIsDeleteModalOpen(false),
    });
  };

  return (
    <>
      <Card withBorder radius="md" padding="lg">
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{ flex: 1 }}>
              <Text fw={600}>{opportunity.title}</Text>

              <Text size="sm" c="dimmed">
                {opportunity.organizationName ||
                  "No organization specified"}
              </Text>
            </Stack>

            <Group gap={4} wrap="nowrap">
              <Badge variant="light">
                {formatStatus(opportunity.status)}
              </Badge>

              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={`Edit ${opportunity.title}`}
                onClick={() => setIsEditModalOpen(true)}
              >
                <IconPencil size={17} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Delete ${opportunity.title}`}
                onClick={() => {
                  deleteOpportunity.reset();
                  setIsDeleteModalOpen(true);
                }}
              >
                <IconTrash size={17} />
              </ActionIcon>
            </Group>
          </Group>

          <Group gap="xs">
            <Badge color={opportunity.type === "job" ? "blue" : "grape"}>
              {opportunity.type === "job" ? "Job" : "Gig"}
            </Badge>

            <Badge variant="outline" color="gray">
              {opportunity.category?.name || "Uncategorized"}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Added {formatDate(opportunity.createdAt)}
            </Text>

            {opportunity.followUpAt && (
              <Text size="xs" c="dimmed">
                Follow-up: {formatDate(opportunity.followUpAt)}
              </Text>
            )}
          </Group>

          {deleteOpportunity.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              title="Unable to delete opportunity"
            >
              {deleteOpportunity.error instanceof Error
                ? deleteOpportunity.error.message
                : "Something went wrong. Please try again."}
            </Alert>
          )}
        </Stack>
      </Card>

      <EditOpportunityModal
        opportunity={opportunity}
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <Modal
        opened={isDeleteModalOpen}
        onClose={() => {
          if (!deleteOpportunity.isPending) {
            setIsDeleteModalOpen(false);
          }
        }}
        title="Delete opportunity"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete{" "}
            <Text component="span" fw={600}>
              {opportunity.title}
            </Text>
            ? This action cannot be undone.
          </Text>

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteOpportunity.isPending}
            >
              Cancel
            </Button>

            <Button
              color="red"
              onClick={handleDelete}
              loading={deleteOpportunity.isPending}
            >
              Delete opportunity
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default OpportunityCard;
