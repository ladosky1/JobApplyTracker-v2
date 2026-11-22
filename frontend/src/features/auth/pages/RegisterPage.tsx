import { useState } from 'react';
import axios from 'axios';
import {
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
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconBriefcase2 } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import { authService } from '../services/authService';
import {
  registerSchema,
  type RegisterFormValues,
} from '../schemas/authSchema';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message
      ?? 'Unable to create your account. Please try again.';
  }

  return 'Something went wrong. Please try again.';
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showError, setShowError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
        authService.register({
            name: values.name,
            email: values.email,
            password: values.password,
    }),

    onSuccess: (_, values) => {
      navigate('/verify-email', {
        state: { email: values.email },
      });
    },

    onError: (error: unknown) => {
      setShowError(getErrorMessage(error));
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setShowError(null);
    registerMutation.mutate(values);
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
            Start organizing your next opportunity.
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
                Create your account
              </Title>
              <Text size="sm" c="dimmed">
                Set up your account to start tracking jobs and gigs.
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
                  label="Full name"
                  placeholder="Your name"
                  autoComplete="name"
                  {...register('name')}
                  error={errors.name?.message}
                  size="md"
                  radius="md"/>

                <TextInput
                  label="Email address"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                  size="md"
                  radius="md"/>

                <PasswordInput
                  label="Password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  {...register('password')}
                  error={errors.password?.message}
                  description="Use at least 8 characters."
                  size="md"
                  radius="md"
                />

                <PasswordInput
                  label="Confirm password"
                  placeholder="Enter your password again"
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
                  loading={registerMutation.isPending}
                  mt="sm"
                >
                  Create account
                </Button>
              </Stack>
            </form>

            <Text size="sm" ta="center" c="dimmed">
              Already have an account?{' '}
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

export default RegisterPage;
