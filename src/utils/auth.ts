import type { AuthError } from '@supabase/supabase-js';

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Invalid email or password',
  'Email not confirmed': 'Please verify your email address',
  'User already registered': 'An account with this email already exists',
  'Password is too short': 'Password must be at least 6 characters',
  'Rate limit exceeded': 'Too many attempts. Please try again later',
  'Email link is invalid or has expired': 'The login link has expired. Please try again.',
  'Provider not supported': 'This login method is not supported',
  'OAuth provider is not enabled': 'Google login is not enabled. Please try another method.',
  'Connection refused': 'Unable to connect to authentication service. Please try again.'
};

export const getAuthErrorMessage = (error: AuthError): string => {
  return AUTH_ERROR_MESSAGES[error.message] || error.message;
};

export const getRedirectURL = (): string => {
  const origin = window.location.origin;
  return `${origin}/auth/callback`;
};