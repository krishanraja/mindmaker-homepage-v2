# Email 401 Error - Complete Diagnostic Analysis

**Date**: 2025-01-XX  
**Status**: IN PROGRESS - Comprehensive root cause investigation  
**Error**: `Resend API error (401): {"statusCode":401,"name":"validation_error","message":"API key is invalid"}`

---

## PHASE 1: Complete Problem Scope

### Observed Behavior
- **Error**: 401 Unauthorized from Resend API
- **Message**: "API key is invalid"
- **Frequency**: All 26 test emails failing
- **User Confirmation**: API key is valid, domain is verified (themindmaker.ai)

### Architecture Map
```
Test Script (Node.js)
  ↓
POST to /functions/v1/send-lead-email
  ↓
Edge Function Handler
  ↓
1. Read RESEND_API_KEY from Deno.env.get("RESEND_API_KEY")
2. Validate key exists (line 131)
3. Build email payload
4. Call fetchWithTimeout('https://api.resend.com/emails', {
     headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` }
   })
  ↓
Resend API
  ↓
401: API key is invalid
```

### Comparison with Working Functions

**send-contact-email** (Working):
- Uses: `Deno.env.get("RESEND_API_KEY")` (same)
- Uses: Regular `fetch()` (not timeout wrapper)
- From: `"Mindmaker Contact <contact@themindmaker.ai>"`
- Headers: `'Authorization': \`Bearer ${RESEND_API_KEY}\`` (same)

**send-lead-email** (Failing):
- Uses: `Deno.env.get("RESEND_API_KEY")` (same)
- Uses: `fetchWithTimeout()` wrapper (DIFFERENT)
- From: `'Mindmaker Leads <leads@themindmaker.ai>'`
- Headers: `'Authorization': \`Bearer ${RESEND_API_KEY}\`` (same)

### Key Differences Identified
1. **Timeout wrapper**: `send-lead-email` uses `fetchWithTimeout`, others use `fetch`
2. **From address**: Different sender names but same domain
3. **Error handling**: More complex retry logic in `send-lead-email`

---

## PHASE 2: Root Cause Investigation - ALL POSSIBLE REASONS

### Hypothesis 1: API Key Not Being Read Correctly
**Evidence Needed**:
- Log the actual API key value (first 5 chars + length) at runtime
- Verify Deno.env.get() is working
- Check if secret name matches exactly: `RESEND_API_KEY`

**Test**: Add logging before API call to see actual key value

### Hypothesis 2: API Key Format Issue
**Possible Issues**:
- Whitespace (leading/trailing spaces)
- Newlines in the secret
- Wrong key format (should start with `re_`)
- Key truncated or corrupted

**Test**: Trim and validate key format before use

### Hypothesis 3: Timeout Wrapper Interference
**Evidence**:
- `fetchWithTimeout` uses `AbortController`
- May be interfering with request headers
- Other functions use regular `fetch` and work

**Test**: Temporarily use regular `fetch` to see if timeout wrapper is the issue

### Hypothesis 4: Edge Function Not Redeployed
**Evidence**:
- Code changes pushed but function not auto-deployed
- Old code still running with old secret reference
- Secret updated but function hasn't restarted

**Test**: Check deployment logs, verify function version

### Hypothesis 5: Secret Caching Issue
**Evidence**:
- Supabase may cache secrets
- New secret not picked up until function restart
- Old secret still in memory

**Test**: Force function restart/redeploy

### Hypothesis 6: API Key Permissions/Scope
**Evidence**:
- Key might be restricted to certain domains
- Key might not have email sending permissions
- Key might be for different Resend account

**Test**: Verify key permissions in Resend dashboard

### Hypothesis 7: Domain Verification Mismatch
**Evidence**:
- From address uses `leads@themindmaker.ai`
- Domain verified as `themindmaker.ai`
- May need exact subdomain verification

**Test**: Check Resend dashboard for subdomain requirements

### Hypothesis 8: Request Header Format Issue
**Evidence**:
- Authorization header format might be wrong
- Content-Type might be missing or wrong
- Headers might be modified by timeout wrapper

**Test**: Compare exact headers sent vs expected

### Hypothesis 9: API Endpoint Version Issue
**Evidence**:
- Using `https://api.resend.com/emails`
- May need different endpoint or version
- API might have changed

**Test**: Check Resend API docs for current endpoint

### Hypothesis 10: AbortController Signal Interference
**Evidence**:
- `fetchWithTimeout` passes `signal: controller.signal`
- This might interfere with Resend API authentication
- Other functions don't use AbortController

**Test**: Remove signal from fetch call temporarily

---

## PHASE 3: Diagnostic Implementation Plan

### Step 1: Add Comprehensive Logging
**Location**: `supabase/functions/send-lead-email/index.ts`
**Changes**:
- Log API key presence (first 5 chars + length, not full key)
- Log exact request headers being sent
- Log exact request body (sanitized)
- Log full error response from Resend

### Step 2: Test Without Timeout Wrapper
**Location**: `supabase/functions/send-lead-email/index.ts:601`
**Change**: Temporarily use regular `fetch` instead of `fetchWithTimeout`
**Purpose**: Isolate if timeout wrapper is causing the issue

### Step 3: Compare with Working Function
**Location**: Compare `send-contact-email` vs `send-lead-email`
**Purpose**: Identify exact differences in working vs failing code

### Step 4: Add API Key Validation
**Location**: Before API call
**Changes**:
- Trim whitespace from API key
- Validate format (starts with `re_`)
- Log validation result

### Step 5: Test Direct API Call
**Purpose**: Bypass edge function to test if API key works directly
**Method**: Create minimal test script that calls Resend API directly

---

## PHASE 4: Verification Checklist

### CP1: Logging Added
- [ ] API key logged (first 5 chars + length)
- [ ] Request headers logged
- [ ] Request body logged (sanitized)
- [ ] Full error response logged

### CP2: Timeout Wrapper Tested
- [ ] Test with regular `fetch` (no timeout)
- [ ] Compare results
- [ ] Identify if timeout wrapper is issue

### CP3: API Key Validation
- [ ] Key is trimmed
- [ ] Key format validated
- [ ] Key length checked

### CP4: Direct API Test
- [ ] Test API key directly with curl/Postman
- [ ] Verify key works outside edge function
- [ ] Compare results

---

## FILES TO MODIFY

1. `supabase/functions/send-lead-email/index.ts`
   - Add comprehensive logging
   - Add API key validation
   - Test without timeout wrapper
   - Compare headers with working function

2. `scripts/test-resend-direct.js` (NEW)
   - Direct Resend API test
   - Bypass edge function
   - Verify API key works

---

## NEXT STEPS

1. Add diagnostic logging to edge function
2. Test with regular fetch (no timeout wrapper)
3. Compare exact request format with working function
4. Test API key directly
5. Identify root cause from logs
6. Implement permanent fix
