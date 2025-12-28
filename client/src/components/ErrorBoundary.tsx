import { ErrorOutline, Refresh, Home } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Component, ReactNode } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

import { APP_ROUTES } from '@/constants/routes';

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = APP_ROUTES.DASHBOARD;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallbackUI
          error={this.state.error}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

interface IErrorFallbackProps {
  error?: Error | null;
  onReset?: () => void;
  onGoHome?: () => void;
}

export const ErrorFallbackUI = ({ error, onReset, onGoHome }: IErrorFallbackProps) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = APP_ROUTES.DASHBOARD;
    }
    onReset?.();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const errorMessage = error?.message || 'An unexpected error occurred';
  const errorStack = error?.stack;

  return (
    <Box className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
      <Card className='w-full max-w-2xl shadow-lg'>
        <CardContent className='p-8'>
          <Box className='mb-6 flex flex-col items-center text-center'>
            <ErrorOutline className='mb-4 text-red-500' sx={{ fontSize: 64 }} />
            <Typography variant='h4' component='h1' className='mb-2 font-bold text-gray-900'>
              Oops! Something went wrong
            </Typography>
            <Typography variant='body1' className='mb-6 text-gray-600'>
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </Typography>
          </Box>

          <Box className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
            <Typography variant='subtitle2' className='mb-2 font-semibold text-red-800'>
              Error Details:
            </Typography>
            <Typography variant='body2' className='break-words font-mono text-sm text-red-700'>
              {errorMessage}
            </Typography>
          </Box>

          {errorStack && (
            <Box className='mb-6 rounded-lg border border-gray-300 bg-gray-100 p-4'>
              <Typography variant='subtitle2' className='mb-2 font-semibold text-gray-700'>
                Stack Trace:
              </Typography>
              <Box className='max-h-48 overflow-auto'>
                <Typography
                  variant='body2'
                  className='whitespace-pre-wrap break-words font-mono text-xs text-gray-600'
                >
                  {errorStack}
                </Typography>
              </Box>
            </Box>
          )}

          <Box className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button
              variant='contained'
              startIcon={<Home />}
              onClick={handleGoHome}
              className='bg-indigo-600 hover:bg-indigo-700'
              size='large'
            >
              Go to Dashboard
            </Button>
            <Button
              variant='outlined'
              startIcon={<Refresh />}
              onClick={handleReload}
              className='border-gray-300 text-gray-700 hover:bg-gray-50'
              size='large'
            >
              Reload Page
            </Button>
          </Box>

          <Box className='mt-6 text-center'>
            <Typography variant='caption' className='text-gray-500'>
              If this problem persists, please contact support or try again later.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export const RouteErrorElement = () => {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(APP_ROUTES.DASHBOARD);
  };

  return <ErrorFallbackUI error={error} onGoHome={handleGoHome} />;
};
