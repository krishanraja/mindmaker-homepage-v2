/**
 * Email Notification Utility
 * Shared function to send lead emails via Supabase Edge Function
 */

import { supabase } from '@/integrations/supabase/client';

export interface LeadEmailParams {
  name: string;
  email: string;
  source: string;
  additionalData?: {
    jobTitle?: string;
    sessionData?: Record<string, any>;
    commitmentLevel?: string;
    audienceType?: "individual" | "team";
    pathType?: "build" | "orchestrate";
  };
}

export interface LeadEmailResult {
  success: boolean;
  error?: string;
  leadId?: string;
}

/**
 * Sends a lead email notification to krish@themindmaker.ai
 * Returns result status so caller can make informed decisions
 */
export const sendLeadEmail = async (params: LeadEmailParams): Promise<LeadEmailResult> => {
  console.log('📧 sendLeadEmail called:', {
    name: params.name,
    email: params.email,
    source: params.source,
    hasAdditionalData: !!params.additionalData
  });

  try {
    const requestPayload = {
      name: params.name,
      email: params.email,
      jobTitle: params.additionalData?.jobTitle || 'Not specified',
      selectedProgram: params.source,
      commitmentLevel: params.additionalData?.commitmentLevel,
      audienceType: params.additionalData?.audienceType,
      pathType: params.additionalData?.pathType,
      sessionData: params.additionalData?.sessionData || {},
    };
    
    console.log('📧 Invoking send-lead-email with payload:', requestPayload);
    
    const { data, error } = await supabase.functions.invoke('send-lead-email', {
      body: requestPayload,
    });
    
    console.log('📧 send-lead-email response:', { data, error });

    if (error) {
      console.error('Email notification error:', error);
      return { success: false, error: error.message };
    }

    if (data && data.error) {
      console.error('Email function returned error:', data.error);
      return { success: false, error: data.error };
    }

    return { 
      success: true, 
      leadId: data?.leadId 
    };
  } catch (err) {
    console.error('Failed to send lead email:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};

