export const formatMetricValue = (value: number): string => {
  return new Intl.NumberFormat("en-NG").format(value);
};

export const formatPercentage = (value: number | null): string => {
  if (value === null) {
    return "—";
  }

  return `${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
};

export const formatMonthLabel = (month: string): string => {
  const isValidMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(month);

  if (!isValidMonth) {
    return month;
  }

  const date = new Date(`${month}-01T00:00:00.000Z`);

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const formatStatusLabel = (status: string): string => {
  return status
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
