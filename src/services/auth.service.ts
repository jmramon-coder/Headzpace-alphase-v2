import { supabase } from '../lib/supabase';
import { OAUTH_PROVIDERS } from '../config/auth';
import { getAuthErrorMessage } from '../utils/auth';

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return { data };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return { data };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return { data };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};