# Email Diagnostic Checklist

Use this checklist to systematically diagnose the 401 error.

## Pre-Diagnostic Setup

- [ ] Have Resend API key ready (from Resend dashboard)
- [ ] Have Supabase project URL and anon key ready
- [ ] Access to Supabase Dashboard
- [ ] Access to Resend Dashboard

---

## Phase 1: Verify Infrastructure

### Step 1.1: Check Resend Account
- [ ] Log into Resend: https://resend.com
- [ ] Verify account is active (no billing issues)
- [ ] Check API Keys page: https://resend.com/api-keys
- [ ] Verify API key exists and is **Active**
- [ ] Copy API key value (starts with `re_`)

### Step 1.2: Check Domain Verification
- [ ] Go to Resend → Domains: https://resend.com/domains
- [ ] Verify `themindmaker.ai` is listed
- [ ] Status shows **Verified** (green checkmark)
- [ ] DNS records are correct (if shown)

### Step 1.3: Check Supabase Secrets
- [ ] Log into Supabase Dashboard
- [ ] Go to: **Project Settings** → **Edge Functions** → **Secrets**
- [ ] Find `RESEND_API_KEY` in list
- [ ] Verify it exists (not missing)
- [ ] Click to view (verify value matches Resend dashboard)

---

## Phase 2: Test API Key Directly

### Step 2.1: Run Direct API Test
```powershell
# Set your actual Resend API key
$env:RESEND_API_KEY = "re_your_actual_key_here"
node scripts/test-resend-direct.js
```

**Expected**: ✅ Success with email ID
**If fails**: API key is invalid → Fix in Resend dashboard

### Step 2.2: Run Minimal Test
```powershell
$env:RESEND_API_KEY = "re_your_actual_key_here"
node scripts/test-resend-minimal.js
```

**Expected**: ✅ Success
**If fails**: API key or domain issue

---

## Phase 3: Test Working Function

### Step 3.1: Test send-contact-email
```powershell
$env:VITE_SUPABASE_URL = "https://smvwbbilnsprexeuplex.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
node scripts/test-contact-email-working.js
```

**Expected**: ✅ Success
**If works**: API key is valid, issue is in send-lead-email
**If fails**: API key issue affects all functions

---

## Phase 4: Check Edge Function Deployment

### Step 4.1: Verify Deployment Status
- [ ] Supabase Dashboard → **Edge Functions** → **send-lead-email**
- [ ] Check **Last Deployed** timestamp
- [ ] Should be recent (within last 10 minutes if you just pushed)

### Step 4.2: Check Function Logs
- [ ] Supabase Dashboard → **Edge Functions** → **send-lead-email** → **Logs**
- [ ] Filter: **Last 1 hour**
- [ ] Look for: `API key configured:` log message
- [ ] If not present: Function hasn't deployed or old code running

### Step 4.3: Verify Code is Live
- [ ] Supabase Dashboard → **Edge Functions** → **send-lead-email** → **Code**
- [ ] Check if code shows:
  - `sanitizedApiKey` variable (not just `RESEND_API_KEY`)
  - Regular `fetch` (not `fetchWithTimeout` for Resend)
  - Diagnostic logging

---

## Phase 5: Run Test Script with Logging

### Step 5.1: Run Test Script
```powershell
$env:VITE_SUPABASE_URL = "https://smvwbbilnsprexeuplex.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
node scripts/send-test-emails-node.js
```

### Step 5.2: Check Supabase Logs Simultaneously
- [ ] Keep Supabase logs open in another tab
- [ ] Watch for diagnostic messages as test runs
- [ ] Look for:
  - `API key configured:` (shows key is read)
  - `Resend API request details:` (shows request being sent)
  - `Resend API error details:` (shows full error)

### Step 5.3: Document Findings
- [ ] Copy all log entries from test run
- [ ] Copy all Supabase log entries
- [ ] Note any patterns (all fail? some succeed? specific errors?)

---

## Phase 6: Compare Request Formats

### Step 6.1: Check Working Function Code
- [ ] Open: `supabase/functions/send-contact-email/index.ts`
- [ ] Note exact request format (headers, body structure)

### Step 6.2: Check Failing Function Code
- [ ] Open: `supabase/functions/send-lead-email/index.ts`
- [ ] Compare request format line-by-line
- [ ] Note any differences

### Step 6.3: Key Differences to Check
- [ ] Header format: `"Authorization"` vs `'Authorization'`
- [ ] API key variable: `RESEND_API_KEY` vs `sanitizedApiKey`
- [ ] Fetch method: `fetch()` vs `fetchWithTimeout()`
- [ ] From address format
- [ ] Request body structure

---

## Phase 7: Verify Secret Propagation

### Step 7.1: Check if Secret is Read
- [ ] Look in Supabase logs for: `API key configured:`
- [ ] Should show: `{ present: true, length: XX, startsWith: 're_', format: 'valid' }`
- [ ] If not present: Secret not being read

### Step 7.2: Force Secret Refresh
- [ ] Supabase Dashboard → **Secrets**
- [ ] Delete `RESEND_API_KEY` secret
- [ ] Wait 30 seconds
- [ ] Recreate `RESEND_API_KEY` with same value
- [ ] Redeploy edge function
- [ ] Wait 2 minutes
- [ ] Test again

---

## Phase 8: Check for Common Issues

### Issue A: Secret Name Mismatch
- [ ] Verify secret name is exactly: `RESEND_API_KEY`
- [ ] Check for: `resend_api_key` (wrong)
- [ ] Check for: `RESEND-API-KEY` (wrong)
- [ ] Check for: `ResendApiKey` (wrong)

### Issue B: API Key Format
- [ ] Must start with: `re_`
- [ ] No leading/trailing whitespace
- [ ] Full key copied (not truncated)
- [ ] No newlines in secret value

### Issue C: Domain Verification
- [ ] Domain `themindmaker.ai` verified in Resend
- [ ] From address uses verified domain
- [ ] Subdomain `leads@` is allowed (or domain allows all subdomains)

### Issue D: Function Not Redeployed
- [ ] Code pushed to GitHub
- [ ] Edge function shows recent deployment
- [ ] Logs show new diagnostic messages
- [ ] If not: Force redeploy manually

---

## Phase 9: Collect Diagnostic Data

### Data to Collect
1. **Supabase Logs** (last 20 entries):
   ```
   [Copy all log entries from edge function]
   ```

2. **Direct API Test Result**:
   ```
   [Output from test-resend-direct.js]
   ```

3. **Working Function Test Result**:
   ```
   [Output from test-contact-email-working.js]
   ```

4. **Test Script Output**:
   ```
   [Full output from send-test-emails-node.js]
   ```

5. **Resend Dashboard Screenshots**:
   - API Keys page
   - Domains page
   - Emails page (if any attempts shown)

---

## Phase 10: Root Cause Analysis

### If Direct API Test Works
- ✅ API key is valid
- ✅ Domain is verified
- ❌ Issue is in edge function code or deployment

### If Direct API Test Fails
- ❌ API key is invalid or expired
- ❌ Domain not verified
- ❌ Resend account issue

### If Working Function Works
- ✅ API key is valid
- ✅ Secret is accessible
- ❌ Issue specific to send-lead-email function

### If Working Function Fails
- ❌ API key issue affects all functions
- ❌ Secret not accessible
- ❌ Supabase configuration issue

---

## Quick Reference Commands

### Test Direct API
```powershell
$env:RESEND_API_KEY = "your-key"
node scripts/test-resend-direct.js
```

### Test Working Function
```powershell
$env:VITE_SUPABASE_URL = "https://smvwbbilnsprexeuplex.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "your-key"
node scripts/test-contact-email-working.js
```

### Run Full Test Suite
```powershell
$env:VITE_SUPABASE_URL = "https://smvwbbilnsprexeuplex.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "your-key"
node scripts/send-test-emails-node.js
```

### Check Supabase Logs
1. Dashboard → Edge Functions → send-lead-email → Logs
2. Filter: Last 1 hour
3. Look for diagnostic messages

---

## Expected Diagnostic Output

### When Everything Works
```
API key configured: { present: true, length: 51, startsWith: 're_', format: 'valid' }
Resend API request details: { url: '...', hasApiKey: true, ... }
Email sent successfully: { id: '...' }
```

### When API Key is Invalid
```
Resend API error details: { status: 401, errorBody: '{"statusCode":401,"name":"validation_error","message":"API key is invalid"}' }
```

### When Secret Not Read
```
CRITICAL: RESEND_API_KEY is not configured
```

---

## Next Steps After Diagnosis

1. **If API key invalid**: Fix in Resend dashboard, update Supabase secret
2. **If secret not read**: Check secret name, force redeploy
3. **If function not deployed**: Force redeploy via CLI or Dashboard
4. **If code issue**: Compare with working function, fix differences
5. **If domain issue**: Verify domain in Resend dashboard

---

## Files Created for Diagnostics

1. `scripts/test-resend-direct.js` - Direct API test
2. `scripts/test-contact-email-working.js` - Test working function
3. `scripts/test-resend-minimal.js` - Minimal test
4. `EMAIL_DIAGNOSTIC_INSTRUCTIONS.md` - This file
5. `DIAGNOSTIC_CHECKLIST.md` - Step-by-step checklist
