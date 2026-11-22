
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import {
  IconBriefcase,
  IconChartBar,
  IconFolders,
  IconHome,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconSettings,
  IconBell,
} from "@tabler/icons-react";
import {
  NavLink as RouterNavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../features/auth/context/useAuth";

const desktopNavigation = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: <IconHome size={19} />,
  },
  {
    label: "Opportunities",
    path: "/opportunities",
    icon: <IconBriefcase size={19} />,
  },
  {
    label: "Reminders",
    path: "/reminders",
    icon: <IconBell size={19} />,
  },
  {
    label: "Categories",
    path: "/categories",
    icon: <IconFolders size={19} />,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: <IconChartBar size={19} />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <IconSettings size={19} />,
  },
];

const moreNavigation = [
  { label: "Reminders", path: "/reminders", icon: <IconBell size={17} /> },
  { label: "Categories", path: "/categories", icon: <IconFolders size={17} /> },
  { label: "Analytics", path: "/analytics", icon: <IconChartBar size={17} /> },
  { label: "Settings", path: "/settings", icon: <IconSettings size={17} /> },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logout,

    onError: () => {
      notifications.show({
        title: "Logout could not be confirmed",
        message:
          "You have been signed out locally, but the server may not have revoked your session. Check your connection.",
        color: "red",
      });
    },

    onSettled: () => {
      navigate("/login", { replace: true });
    },
  });

  const renderDesktopNavigation = () =>
    desktopNavigation.map((item) => (
      <RouterNavLink
        key={item.path}
        to={item.path}
        end={item.path === "/dashboard"}
        style={({ isActive }) => ({
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          borderRadius: "8px",
          textDecoration: "none",
          color: isActive ? "var(--mantine-color-brand-4)" : "inherit",
          backgroundColor: isActive
            ? "var(--mantine-color-dark-5)"
            : "transparent",
        })}
      >
        {item.icon}
        <Text size="sm" fw={500}>
          {item.label}
        </Text>
      </RouterNavLink>
    ));

  const renderMobileLink = (
    label: string,
    path: string,
    icon: React.ReactNode,
    query?: string,
  ) => (
    <RouterNavLink
      to={query ? `${path}?${query}` : path}
      style={({ isActive }) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        minWidth: 54,
        textDecoration: "none",
        color: isActive
          ? "var(--mantine-color-brand-4)"
          : "var(--mantine-color-dimmed)",
        fontSize: "10px",
      })}
    >
      {icon}
      <span>{label}</span>
    </RouterNavLink>
  );

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      footer={{ height: 76 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="brand" variant="light" size="lg">
              <IconBriefcase size={20} />
            </ThemeIcon>

            <Text fw={800} size="lg">
              J&G P
              <Text component="span" c="brand">
                ursuits
              </Text>
            </Text>
          </Group>

          <Group gap="sm">
            <Avatar color="brand" radius="xl" size="sm">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </Avatar>

            <Box visibleFrom="sm">
              <Text size="sm" fw={600}>
                {user?.name ?? "User"}
              </Text>
              <Text size="xs" c="dimmed">
                {user?.email}
              </Text>
            </Box>

            <Button
              variant="subtle"
              color="red"
              size="compact-sm"
              leftSection={<IconLogout size={16} />}
              loading={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              <Box visibleFrom="sm">Logout</Box>
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" visibleFrom="sm">
        <Stack gap="xs">
          {renderDesktopNavigation()}
        </Stack>

        <Box mt="auto">
          <Divider mb="md" />
          <Text fw={800} size="lg">
            J&G P
            <Text component="span" c="brand">
              ursuits
            </Text>
          </Text>
          <Text size="xs" c="dimmed">
            Opportunity tracking
          </Text>
        </Box>
      </AppShell.Navbar>

      <AppShell.Footer hiddenFrom="sm" px="xs" py="sm">
        <Group justify="space-around" align="center" h="100%" gap={0}>
          {renderMobileLink(
            "Home",
            "/dashboard",
            <IconHome size={21} />,
          )}

          {renderMobileLink(
            "Jobs",
            "/opportunities",
            <IconBriefcase size={21} />,
            "type=job",
          )}

          <ActionIcon
            size={48}
            radius="xl"
            color="brand"
            variant="filled"
            aria-label="Create opportunity"
            onClick={() => navigate("/opportunities")}
          >
            <IconPlus size={25} />
          </ActionIcon>

          {renderMobileLink(
            "Gigs",
            "/opportunities",
            <IconBriefcase size={21} />,
            "type=gig",
          )}

          <Menu position="top-end" shadow="md" withinPortal>
            <Menu.Target>
              <Button
                variant="subtle"
                color="gray"
                px={8}
                styles={{
                  root: { height: "auto" },
                  inner: { flexDirection: "column", gap: 3 },
                  label: { fontSize: 10, fontWeight: 400 },
                }}
              >
                <IconMenu2 size={21} />
                More
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              {moreNavigation.map((item) => (
                <Menu.Item
                  key={item.path}
                  leftSection={item.icon}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Menu.Item>
              ))}

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconLogout size={17} />}
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Footer>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default AppLayout;
