import { SimpleGrid } from "@mantine/core";
import {
  IconChartLine,
  IconCircleCheck,
} from "@tabler/icons-react";

import MetricCard from "./MetricCard";
import {
  formatMetricValue,
  formatPercentage,
} from "../utils/dashboardFormatters";
import type { DashboardPerformance as DashboardPerformanceType } from "../types/dashboardTypes";

interface DashboardPerformanceProps {
  performance: DashboardPerformanceType;
}

const DashboardPerformance = ({
  performance,
}: DashboardPerformanceProps) => {
  const { applicationSuccess, gigCompletion } = performance;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      <MetricCard
        title="Application Success Rate"
        value={formatPercentage(applicationSuccess.rate)}
        description={`${formatMetricValue(applicationSuccess.accepted)} accepted out of ${formatMetricValue(applicationSuccess.decided)} decided applications`}
        icon={<IconChartLine size={22} />}
        color="teal"
      />

      <MetricCard
        title="Gig Completion Rate"
        value={formatPercentage(gigCompletion.rate)}
        description={`${formatMetricValue(gigCompletion.completed)} completed out of ${formatMetricValue(gigCompletion.finalized)} finalized gigs`}
        icon={<IconCircleCheck size={22} />}
        color="green"
      />
    </SimpleGrid>
  );
};

export default DashboardPerformance;
