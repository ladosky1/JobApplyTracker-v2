import {
  Alert,
  Badge,
  Card,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useOpportunities } from "../../opportunities/hooks/useOpportunities";
import { formatMonthLabel, formatStatusLabel } from "../utils/dashboardFormatters";

import type {
  DashboardActivity,
} from "../types/dashboardTypes";

interface DashboardActivityChartProps {
  activity: DashboardActivity[];
}

export const DashboardActivityChart = ({
  activity,
}: DashboardActivityChartProps) => {
  const chartData = Array.from(
    activity.reduce((months, item) => {
      const existing = months.get(item.month) ?? {
        month: item.month,
        jobs: 0,
        gigs: 0,
      };

      if (item.type === "job") {
        existing.jobs = item.count;
      } else {
        existing.gigs = item.count;
      }

      months.set(item.month, existing);
      return months;
    }, new Map<string, { month: string; jobs: number; gigs: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      ...item,
      monthLabel: formatMonthLabel(item.month),
    }));

  return (
    <Card
      withBorder
      radius="lg"
      padding="lg"
      style={{
        backgroundColor: "var(--mantine-color-dark-7)",
        borderColor: "var(--app-border)",
      }}
    >
      <Stack gap="lg">
        <div>
          <Title order={4}>Activity over time</Title>
          <Text size="xs" c="dimmed" mt={4}>
            Jobs and gigs tracked over the recent months
          </Text>
        </div>

        {chartData.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Activity data will appear here as you track opportunities.
          </Text>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -16, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--app-border)"
                vertical={false}
              />

              <XAxis
                dataKey="monthLabel"
                tick={{ fill: "var(--mantine-color-dimmed)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--mantine-color-dimmed)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--mantine-color-dark-7)",
                  border: "1px solid var(--app-border)",
                  borderRadius: 8,
                }}
              />

              <Legend />

              <Bar
                dataKey="jobs"
                name="Jobs"
                fill="#38C9BD"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="gigs"
                name="Gigs"
                fill="#F5A742"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Stack>
    </Card>
  );
};

export const DashboardRecentOpportunities = () => {
  const {
    data,
    isPending,
    isError,
    error,
  } = useOpportunities({
    sort: "newest",
    page: 1,
    limit: 5,
  });

  if (isPending) {
    return (
      <Card withBorder radius="lg" padding="lg">
        <Stack align="center" py="xl">
          <Loader color="brand" />
          <Text size="sm" c="dimmed">
            Loading recent opportunities...
          </Text>
        </Stack>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert color="red" title="Unable to load recent opportunities">
        {error instanceof Error
          ? error.message
          : "Something went wrong."}
      </Alert>
    );
  }

  const opportunities = data?.opportunities ?? [];

  return (
    <Card
      withBorder
      radius="lg"
      padding="lg"
      style={{
        backgroundColor: "var(--mantine-color-dark-7)",
        borderColor: "var(--app-border)",
      }}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={4}>Recent opportunities</Title>
            <Text size="xs" c="dimmed" mt={4}>
              Your latest tracked jobs and gigs
            </Text>
          </div>

          <Badge variant="light" color="brand">
            {data?.pagination.total ?? 0} tracked
          </Badge>
        </Group>

        {opportunities.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            You haven't added any opportunities yet.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={550}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Follow-up</Table.Th>
                  <Table.Th>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {opportunities.map((opportunity) => (
                  <Table.Tr key={opportunity._id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" fw={600}>
                          {opportunity.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {opportunity.organizationName || "No organization"}
                        </Text>
                      </Stack>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        color={opportunity.type === "job" ? "teal" : "orange"}
                        variant="light"
                      >
                        {opportunity.type}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Badge variant="light" color="gray">
                        {formatStatusLabel(opportunity.status)}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {opportunity.followUpAt
                          ? new Date(opportunity.followUpAt).toLocaleDateString()
                          : "—"}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {new Date(opportunity.createdAt).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Stack>
    </Card>
  );
};
