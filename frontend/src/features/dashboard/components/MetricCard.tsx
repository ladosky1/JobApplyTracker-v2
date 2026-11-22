import type { ReactNode } from "react";
import {
  Card,
  Group,
  Text,
  ThemeIcon,
} from "@mantine/core";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  color?: string;
}

const MetricCard = ({
  title,
  value,
  icon,
  description,
  color = "brand",
}: MetricCardProps) => {
  return (
    <Card
      withBorder
      radius="lg"
      padding="lg"
      style={{
        backgroundColor: "var(--mantine-color-dark-7)",
        borderColor: "var(--app-border)",
      }}>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>

          <Text
            size="xl"
            fw={700}
            mt="xs"
            c="white"
          >
            {value}
          </Text>

          {description && (
            <Text size="xs" c="dimmed" mt={6}>
              {description}
            </Text>
          )}
        </div>

        <ThemeIcon
          size={44}
          radius="md"
          variant="light"
          color={color}
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
};

export default MetricCard;
