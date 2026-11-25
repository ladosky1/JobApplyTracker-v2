
import { useState } from "react";
import {
  Alert,
  Button,
  Center,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconBriefcase,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useSearchParams } from "react-router-dom";

import { useCategories } from "../../categories/hooks/useCategories";
import { useOpportunities } from "../hooks/useOpportunities";
import OpportunityCard from "../components/OpportunityCard";
import CreateOpportunityModal from "../components/CreateOpportunityModal";

import type {
  OpportunitySort,
  OpportunityStatus,
  OpportunityType,
} from "../types/opportunityTypes";

type TabValue = "all" | OpportunityType;

const JOB_STATUSES: OpportunityStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
];

const GIG_STATUSES: OpportunityStatus[] = [
  "lead",
  "contacted",
  "negotiating",
  "in_progress",
  "completed",
  "declined",
  "cancelled",
];

const SORT_OPTIONS: { value: OpportunitySort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title_asc", label: "Title: A to Z" },
  { value: "title_desc", label: "Title: Z to A" },
];

const formatLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const PAGE_SIZE = 10;

const OpportunitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const requestedType = searchParams.get("type");

  const activeTab: TabValue =
    requestedType === "job" || requestedType === "gig"
      ? requestedType
      : "all";

  const searchValue = searchParams.get("search") ?? "";
  const [debouncedSearch] = useDebouncedValue(searchValue, 350);

  const requestedStatus = searchParams.get("status");

  const availableStatuses =
    activeTab === "job"
      ? JOB_STATUSES
      : activeTab === "gig"
        ? GIG_STATUSES
        : [...JOB_STATUSES, ...GIG_STATUSES];

  const activeStatus = availableStatuses.includes(
    requestedStatus as OpportunityStatus,
  )
    ? (requestedStatus as OpportunityStatus)
    : null;

  const requestedSort = searchParams.get("sort");

  const activeSort: OpportunitySort = SORT_OPTIONS.some(
    (option) => option.value === requestedSort,
  )
    ? (requestedSort as OpportunitySort)
    : "newest";

  const requestedPage = Number(searchParams.get("page"));

  const activePage =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const selectedCategoryId = searchParams.get("categoryId");

  const { data: categoriesData } = useCategories();

  const categories = categoriesData?.categories ?? [];

  const filteredCategories = categories.filter(
    (category) =>
      activeTab === "all" || category.type === activeTab,
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useOpportunities({
    ...(activeTab !== "all" ? { type: activeTab } : {}),
    ...(activeStatus ? { status: activeStatus } : {}),
    ...(selectedCategoryId
      ? { categoryId: selectedCategoryId }
      : {}),
    ...(debouncedSearch.trim()
      ? { search: debouncedSearch.trim() }
      : {}),
    page: activePage,
    limit: PAGE_SIZE,
    sort: activeSort,
  });

  const updateParams = (
    updates: Record<string, string | null>,
  ) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  const handleTabChange = (value: string | null) => {
    if (!value) return;

    updateParams({
      type: value === "all" ? null : value,
      status: null,
      categoryId: null,
      page: null,
    });
  };

  const handleSearchChange = (value: string) => {
    updateParams({
      search: value.trim() ? value : null,
      page: null,
    });
  };

  const handleStatusChange = (value: string | null) => {
    updateParams({
      status: value,
      page: null,
    });
  };

  const handleCategoryChange = (value: string | null) => {
    updateParams({
      categoryId: value,
      page: null,
    });
  };

  const handleSortChange = (value: string | null) => {
    updateParams({
      sort: value === "newest" || !value ? null : value,
      page: null,
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({
      page: page === 1 ? null : String(page),
    });
  };

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Title order={2}>Opportunities</Title>
            <Text size="sm" c="dimmed">
              Keep track of the jobs and gigs you're pursuing.
            </Text>
          </Stack>

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add opportunity
          </Button>
        </Group>

        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="all">All</Tabs.Tab>
            <Tabs.Tab value="job">Jobs</Tabs.Tab>
            <Tabs.Tab value="gig">Gigs</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Stack gap="sm">
          <TextInput
            placeholder="Search by title or organization..."
            leftSection={<IconSearch size={16} />}
            value={searchValue}
            onChange={(event) =>
              handleSearchChange(event.currentTarget.value)
            }
          />

          <Group grow align="flex-start">
            <Select
              placeholder="All statuses"
              clearable
              searchable
              value={activeStatus}
              onChange={handleStatusChange}
              data={availableStatuses.map((status) => ({
                value: status,
                label: formatLabel(status),
              }))}
            />

            <Select
              placeholder="All categories"
              clearable
              searchable
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              data={filteredCategories.map((category) => ({
                value: category._id,
                label: category.name,
              }))}
            />

            <Select
              value={activeSort}
              onChange={handleSortChange}
              data={SORT_OPTIONS}
              allowDeselect={false}
            />
          </Group>
        </Stack>

        {isLoading && (
          <Center py="xl">
            <Loader color="brand" />
          </Center>
        )}

        {isError && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            title="Unable to load opportunities"
            color="red"
          >
            <Stack gap="sm">
              <Text size="sm">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong while fetching your opportunities."}
              </Text>

              <Text
                size="sm"
                fw={600}
                c="red"
                style={{ cursor: "pointer" }}
                onClick={() => void refetch()}
              >
                Try again
              </Text>
            </Stack>
          </Alert>
        )}

        {!isLoading && !isError && data && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {data.pagination.total}{" "}
              {data.pagination.total === 1
                ? "opportunity"
                : "opportunities"}
            </Text>

            {data.opportunities.length === 0 ? (
              <Center py={60}>
                <Stack align="center" gap="sm">
                  <IconBriefcase size={36} stroke={1.5} />

                  <Title order={4}>No opportunities found</Title>

                  <Text size="sm" c="dimmed" ta="center">
                    Try adjusting your search or filters.
                  </Text>
                </Stack>
              </Center>
            ) : (
              <>
                <Stack gap="sm">
                  {data.opportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity._id}
                      opportunity={opportunity}
                    />
                  ))}
                </Stack>

                {data.pagination.totalPages > 1 && (
                  <Group justify="center" mt="md">
                    <Pagination
                      value={activePage}
                      onChange={handlePageChange}
                      total={data.pagination.totalPages}
                    />
                  </Group>
                )}
              </>
            )}
          </Stack>
        )}
      </Stack>

      <CreateOpportunityModal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};

export default OpportunitiesPage;
