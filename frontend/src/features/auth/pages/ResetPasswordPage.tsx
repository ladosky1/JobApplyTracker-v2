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
import {
  IconAlertCircle,
  IconBriefcase2,
  IconLock,
} from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { authService } from '../services/authService';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/authSchema';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message
      ?? 'Unable to reset your password. Please try again.';
  }

  return 'Something went wrong. Please try again.';
};

interface ResetPasswordLocationState {
  email?: string;
}

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as ResetPasswordLocationState | null;
  const initialEmail = locationState?.email ?? '';

  const [showError, setShowError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      authService.resetPassword({
        email: values.email,
        code: values.code,
        newPassword: values.newPassword,
      }),

    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successfully. Sign in with your new password.' },
      });
    },

    onError: (error: unknown) => {
      setShowError(getErrorMessage(error));
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    setShowError(null);
    resetPasswordMutation.mutate(values);
  };

  return (
    <Container size={460} px="md" py="xl">
      <Stack gap="xl" justify="center" mih="85vh">
        <Stack align="center" gap="sm">
          <Group gap={8}>
            <IconBriefcase2 size={30} color="#B6FF2E" stroke={2.2} />
            <Title order={2} fw={800} c="white">
              J&G<Text span c="brand">Pursuits</Text>
            </Title>
          </Group>

          <Text c="dimmed" size="sm" ta="center">
            Secure your account and get back on track.
          </Text>
        </Stack>

        <Paper
          radius="lg"
          p="xl"
          withBorder
          style={{
            backgroundColor: '#23262F',
            borderColor: '#414550',
          }}
        >
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={3} c="white">
                Reset your password
              </Title>
              <Text size="sm" c="dimmed">
                Enter the reset code sent to your email and choose a new password.
              </Text>
            </Stack>

            {showError && (
              <Alert
                icon={<IconAlertCircle size={18} />}
                color="red"
                variant="light"
                radius="md"
              >
                {showError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email address"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                  size="md"
                  radius="md"
                />

                <TextInput
                  label="Reset code"
                  placeholder="Enter 6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  {...register('code')}
                  error={errors.code?.message}
                  size="md"
                  radius="md"
                />

                <PasswordInput
                  label="New password"
                  placeholder="Create a new password"
                  autoComplete="new-password"
                  leftSection={<IconLock size={16} />}
                  {...register('newPassword')}
                  error={errors.newPassword?.message}
                  description="Use at least 8 characters."
                  size="md"
                  radius="md"
                />

                <PasswordInput
                  label="Confirm new password"
                  placeholder="Enter your new password again"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  size="md"
                  radius="md"
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="md"
                  color="brand"
                  loading={resetPasswordMutation.isPending}
                  mt="sm"
                >
                  Reset password
                </Button>
              </Stack>
            </form>

            <Text size="sm" ta="center" c="dimmed">
              Remembered your password?{' '}
              <Anchor component={Link} to="/login" c="brand" fw={600}>
                Sign in
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ResetPasswordPage;
