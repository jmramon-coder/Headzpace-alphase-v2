import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as authService from '../services/auth.service';
import * as profileService from '../services/profile.service';
import { getAuthErrorMessage } from '../utils/auth';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        initializeUser(session.user.id, session.user.email!);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        initializeUser(session.user.id, session.user.email!);
      } else {
        setState({ user: null, isLoading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeUser = async (id: string, email: string) => {
    try {
      let profile = await profileService.getProfile(id);
      
      setState({
        user: {
          id: profile.id,
          email: profile.email,
          widgets: []
        },
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize user'
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.signIn(email, password);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign in failed',
        isLoading: false
      }));
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.signUp(email, password);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign up failed',
        isLoading: false
      }));
      return false;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.signInWithGoogle();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Google sign in failed',
        isLoading: false
      }));
      return false;
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signInWithGoogle
  };
};