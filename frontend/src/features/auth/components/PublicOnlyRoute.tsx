import { Center, Loader } from '@mantine/core';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/useAuth';

export const PublicOnlyRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center mih="100vh">
        <Loader color="brand" size="md" />
      </Center>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
