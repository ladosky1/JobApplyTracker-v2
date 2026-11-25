import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconPencil,
  IconPlus,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";

import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useCategories";

import type { Category } from "../types/categoryTypes";
import type { OpportunityType } from "../../opportunities/types/opportunityTypes";

const CATEGORY_TYPES: {
  value: OpportunityType;
  label: string;
}[] = [
  { value: "job", label: "Jobs" },
  { value: "gig", label: "Gigs" },
];

const CategoriesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] =
    useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<Category | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] =
    useState<OpportunityType>("job");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategories();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = data?.categories ?? [];

  const jobs = categories.filter(
    (category) => category.type === "job",
  );

  const gigs = categories.filter(
    (category) => category.type === "gig",
  );

  const isSaving =
    createCategory.isPending || updateCategory.isPending;

  const openCreateModal = () => {
    setCategoryToEdit(null);
    setCategoryName("");
    setCategoryType("job");
    setIsFormOpen(true);
  };

  const openEditModal = (category: Category) => {
    setCategoryToEdit(category);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    if (isSaving) return;

    setIsFormOpen(false);
    setCategoryToEdit(null);
    setCategoryName("");
    setCategoryType("job");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) return;

    if (categoryToEdit) {
      updateCategory.mutate(
        {
          categoryId: categoryToEdit._id,
          payload: { name },
        },
        {
          onSuccess: closeFormModal,
        },
      );

      return;
    }

    createCategory.mutate(
      {
        name,
        type: categoryType,
      },
      {
        onSuccess: closeFormModal,
      },
    );
  };

  const handleDelete = () => {
    if (!categoryToDelete) return;

    deleteCategory.mutate(categoryToDelete._id, {
      onSuccess: () => setCategoryToDelete(null),
    });
  };

  const mutationError =
    createCategory.error ||
    updateCategory.error ||
    deleteCategory.error;

  const renderCategorySection = (
    title: string,
    type: OpportunityType,
    sectionCategories: Category[],
  ) => (
    <Stack gap="sm">
      <Group justify="space-between">
        <Group gap="xs">
          <Title order={4}>{title}</Title>
          <Badge variant="light" color="gray">
            {sectionCategories.length}
          </Badge>
        </Group>

        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={() => {
            setCategoryToEdit(null);
            setCategoryName("");
            setCategoryType(type);
            setIsFormOpen(true);
          }}
        >
          Add category
        </Button>
      </Group>

      {sectionCategories.length === 0 ? (
        <Card withBorder radius="md" padding="lg">
          <Text size="sm" c="dimmed" ta="center">
            No {title.toLowerCase()} categories yet.
          </Text>
        </Card>
      ) : (
        <Stack gap="xs">
          {sectionCategories.map((category) => (
            <Card
              key={category._id}
              withBorder
              radius="md"
              padding="sm"
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <IconTag
                    size={18}
                    stroke={1.6}
                    color="var(--mantine-color-dimmed)"
                  />

                  <Stack gap={2}>
                    <Text fw={500} size="sm">
                      {category.name}
                    </Text>

                    {category.isDefault && (
                      <Text size="xs" c="dimmed">
                        Default category
                      </Text>
                    )}
                  </Stack>
                </Group>

                <Group gap={4}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={`Edit ${category.name}`}
                    disabled={category.isDefault}
                    onClick={() => openEditModal(category)}
                  >
                    <IconPencil size={17} />
                  </ActionIcon>

                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Delete ${category.name}`}
                    disabled={category.isDefault}
                    onClick={() => setCategoryToDelete(category)}
                  >
                    <IconTrash size={17} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Stack gap={4}>
          <Title order={2}>Categories</Title>
          <Text size="sm" c="dimmed">
            Organize your jobs and gigs with custom categories.
          </Text>
        </Stack>

        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}
        >
          Add category
        </Button>
      </Group>

      {mutationError && (
        <Alert
          icon={<IconAlertCircle size={18} />}
          title="Category action failed"
          color="red"
          withCloseButton
          onClose={() => {
            createCategory.reset();
            updateCategory.reset();
            deleteCategory.reset();
          }}
        >
          {mutationError instanceof Error
            ? mutationError.message
            : "Something went wrong. Please try again."}
        </Alert>
      )}

      {isLoading && (
        <Center py="xl">
          <Loader color="brand" />
        </Center>
      )}

      {isError && (
        <Alert
          icon={<IconAlertCircle size={18} />}
          title="Unable to load categories"
          color="red"
        >
          <Stack gap="sm">
            <Text size="sm">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching categories."}
            </Text>

            <Button
              variant="light"
              color="red"
              size="xs"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </Stack>
        </Alert>
      )}

      {!isLoading && !isError && (
        <Stack gap="xl">
          {renderCategorySection("Job categories", "job", jobs)}
          {renderCategorySection("Gig categories", "gig", gigs)}
        </Stack>
      )}

      <Modal
        opened={isFormOpen}
        onClose={closeFormModal}
        title={categoryToEdit ? "Rename category" : "Create category"}
        centered
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Category name"
              placeholder="e.g. Frontend Development"
              value={categoryName}
              onChange={(event) =>
                setCategoryName(event.currentTarget.value)
              }
              required
              autoFocus
            />

            <Select
              label="Category type"
              data={CATEGORY_TYPES}
              value={categoryType}
              onChange={(value) => {
                if (value === "job" || value === "gig") {
                  setCategoryType(value);
                }
              }}
              disabled={Boolean(categoryToEdit)}
              allowDeselect={false}
            />

            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={closeFormModal}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button type="submit" loading={isSaving}>
                {categoryToEdit ? "Save changes" : "Create category"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={Boolean(categoryToDelete)}
        onClose={() => {
          if (!deleteCategory.isPending) {
            setCategoryToDelete(null);
          }
        }}
        title="Delete category"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete{" "}
            <Text component="span" fw={600}>
              {categoryToDelete?.name}
            </Text>
            ? Opportunities using this category will be reassigned to
            the default Others category.
          </Text>

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setCategoryToDelete(null)}
              disabled={deleteCategory.isPending}
            >
              Cancel
            </Button>

            <Button
              color="red"
              onClick={handleDelete}
              loading={deleteCategory.isPending}
            >
              Delete category
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default CategoriesPage;
