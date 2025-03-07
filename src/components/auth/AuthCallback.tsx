import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getAuthErrorMessage } from '../../utils/auth';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session from URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (!session) {
          throw new Error('No session found');
        }

        // Create profile if needed
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .single();

        if (!profile && !profileError) {
          await supabase
            .from('profiles')
            .insert([{ 
              id: session.user.id,
              email: session.user.email
            }]);
        }

        // Redirect back to app
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        const message = error instanceof Error ? getAuthErrorMessage(error) : 'Authentication failed';
        
        navigate('/', { 
          replace: true,
          state: { error: message }
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 dark:border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          Completing authentication...
        </p>
      </div>
    </div>
  );
};