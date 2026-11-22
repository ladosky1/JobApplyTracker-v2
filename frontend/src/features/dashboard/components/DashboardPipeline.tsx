import { Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { IconBriefcase, IconRocket } from "@tabler/icons-react";

import { formatMetricValue } from "../utils/dashboardFormatters";
import type { DashboardOverview } from "../types/dashboardTypes";

interface DashboardPipelineProps {
  overview: DashboardOverview;
}

const DashboardPipeline = ({ overview }: DashboardPipelineProps) => {
  const activeTotal = overview.activeJobs + overview.activeGigs;

  const jobsPercentage =
    activeTotal > 0 ? (overview.activeJobs / activeTotal) * 100 : 0;

  const gigsPercentage =
    activeTotal > 0 ? (overview.activeGigs / activeTotal) * 100 : 0;

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
        <Group gap="sm">
          <IconRocket size={21} />
          <Title order={4}>Pipeline</Title>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap="xs">
              <IconBriefcase size={17} />
              <Text size="sm" fw={500}>Active Jobs</Text>
            </Group>

            <Text size="sm" fw={700}>
              {formatMetricValue(overview.activeJobs)}
            </Text>
          </Group>

          <Progress
            value={jobsPercentage}
            color="teal"
            size="md"
            radius="xl"
          />
        </Stack>

        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap="xs">
              <IconRocket size={17} />
              <Text size="sm" fw={500}>Active Gigs</Text>
            </Group>

            <Text size="sm" fw={700}>
              {formatMetricValue(overview.activeGigs)}
            </Text>
          </Group>

          <Progress
            value={gigsPercentage}
            color="orange"
            size="md"
            radius="xl"
          />
        </Stack>

        <Text size="xs" c="dimmed">
          {formatMetricValue(activeTotal)} active opportunities in total
        </Text>
      </Stack>
    </Card>
  );
};

export default DashboardPipeline;
