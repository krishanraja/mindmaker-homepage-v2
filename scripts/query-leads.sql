-- ============================================
-- Mindmaker Leads Query Script
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. View all recent leads (last 24 hours)
-- ============================================
SELECT 
  id,
  name,
  email,
  job_title,
  selected_program,
  commitment_level,
  audience_type,
  path_type,
  engagement_score,
  email_sent,
  email_sent_at,
  calendly_opened,
  created_at
FROM public.leads
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 2. View test leads from "Krish Raja" / "Krish@tesla.com"
-- ============================================
SELECT 
  id,
  name,
  email,
  job_title,
  selected_program,
  commitment_level,
  audience_type,
  path_type,
  engagement_score,
  email_sent,
  email_sent_at,
  created_at,
  session_data->>'pagesVisited' as pages_visited
FROM public.leads
WHERE email = 'krish@tesla.com' OR name ILIKE '%krish%'
ORDER BY created_at DESC;

-- 3. View all leads with qualification data breakdown
-- ============================================
SELECT 
  name,
  email,
  selected_program,
  commitment_level,
  audience_type,
  path_type,
  CASE 
    WHEN commitment_level = '1hr' THEN '1 Hour Session'
    WHEN commitment_level = '3hr' THEN '3 Hour Session'
    WHEN commitment_level = '4wk' THEN '4 Week Program'
    WHEN commitment_level = '90d' THEN '90 Day Program'
    ELSE commitment_level
  END as commitment_label,
  email_sent,
  created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 50;

-- 4. Count leads by program/path combination
-- ============================================
SELECT 
  selected_program,
  path_type,
  audience_type,
  commitment_level,
  COUNT(*) as lead_count,
  COUNT(*) FILTER (WHERE email_sent = true) as emails_sent_count,
  COUNT(*) FILTER (WHERE email_sent = false) as emails_failed_count
FROM public.leads
GROUP BY selected_program, path_type, audience_type, commitment_level
ORDER BY lead_count DESC;

-- 5. View leads that failed to send emails
-- ============================================
SELECT 
  id,
  name,
  email,
  selected_program,
  commitment_level,
  audience_type,
  path_type,
  created_at
FROM public.leads
WHERE email_sent = false
ORDER BY created_at DESC;

-- 6. View leads with full session data (JSON)
-- ============================================
SELECT 
  name,
  email,
  selected_program,
  commitment_level,
  audience_type,
  path_type,
  session_data,
  company_research,
  engagement_score,
  created_at
FROM public.leads
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;

-- 7. Summary statistics
-- ============================================
SELECT 
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE email_sent = true) as successful_emails,
  COUNT(*) FILTER (WHERE email_sent = false) as failed_emails,
  COUNT(*) FILTER (WHERE calendly_opened = true) as calendly_opened_count,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as leads_last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as leads_last_7d
FROM public.leads;

-- 8. View qualification data completeness
-- ============================================
SELECT 
  COUNT(*) as total,
  COUNT(commitment_level) as has_commitment_level,
  COUNT(audience_type) as has_audience_type,
  COUNT(path_type) as has_path_type,
  COUNT(*) FILTER (WHERE commitment_level IS NOT NULL AND audience_type IS NOT NULL) as fully_qualified
FROM public.leads
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 9. View test leads by CTA source (based on selected_program and path_type)
-- ============================================
SELECT 
  name,
  email,
  selected_program,
  path_type,
  audience_type,
  commitment_level,
  CASE 
    WHEN selected_program = 'build' AND path_type = 'build' AND audience_type = 'individual' THEN 'Individual Build Path'
    WHEN selected_program = 'orchestrate' AND path_type = 'orchestrate' AND audience_type = 'individual' THEN 'Individual Orchestrate Path'
    WHEN selected_program = 'team' AND audience_type = 'team' THEN 'Team Path'
    WHEN selected_program = 'portfolio-program' THEN 'Portfolio Builder'
    WHEN selected_program = 'build' AND path_type IS NULL THEN 'Builder Assessment / Friction Map'
    ELSE 'Other'
  END as cta_source,
  email_sent,
  created_at
FROM public.leads
WHERE email = 'krish@tesla.com'
ORDER BY created_at DESC;
