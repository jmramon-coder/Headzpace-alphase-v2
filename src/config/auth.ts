import { Provider } from '@supabase/supabase-js';

export const OAUTH_PROVIDERS = {
  google: {
    provider: 'google' as Provider,
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  }
} as const;