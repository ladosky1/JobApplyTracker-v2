import { useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconBriefcase2,
  IconMailCheck,
} from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { authService } from '../services/authService';
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from '../schemas/authSchema';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message
      ?? 'Email verification failed. Please try again.';
  }

  return 'Something went wrong. Please try again.';
};

interface VerifyEmailLocationState {
  email?: string;
}

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as VerifyEmailLocationState | null;
  const initialEmail = locationState?.email ?? '';

  const [showError, setShowError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: initialEmail,
      code: '',
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (values: VerifyEmailFormValues) =>
      authService.verifyEmail(values),

    onSuccess: () => {
      setShowError(null);

      navigate('/login', {
        replace: true,
        state: { email: getValues('email') },
      });
    },

    onError: (error: unknown) => {
      setShowError(getErrorMessage(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: (email: string) =>
      authService.resendVerification({ email }),

    onSuccess: (response) => {
      setResendError(null);
      setResendSuccess(
        response.message || 'A new verification code has been sent.',
      );
    },

    onError: (error: unknown) => {
      setResendSuccess(null);
      setResendError(getErrorMessage(error));
    },
  });

  const onSubmit = (values: VerifyEmailFormValues) => {
    setShowError(null);
    setSuccessMessage(null);
    verifyMutation.mutate(values);
  };

  const handleResend = () => {
    const email = getValues('email').trim();

    setResendError(null);
    setResendSuccess(null);

    resendMutation.mutate(email);
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
            One more step to get started.
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
            <Stack align="center" gap="sm">
              <IconMailCheck size={42} color="#B6FF2E" stroke={1.6} />

              <Title order={3} c="white">
                Verify your email
              </Title>

              <Text size="sm" c="dimmed" ta="center">
                Enter the six-digit code sent to your email address.
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

            {resendError && (
              <Alert color="red" variant="light" radius="md">
                {resendError}
              </Alert>
            )}

            {resendSuccess && (
              <Alert color="green" variant="light" radius="md">
                {resendSuccess}
              </Alert>
            )}

            {successMessage && (
              <Alert color="green" variant="light" radius="md">
                {successMessage}
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
                  radius="md"/>

                <TextInput
                  label="Verification code"
                  placeholder="Enter 6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  {...register('code')}
                  error={errors.code?.message}
                  size="md"
                  radius="md"
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="md"
                  color="brand"
                  loading={verifyMutation.isPending}
                >
                  Verify email
                </Button>
              </Stack>
            </form>

            <Stack gap="xs" align="center">
              <Text size="sm" c="dimmed">
                Didn't receive the code?
              </Text>

              <Button
                variant="subtle"
                color="brand"
                size="sm"
                loading={resendMutation.isPending}
                disabled={verifyMutation.isPending}
                onClick={handleResend}>
                Resend verification code
              </Button>
            </Stack>

            <Text size="sm" ta="center" c="dimmed">
              Already verified?{' '}
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

export default VerifyEmailPage;
