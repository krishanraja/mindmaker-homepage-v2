# Email Sending - Complete Diagnostic Instructions

**Purpose**: Step-by-step guide to diagnose why emails are failing with 401 errors

---

## STEP 1: Verify Edge Function Deployment

### Check if Function is Deployed
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **Edge Functions** → **send-lead-email**
3. Check **Last Deployed** timestamp
4. Should be within last 5 minutes if you just pushed code

### Verify Code is Live
1. In Supabase Dashboard, go to: **Edge Functions** → **send-lead-email** → **Logs**
2. Look for recent log entries
3. Check if you see: `"API key configured:"` log message (from our diagnostic code)
4. If you don't see this, function hasn't deployed yet

### Force Redeploy (if needed)
```bash
# If you have Supabase CLI installed
supabase functions deploy send-lead-email

# OR manually trigger via:
# Supabase Dashboard → Edge Functions → send-lead-email → Deploy
```

---

## STEP 2: Verify RESEND_API_KEY Secret

### Check Secret Exists
1. Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Look for: `RESEND_API_KEY`
3. Verify it exists and has a value

### Verify Secret Format
1. Click on `RESEND_API_KEY` secret
2. Check:
   - Starts with `re_` (Resend API keys always start with this)
   - No leading/trailing whitespace
   - No newlines
   - Full key is visible (not truncated)

### Test Secret Value
1. Copy the secret value
2. Go to Resend Dashboard: https://resend.com/api-keys
3. Verify the key exists and is active
4. Check key permissions (should allow email sending)

---

## STEP 3: Check Edge Function Logs

### View Real-Time Logs
1. Supabase Dashboard → **Edge Functions** → **send-lead-email** → **Logs**
2. Run test script: `node scripts/send-test-emails-node.js`
3. Watch logs in real-time

### What to Look For

**Success Indicators**:
```
API key configured: { present: true, length: XX, startsWith: 're_', format: 'valid' }
Resend API request details: { ... }
Email sent successfully: { id: '...' }
```

**Failure Indicators**:
```
CRITICAL: RESEND_API_KEY is not configured
CRITICAL: RESEND_API_KEY format invalid
Resend API error (401): ...
```

### Key Diagnostic Logs
- **API key configured**: Shows if key is being read
- **Resend API request details**: Shows exact request being sent
- **Resend API error details**: Shows full error response from Resend

---

## STEP 4: Test API Key Directly

### Create Direct Test Script
Create file: `scripts/test-resend-direct.js`

```javascript
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("Error: RESEND_API_KEY must be set");
  process.exit(1);
}

async function testResend() {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mindmaker Leads <leads@themindmaker.ai>',
        to: ['krish@themindmaker.ai'],
        subject: 'Test Email - Direct API Call',
        html: '<h1>Test</h1><p>This is a direct API test.</p>',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success:', data);
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testResend();
```

### Run Direct Test
```bash
# Set your actual Resend API key
$env:RESEND_API_KEY = "your-actual-resend-api-key-here"
node scripts/test-resend-direct.js
```

**Expected Results**:
- ✅ Success: API key works, issue is in edge function
- ❌ 401 Error: API key is invalid (check Resend dashboard)
- ❌ Other Error: Different issue (domain verification, etc.)

---

## STEP 5: Compare with Working Functions

### Test Working Function
The `send-contact-email` function works. Test it:

```bash
# Use same environment variables
$env:VITE_SUPABASE_URL = "https://smvwbbilnsprexeuplex.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create test script: scripts/test-contact-email.js
```

```javascript
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

fetch(`${SUPABASE_URL}/functions/v1/send-contact-email`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY,
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    message: 'Test message'
  }),
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**If this works**: The API key is fine, issue is specific to `send-lead-email` function
**If this fails**: API key issue affects all functions

---

## STEP 6: Check Resend Dashboard

### Verify Domain
1. Go to: https://resend.com/domains
2. Check: `themindmaker.ai` is verified
3. Status should be: **Verified** (green checkmark)

### Verify API Key
1. Go to: https://resend.com/api-keys
2. Find your API key
3. Check:
   - Status: **Active**
   - Permissions: Should allow email sending
   - Last used: Should show recent activity

### Check Email Logs
1. Go to: https://resend.com/emails
2. Look for recent emails
3. Check status:
   - ✅ **Delivered**: Email sent successfully
   - ❌ **Failed**: Check error message
   - ⏳ **Pending**: Still processing

---

## STEP 7: Verify Edge Function Code

### Check Deployed Code
1. Supabase Dashboard → **Edge Functions** → **send-lead-email** → **Code**
2. Verify code matches local file:
   - Uses `sanitizedApiKey` (not `RESEND_API_KEY` directly)
   - Uses regular `fetch` (not `fetchWithTimeout`)
   - Has diagnostic logging

### Check Local Code
```bash
# Verify local code has fixes
grep -n "sanitizedApiKey" supabase/functions/send-lead-email/index.ts
grep -n "fetchWithTimeout" supabase/functions/send-lead-email/index.ts
# Should show fetchWithTimeout is NOT used for Resend API
```

---

## STEP 8: Manual Edge Function Test

### Test via Supabase Dashboard
1. Go to: **Edge Functions** → **send-lead-email** → **Invoke**
2. Use this test payload:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "jobTitle": "CEO",
  "selectedProgram": "initial-consult",
  "sessionData": {
    "pagesVisited": ["/"],
    "timeOnSite": 60,
    "scrollDepth": 50
  }
}
```
3. Click **Invoke**
4. Check **Response** and **Logs** tabs

### Expected Response
- ✅ Success: `{ "success": true, "leadId": "..." }`
- ❌ Error: Check error message and logs

---

## STEP 9: Check for Common Issues

### Issue 1: Secret Not Propagated
**Symptom**: Logs show "CRITICAL: RESEND_API_KEY is not configured"
**Fix**: 
1. Delete secret in Supabase
2. Recreate secret
3. Redeploy edge function
4. Wait 2-3 minutes

### Issue 2: Wrong Secret Name
**Symptom**: Function can't find secret
**Fix**: 
1. Verify secret name is exactly: `RESEND_API_KEY` (case-sensitive)
2. No spaces, no typos

### Issue 3: API Key Format Issue
**Symptom**: Logs show "CRITICAL: RESEND_API_KEY format invalid"
**Fix**:
1. API key must start with `re_`
2. Check for whitespace (should be trimmed automatically now)
3. Verify in Resend dashboard

### Issue 4: Domain Not Verified
**Symptom**: 401 or domain-related errors
**Fix**:
1. Go to Resend → Domains
2. Verify `themindmaker.ai` is verified
3. Check DNS records if needed

### Issue 5: Function Not Redeployed
**Symptom**: Old code still running (no diagnostic logs)
**Fix**:
1. Force redeploy via Supabase CLI or Dashboard
2. Wait 60-90 seconds
3. Check deployment timestamp

---

## STEP 10: Get Diagnostic Information

### Run Test and Capture Logs
```bash
# Run test script
node scripts/send-test-emails-node.js > test-output.txt 2>&1

# Check output file
cat test-output.txt
```

### Check Supabase Logs
1. Supabase Dashboard → **Edge Functions** → **send-lead-email** → **Logs**
2. Filter by: Last 10 minutes
3. Look for:
   - `API key configured:`
   - `Resend API request details:`
   - `Resend API error details:`
4. Copy all relevant log entries

### Information to Collect
1. **API Key Info**:
   - First 5 characters (from logs)
   - Length (from logs)
   - Format validation result

2. **Request Details**:
   - Exact URL
   - Headers sent
   - Request body size

3. **Error Response**:
   - Full error JSON from Resend
   - Status code
   - Response headers

---

## STEP 11: Compare Request Formats

### Working Function Request (send-contact-email)
```javascript
fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${RESEND_API_KEY}`,
  },
  body: JSON.stringify({
    from: "Mindmaker Contact <contact@themindmaker.ai>",
    to: ["krish@themindmaker.ai"],
    reply_to: email,
    subject: "...",
    html: "...",
  }),
})
```

### Failing Function Request (send-lead-email)
```javascript
fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sanitizedApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Mindmaker Leads <leads@themindmaker.ai>',
    to: ['krish@themindmaker.ai'],
    reply_to: email,
    subject: '...',
    html: '...',
  }),
})
```

**Differences to Check**:
- Header key format: `"Authorization"` vs `'Authorization'` (shouldn't matter)
- From address: `contact@` vs `leads@` (both should work if domain verified)
- API key variable: `RESEND_API_KEY` vs `sanitizedApiKey` (should be same value)

---

## STEP 12: Verify Environment Variables

### In Edge Function
The function reads: `Deno.env.get("RESEND_API_KEY")`

### In Supabase Dashboard
1. Go to: **Project Settings** → **Edge Functions** → **Secrets**
2. Verify secret name matches exactly: `RESEND_API_KEY`
3. Check if secret is scoped to function (should be available to all functions)

---

## STEP 13: Test with Minimal Payload

### Create Minimal Test
```javascript
// scripts/test-resend-minimal.js
const RESEND_API_KEY = process.env.RESEND_API_KEY;

fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY.trim()}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Mindmaker Leads <leads@themindmaker.ai>',
    to: ['krish@themindmaker.ai'],
    subject: 'Minimal Test',
    html: '<p>Test</p>',
  }),
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

Run: `$env:RESEND_API_KEY = "your-key"; node scripts/test-resend-minimal.js`

---

## STEP 14: Check Resend API Status

### Verify API is Operational
1. Go to: https://status.resend.com
2. Check if there are any outages
3. Verify API status is **Operational**

### Check Rate Limits
1. Go to: https://resend.com/dashboard
2. Check email sending quota
3. Verify you haven't exceeded limits

---

## STEP 15: Final Verification Checklist

Before declaring issue resolved, verify:

- [ ] Edge function deployed (check timestamp)
- [ ] Diagnostic logs appear in Supabase logs
- [ ] API key format validated (starts with `re_`)
- [ ] API key trimmed (no whitespace)
- [ ] Using regular `fetch` (not `fetchWithTimeout`)
- [ ] From address matches verified domain
- [ ] Resend dashboard shows API key is active
- [ ] Domain `themindmaker.ai` is verified in Resend
- [ ] Direct API test works (bypasses edge function)
- [ ] Working function (`send-contact-email`) still works
- [ ] Supabase logs show detailed error information

---

## TROUBLESHOOTING GUIDE

### If 401 Error Persists After All Fixes

1. **Verify Secret is Actually Set**:
   - Check Supabase Dashboard → Secrets
   - Verify `RESEND_API_KEY` exists
   - Copy value and test directly

2. **Check for Multiple Secrets**:
   - Look for `RESEND_API_KEY` with different casing
   - Look for `resend_api_key` (snake_case)
   - Delete duplicates

3. **Verify Function is Reading Secret**:
   - Check logs for: `API key configured:`
   - If not present, function isn't reading secret

4. **Test with Different API Key**:
   - Create new API key in Resend
   - Update secret in Supabase
   - Redeploy function
   - Test again

5. **Check Resend Account**:
   - Verify account is active
   - Check billing status
   - Verify domain ownership

---

## QUICK DIAGNOSTIC COMMANDS

### Check Function Deployment
```bash
# If you have Supabase CLI
supabase functions list
supabase functions logs send-lead-email --limit 50
```

### Test Direct API Call
```bash
# Replace YOUR_API_KEY with actual key
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Mindmaker Leads <leads@themindmaker.ai>",
    "to": ["krish@themindmaker.ai"],
    "subject": "Direct Test",
    "html": "<p>Test</p>"
  }'
```

### Check Edge Function Logs
1. Supabase Dashboard → Edge Functions → send-lead-email → Logs
2. Filter: Last 1 hour
3. Look for diagnostic messages

---

## WHAT TO SHARE FOR FURTHER DIAGNOSIS

If you need help elsewhere, provide:

1. **Supabase Logs** (last 10 attempts):
   - Copy all log entries from edge function
   - Include timestamps

2. **Direct API Test Result**:
   - Run `test-resend-direct.js`
   - Share full output

3. **Resend Dashboard Screenshots**:
   - API Keys page (showing active key)
   - Domains page (showing verified domain)
   - Emails page (showing recent attempts)

4. **Edge Function Code**:
   - Current deployed version
   - Compare with `supabase/functions/send-lead-email/index.ts`

5. **Test Script Output**:
   - Full output from `send-test-emails-node.js`
   - Include all error messages

---

## EXPECTED BEHAVIOR

### When Working Correctly
1. Test script runs
2. Each test email shows: `✅ Success - Lead ID: ...`
3. You receive 26 emails in `krish@themindmaker.ai`
4. Supabase logs show: `Email sent successfully`
5. Resend dashboard shows: 26 emails delivered

### Current Behavior (Broken)
1. Test script runs
2. Most show: `❌ Error: Email delivery failed after 3 attempts: Resend API error (401)`
3. Some show: `❌ Error: Cannot read properties of undefined (reading 'replace')`
4. No emails received
5. Supabase logs show 401 errors

---

## NEXT STEPS

1. Follow steps 1-15 in order
2. Document findings at each step
3. Identify which step reveals the issue
4. Apply fix based on findings
5. Verify fix with test script

---

## FILES REFERENCE

- **Edge Function**: `supabase/functions/send-lead-email/index.ts`
- **Test Script**: `scripts/send-test-emails-node.js`
- **Working Function**: `supabase/functions/send-contact-email/index.ts`
- **Diagnostic Plan**: `EMAIL_401_COMPLETE_FIX_PLAN.md`

---

## CONTACT POINTS

- **Supabase Support**: https://supabase.com/support
- **Resend Support**: https://resend.com/support
- **Resend API Docs**: https://resend.com/docs/api-reference
