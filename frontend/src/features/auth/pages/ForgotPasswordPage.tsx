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
import { IconAlertCircle, IconBriefcase2, IconMail } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import { authService } from '../services/authService';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/authSchema';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message
      ?? 'Unable to process your request. Please try again.';
  }

  return 'Something went wrong. Please try again.';
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [showError, setShowError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (values: ForgotPasswordFormValues) =>
      authService.forgotPassword(values),

    onSuccess: (_, values) => {
      navigate('/reset-password', {
        state: { email: values.email },
      });
    },

    onError: (error: unknown) => {
      setShowError(getErrorMessage(error));
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    setShowError(null);
    forgotPasswordMutation.mutate(values);
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
            Get back to managing your opportunities.
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
                Forgot your password?
              </Title>
              <Text size="sm" c="dimmed">
                Enter the email address associated with your account.
                If eligible, we'll send you a password reset code.
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
                  label="Email address"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  leftSection={<IconMail size={16} />}
                  {...register('email')}
                  error={errors.email?.message}
                  size="md"
                  radius="md"
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="md"
                  color="brand"
                  loading={forgotPasswordMutation.isPending}
                >
                  Send reset code
                </Button>
              </Stack>
            </form>

            <Text size="sm" ta="center" c="dimmed">
              Remember your password?{' '}
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

export default ForgotPasswordPage;
