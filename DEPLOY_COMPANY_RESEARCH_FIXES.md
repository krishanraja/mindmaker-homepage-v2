# Deploy Company Research Fixes

## Step 1: Run SQL Migration in Supabase

Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Create company research cache table
-- Caches company research results to reduce API calls and improve performance

CREATE TABLE IF NOT EXISTS public.company_research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  research_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by domain
CREATE INDEX IF NOT EXISTS idx_company_research_cache_domain ON public.company_research_cache(domain);
-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_company_research_cache_expires_at ON public.company_research_cache(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.company_research_cache ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then create them
DROP POLICY IF EXISTS "Service role can manage cache" ON public.company_research_cache;
CREATE POLICY "Service role can manage cache"
  ON public.company_research_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to clean up expired cache entries (optional - can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_research_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.company_research_cache
  WHERE expires_at < now();
END;
$$;
```

**To run:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **SQL Editor**
3. Click **New Query**
4. Paste the SQL above
5. Click **Run** (or press Ctrl+Enter)

---

## Step 2: Deploy Edge Function

### Option A: Using Supabase Dashboard (Recommended if CLI not available)

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **Edge Functions** → **send-lead-email**
3. Click **Edit Function** or **Deploy**
4. Copy the entire contents of `supabase/functions/send-lead-email/index.ts`
5. Paste into the editor
6. Click **Deploy** or **Save**

**Note:** You'll also need to ensure the shared utilities are available:
- The function imports from `../_shared/company-research.ts` and `../_shared/retry.ts`
- These files should be automatically available in the Supabase Edge Functions environment
- If you get import errors, you may need to copy those files to the Supabase dashboard as well

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy send-lead-email
```

### Option C: Using npx (if CLI not globally installed)

```bash
npx supabase functions deploy send-lead-email --project-ref YOUR_PROJECT_REF
```

---

## Step 3: Verify Deployment

### Check Health Endpoint

```bash
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-lead-email?health=true"
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T...",
  "configuration": {
    "resendApiKey": {
      "configured": true,
      "valid": true
    },
    "googleAiApiKey": {
      "configured": true,
      "validated": true
    }
  },
  "errors": []
}
```

### Test Company Research

1. Submit a test lead with a business email (e.g., `test@tesla.com`)
2. Check Edge Function logs in Supabase Dashboard
3. Look for structured logs like:
   ```
   [CompanyResearch] Starting research for domain: tesla.com
   [CompanyResearch] ✅ Research completed: { companyName: "Tesla, Inc.", industry: "...", ... }
   ```
4. Verify the email received has populated industry and size (not "Unknown")

### Check Cache

```sql
SELECT * FROM company_research_cache 
ORDER BY created_at DESC 
LIMIT 5;
```

You should see cached research results after the first API call.

---

## Troubleshooting

### If Edge Function Deployment Fails

1. **Check shared utilities are available:**
   - Supabase Edge Functions should automatically include files in `_shared/` directory
   - If not, you may need to manually copy the files

2. **Check imports:**
   - Verify `supabase/functions/_shared/company-research.ts` exists
   - Verify `supabase/functions/_shared/retry.ts` exists
   - These are imported in `send-lead-email/index.ts`

3. **Check logs:**
   - Go to Supabase Dashboard → Edge Functions → send-lead-email → Logs
   - Look for import errors or runtime errors

### If Research Still Returns "Unknown"

1. **Check GOOGLE_AI_API_KEY:**
   - Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Verify `GOOGLE_AI_API_KEY` is set and valid

2. **Check health endpoint:**
   - Run health check (see Step 3)
   - Verify API key validation passes

3. **Check logs:**
   - Look for `[CompanyResearch]` log entries
   - Check for API errors or parsing failures

---

## What Was Fixed

✅ Multi-source research architecture with caching  
✅ Structured JSON output from Gemini API  
✅ Retry logic with exponential backoff  
✅ Comprehensive observability and logging  
✅ Configuration validation on startup  
✅ Improved prompt engineering (prohibits "Unknown" values)  
✅ Research caching layer (30-day TTL)

---

## Next Steps

After deployment:
1. Monitor logs for research success rate
2. Check cache hit rate after a few days
3. Verify no more "Unknown" values for known companies
4. Set up alerts if research failure rate > 5%
