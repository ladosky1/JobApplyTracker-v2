import { SimpleGrid } from "@mantine/core";
import {
  IconBriefcase,
  IconFolders,
  IconRocket,
  IconTarget,
  IconTrophy,
} from "@tabler/icons-react";

import MetricCard from "./MetricCard";
import { formatMetricValue } from "../utils/dashboardFormatters";
import type { DashboardOverview as DashboardOverviewType } from "../types/dashboardTypes";

interface DashboardOverviewProps {
  overview: DashboardOverviewType;
}

const DashboardOverview = ({ overview }: DashboardOverviewProps) => {
  const metrics = [
    {
      title: "Total Opportunities",
      value: overview.total,
      description: "All tracked opportunities",
      icon: <IconFolders size={22} />,
      color: "brand",
    },
    {
      title: "Jobs",
      value: overview.jobs,
      description: "Job opportunities tracked",
      icon: <IconBriefcase size={22} />,
      color: "teal",
    },
    {
      title: "Gigs",
      value: overview.gigs,
      description: "Freelance opportunities tracked",
      icon: <IconRocket size={22} />,
      color: "orange",
    },
    {
      title: "Active Jobs",
      value: overview.activeJobs,
      description: "Jobs still in progress",
      icon: <IconTarget size={22} />,
      color: "blue",
    },
    {
      title: "Active Gigs",
      value: overview.activeGigs,
      description: "Gigs still in progress",
      icon: <IconBriefcase size={22} />,
      color: "violet",
    },
    {
      title: "Successful Outcomes",
      value: overview.successfulOutcomes,
      description: "Accepted jobs and completed gigs",
      icon: <IconTrophy size={22} />,
      color: "green",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }} spacing="md">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={formatMetricValue(metric.value)}
          description={metric.description}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </SimpleGrid>
  );
};

export default DashboardOverview;
