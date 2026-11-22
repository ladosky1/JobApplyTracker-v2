import { useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconBriefcase2 } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas/authSchema';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Unable to sign in. Please try again.';
  }

  return 'Something went wrong. Please try again.';
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showError, setShowError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      const state = location.state as {
        from?: { pathname?: string };
      } | null;

      const destination = state?.from?.pathname;

      navigate(
        destination && destination !== '/login'
          ? destination
          : '/dashboard',
        { replace: true },
      );
    },
    onError: (error: unknown) => {
      setShowError(getErrorMessage(error));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setShowError(null);
    loginMutation.mutate(values);
  };

  return (
    <Container size={420} px="md" py="xl">
      <Stack gap="xl" justify="center" mih="85vh">
        <Stack align="center" gap="sm">
          <Group gap={8}>
            <IconBriefcase2 size={30} color="#B6FF2E" stroke={2.2} />
            <Title order={2} fw={800} c="white">
              J&G<Text span c="brand">Pursuits</Text>
            </Title>
          </Group>

          <Text c="dimmed" size="sm" ta="center">
            Keep your opportunities moving forward.
          </Text>
        </Stack>

        <Paper
          radius="lg"
          p="xl"
          withBorder
          style={{
            backgroundColor: '#23262F',
            borderColor: '#414550',
          }}>
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={3} c="white">
                Welcome back
              </Title>
              <Text size="sm" c="dimmed">
                Sign in to continue managing your opportunities.
              </Text>
            </Stack>

            {showError && (
              <Alert
                icon={<IconAlertCircle size={18} />}
                color="red"
                variant="light"
                radius="md">
                {showError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                  size="md"
                  radius="md"/>

                <Stack gap={6}>
                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register('password')}
                    error={errors.password?.message}
                    size="md"
                    radius="md"
                  />

                  <Group justify="space-between">
                    <Anchor
                      component={Link}
                      to="/forgot-password"
                      size="xs"
                      c="brand">
                      Forgot password?
                    </Anchor>
                  </Group>
                </Stack>

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="md"
                  color="brand"
                  loading={loginMutation.isPending}
                  mt="sm">
                  Sign in
                </Button>
              </Stack>
            </form>

            <Text size="sm" ta="center" c="dimmed">
              Don't have an account?{' '}
              <Anchor component={Link} to="/register" c="brand" fw={600}>
                Create one
              </Anchor>
            </Text>
          </Stack>
        </Paper>

        <Text size="xs" c="dimmed" ta="center">
          Your next opportunity starts with staying organized.
        </Text>
      </Stack>
    </Container>
  );
};

export default LoginPage;
