/**
 * Supabase Health Check Utility
 * Verifies Supabase client is properly configured and accessible
 */

import { supabase } from '@/integrations/supabase/client';

export interface SupabaseHealthCheck {
  isHealthy: boolean;
  urlConfigured: boolean;
  keyConfigured: boolean;
  clientInitialized: boolean;
  errors: string[];
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthCheck> {
  const result: SupabaseHealthCheck = {
    isHealthy: false,
    urlConfigured: false,
    keyConfigured: false,
    clientInitialized: false,
    errors: []
  };
  
  try {
    // Check if client exists
    if (!supabase) {
      result.errors.push('Supabase client is null/undefined');
      return result;
    }
    result.clientInitialized = true;
    
    // Check URL
    const url = (supabase as any).supabaseUrl;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      result.errors.push('Supabase URL is invalid or missing');
    } else {
      result.urlConfigured = true;
    }
    
    // Check key (we can't directly access it, but we can test with a simple query)
    try {
      // Try a simple operation to verify key works
      const { error } = await supabase.from('_test_health_check').select('id').limit(0);
      // We expect this to fail with "relation does not exist" which means auth worked
      if (error && error.code === 'PGRST116') {
        result.keyConfigured = true; // Auth worked, table just doesn't exist
      } else if (!error) {
        result.keyConfigured = true; // Query succeeded
      } else {
        result.errors.push(`Supabase key validation failed: ${error.message}`);
      }
    } catch (err) {
      result.errors.push(`Health check query failed: ${err}`);
    }
    
    result.isHealthy = result.urlConfigured && result.keyConfigured && result.clientInitialized;
  } catch (err) {
    result.errors.push(`Health check exception: ${err}`);
  }
  
  return result;
}
