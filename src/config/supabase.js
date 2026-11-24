
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://vlokklanmqcrclfumvmi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tvG37hbOQc7pdujxVyDc3g_YKgcAphl';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
