import { Center, Loader, Stack, Text, Title } from "@mantine/core";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./features/auth/context/useAuth";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "./features/auth/components/PublicOnlyRoute";

import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";

import DashboardPage from "./features/dashboard/pages/DashboardPage";
import AppLayout from "./app/layouts/AppLayout";

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <Center mih="50vh">
      <Stack align="center" gap="xs">
        <Title order={3}>{title}</Title>
        <Text c="dimmed" size="sm">
          This section is not implemented yet.
        </Text>
      </Stack>
    </Center>
  );
};

const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center mih="100vh">
        <Loader color="brand" size="md" />
      </Center>
    );
  }

  return (
    <Navigate
      to={isAuthenticated ? "/dashboard" : "/login"}
      replace
    />
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public authentication routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected application routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/opportunities"
            element={<PlaceholderPage title="Opportunities" />}
          />

          <Route
            path="/reminders"
            element={<PlaceholderPage title="Reminders" />}
          />

          <Route
            path="/categories"
            element={<PlaceholderPage title="Categories" />}
          />

          <Route
            path="/analytics"
            element={<PlaceholderPage title="Analytics" />}
          />

          <Route
            path="/settings"
            element={<PlaceholderPage title="Settings" />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
