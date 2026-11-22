
import {
  Alert,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

import { useAuth } from "../../auth/context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";

import DashboardOverview from "../components/DashboardOverview";
import DashboardPerformance from "../components/DashboardPerformance";
import DashboardPipeline from "../components/DashboardPipeline";
import DashboardReminders from "../components/DashboardReminders";
import {
  DashboardActivityChart,
  DashboardRecentOpportunities,
} from "../components/DashboardActivitySections";

const DashboardPage = () => {
  const { user } = useAuth();

  const {
    data: dashboard,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboard();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  if (isPending) {
    return (
      <Center mih={300}>
        <Stack align="center" gap="sm">
          <Loader color="brand" size="lg" />
          <Text size="sm" c="dimmed">
            Loading your dashboard...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (isError) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={18} />}
          title="Unable to load dashboard"
          color="red"
          variant="light"
        >
          <Stack gap="sm">
            <Text size="sm">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching your dashboard data."}
            </Text>

            <Button
              variant="light"
              color="red"
              leftSection={<IconRefresh size={16} />}
              loading={isFetching}
              onClick={() => refetch()}
              w="fit-content"
            >
              Try again
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <Container size="xl" py="lg">
      <Stack gap="xl">
        {/* Dashboard heading */}
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Text size="sm" c="dimmed">
              Your opportunity overview
            </Text>

            <Title order={2}>
              Welcome back, {firstName}.
            </Title>

            <Text size="sm" c="dimmed">
              Here's how your jobs and gigs are progressing.
            </Text>
          </Stack>

          <Button
            variant="light"
            color="brand"
            leftSection={<IconRefresh size={16} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </Group>

        {/* Overview metrics */}
        <Stack gap="md">
          <Title order={4}>Overview</Title>

          <DashboardOverview overview={dashboard.overview} />
        </Stack>

        {/* Reminder summary */}
        <Stack gap="md">
          <Title order={4}>Reminders</Title>

          <DashboardReminders reminders={dashboard.reminders} />
        </Stack>

        {/* Pipeline and performance */}
        <Stack gap="md">
          <Title order={4}>Pipeline & Performance</Title>

          <DashboardPipeline overview={dashboard.overview} />

          <DashboardPerformance
            performance={dashboard.performance}
          />
        </Stack>

        {/* Activity */}
        <Stack gap="md">
          <Title order={4}>Activity</Title>

          <DashboardActivityChart
            activity={dashboard.activityOverTime}
          />
        </Stack>

        {/* Recent opportunities */}
        <DashboardRecentOpportunities />
      </Stack>
    </Container>
  );
};

export default DashboardPage;
