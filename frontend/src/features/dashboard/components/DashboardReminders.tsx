import { SimpleGrid } from "@mantine/core";
import {
  IconBell,
  IconCalendarClock,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";

import MetricCard from "./MetricCard";
import { formatMetricValue } from "../utils/dashboardFormatters";
import type { DashboardReminders as DashboardRemindersType } from "../types/dashboardTypes";

interface DashboardRemindersProps {
  reminders: DashboardRemindersType;
}

const DashboardReminders = ({ reminders }: DashboardRemindersProps) => {
  const reminderMetrics = [
    {
      title: "Upcoming",
      value: reminders.upcoming,
      description: "Scheduled for later",
      icon: <IconCalendarClock size={22} />,
      color: "blue",
    },
    {
      title: "Due",
      value: reminders.due,
      description: "Ready for attention",
      icon: <IconClock size={22} />,
      color: "orange",
    },
    {
      title: "Overdue",
      value: reminders.overdue,
      description: "Past their scheduled time",
      icon: <IconAlertTriangle size={22} />,
      color: "red",
    },
    {
      title: "Sent",
      value: reminders.sent,
      description: "Reminders already sent",
      icon: <IconBell size={22} />,
      color: "green",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
      {reminderMetrics.map((metric) => (
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

export default DashboardReminders;
