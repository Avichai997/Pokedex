import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@/constants/routes';
import { useLoginMutation, useRegisterMutation } from '@/hooks';

interface IFormValues {
  email: string;
  password: string;
}

interface IApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface IAuthFormProps {
  isLogin: boolean;
}

export const AuthForm = ({ isLogin }: IAuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const mutation = isLogin ? loginMutation : registerMutation;

  const formik = useFormik<IFormValues>({
    enableReinitialize: true,
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof IFormValues, string>> = {};
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      }
      return errors;
    },
    onSubmit: (values) => {
      if (isLogin) {
        loginMutation.mutate(values, {
          onError: (err: IApiError) => {
            formik.setFieldError('email', err.response?.data?.message || 'Login failed');
          },
        });
      } else {
        registerMutation.mutate(values, {
          onError: (err: IApiError) => {
            formik.setFieldError('email', err.response?.data?.message || 'Registration failed');
          },
        });
      }
    },
  });

  useEffect(() => {
    formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  const error: IApiError | null = mutation.error;
  const defaultErrorMessage = isLogin ? 'Login failed' : 'Registration failed';
  const apiError = useMemo(
    () => (error ? error.response?.data?.message || defaultErrorMessage : null),
    [error, defaultErrorMessage],
  );

  const title = isLogin ? 'Login' : 'Register';
  const submitLabel = isLogin ? 'Login' : 'Register';
  const alternateRoute = isLogin ? APP_ROUTES.REGISTER : APP_ROUTES.LOGIN;
  const alternateLabel = isLogin ? 'Need an account? Register' : 'Already have an account? Login';

  return (
    <Box className='flex min-h-screen items-center justify-center bg-gray-50'>
      <Container maxWidth='sm'>
        <Card className='shadow-lg'>
          <CardContent className='p-8'>
            <Typography variant='h4' component='h1' className='mb-6 text-center font-bold'>
              {title}
            </Typography>

            <form onSubmit={formik.handleSubmit} className='space-y-4'>
              <TextField
                fullWidth
                label='Email'
                type='email'
                name='email'
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                variant='outlined'
                className='mb-4'
              />

              <TextField
                fullWidth
                label='Password'
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                variant='outlined'
                className='mb-4'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='toggle password visibility'
                        onClick={() => setShowPassword(!showPassword)}
                        edge='end'
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {apiError && (
                <Alert severity='error' className='mb-4'>
                  {apiError}
                </Alert>
              )}

              <Button
                type='submit'
                fullWidth
                variant='contained'
                disabled={mutation.isPending || !formik.isValid}
                className='mb-4 bg-indigo-600 hover:bg-indigo-700'
                sx={{ py: 1.5 }}
              >
                {submitLabel}
              </Button>

              <Box className='text-center'>
                <Button
                  component={Link}
                  to={alternateRoute}
                  className='text-indigo-600 hover:text-indigo-500'
                >
                  {alternateLabel}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
