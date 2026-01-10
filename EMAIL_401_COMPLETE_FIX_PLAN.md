# Email 401 Error - Complete Diagnostic & Fix Plan

**Date**: 2025-01-XX  
**Status**: DIAGNOSTIC MODE - No edits until root cause identified  
**Error**: `Resend API error (401): {"statusCode":401,"name":"validation_error","message":"API key is invalid"}`

---

## PHASE 1: Complete Problem Scope

### Critical Discovery: Working vs Failing Functions

**Working Functions** (using same API key):
- `send-contact-email`: Uses regular `fetch()`, works
- `send-leadership-insights-email`: Uses regular `fetch()`, works, SAME from address

**Failing Function**:
- `send-lead-email`: Uses `fetchWithTimeout()` wrapper, fails

### Key Difference Identified
**ONLY difference**: `send-lead-email` uses `fetchWithTimeout()` wrapper with `AbortController.signal`, while working functions use regular `fetch()`.

### All Possible Root Causes

1. **AbortController Signal Interference** (HIGH PROBABILITY)
   - `fetchWithTimeout` passes `signal: controller.signal`
   - This may interfere with Resend API authentication
   - Working functions don't use AbortController

2. **API Key Not Trimmed** (MEDIUM PROBABILITY)
   - Secret may have leading/trailing whitespace
   - Working functions might handle this differently
   - Need to trim before use

3. **Edge Function Not Redeployed** (MEDIUM PROBABILITY)
   - Code pushed but function not auto-deployed
   - Old code still running
   - New secret not picked up

4. **Secret Caching** (LOW PROBABILITY)
   - Supabase caches secrets
   - Function needs restart to pick up new secret

5. **API Key Format Validation Missing** (LOW PROBABILITY)
   - Key should start with `re_`
   - No validation before use
   - Invalid format would cause 401

6. **Request Header Modification** (LOW PROBABILITY)
   - Timeout wrapper might modify headers
   - Authorization header might be corrupted

---

## PHASE 2: Diagnostic Implementation

### Step 1: Add Comprehensive Logging
**File**: `supabase/functions/send-lead-email/index.ts`
**Location**: Before API call (line 598-618)

**Logs to Add**:
1. API key presence check (first 5 chars + length)
2. API key format validation (starts with `re_`)
3. Trimmed API key (to catch whitespace issues)
4. Exact request headers being sent
5. Exact request URL
6. Full error response from Resend (if any)

### Step 2: Test Without Timeout Wrapper
**File**: `supabase/functions/send-lead-email/index.ts:601`
**Change**: Temporarily replace `fetchWithTimeout` with regular `fetch`
**Purpose**: Isolate if AbortController signal is the issue

### Step 3: Add API Key Sanitization
**File**: `supabase/functions/send-lead-email/index.ts:130`
**Change**: Trim and validate API key before use
**Purpose**: Catch whitespace or format issues

### Step 4: Compare Exact Request Format
**Purpose**: Ensure request format matches working functions exactly

---

## PHASE 3: Implementation Plan

### File: `supabase/functions/send-lead-email/index.ts`

#### Change 1: Add API Key Sanitization (Line 130-137)
```typescript
// Validate and sanitize RESEND_API_KEY early - fail fast if missing
if (!RESEND_API_KEY || RESEND_API_KEY.trim() === '') {
  console.error("CRITICAL: RESEND_API_KEY is not configured");
  return new Response(
    JSON.stringify({ error: "Email service configuration error. Please contact support." }),
    { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Sanitize API key: trim whitespace and validate format
const sanitizedApiKey = RESEND_API_KEY.trim();
if (!sanitizedApiKey.startsWith('re_')) {
  console.error("CRITICAL: RESEND_API_KEY format invalid (should start with 're_')");
  console.error("API key first 10 chars:", sanitizedApiKey.substring(0, 10));
  return new Response(
    JSON.stringify({ error: "Email service configuration error. Please contact support." }),
    { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Log API key info (for debugging, not full key)
console.log("API key configured:", {
  present: true,
  length: sanitizedApiKey.length,
  startsWith: sanitizedApiKey.substring(0, 3),
  format: "valid"
});
```

#### Change 2: Add Diagnostic Logging Before API Call (Line 598-618)
```typescript
// Log request details for debugging
console.log("Resend API request details:", {
  url: 'https://api.resend.com/emails',
  method: 'POST',
  hasApiKey: !!sanitizedApiKey,
  apiKeyLength: sanitizedApiKey.length,
  from: 'Mindmaker Leads <leads@themindmaker.ai>',
  to: ['krish@themindmaker.ai'],
  subjectLength: `🎯 Lead: ${name} from ${companyResearch.companyName} - ${sessionTypeLabel}`.length
});
```

#### Change 3: Test Without Timeout Wrapper (Line 601)
**Option A**: Temporarily use regular fetch
```typescript
const emailResponse = await fetch(
  'https://api.resend.com/emails',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sanitizedApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Mindmaker Leads <leads@themindmaker.ai>',
      to: ['krish@themindmaker.ai'],
      reply_to: email,
      subject: `🎯 Lead: ${name} from ${companyResearch.companyName} - ${sessionTypeLabel}`,
      html: emailHtml,
    }),
  }
);
```

**Option B**: Fix timeout wrapper to not interfere
- Ensure signal doesn't affect headers
- Or use timeout differently

#### Change 4: Enhanced Error Logging (Line 620-623)
```typescript
if (!emailResponse.ok) {
  const errorText = await emailResponse.text();
  console.error("Resend API error details:", {
    status: emailResponse.status,
    statusText: emailResponse.statusText,
    errorBody: errorText,
    attempt: attempt,
    headers: Object.fromEntries(emailResponse.headers.entries())
  });
  lastError = new Error(`Resend API error (${emailResponse.status}): ${errorText}`);
  // ... rest of error handling
}
```

---

## PHASE 4: Verification Steps

### CP1: Diagnostic Logging
- [ ] API key logged (first 3 chars + length)
- [ ] API key format validated
- [ ] Request details logged
- [ ] Full error response logged

### CP2: Test Without Timeout
- [ ] Replace fetchWithTimeout with regular fetch
- [ ] Run test script
- [ ] Compare results
- [ ] Identify if timeout wrapper is issue

### CP3: API Key Sanitization
- [ ] Key is trimmed
- [ ] Key format validated
- [ ] Invalid format caught early

### CP4: Compare with Working Function
- [ ] Exact header format matches
- [ ] Exact request body format matches
- [ ] No differences except timeout wrapper

---

## FILES TO MODIFY

1. `supabase/functions/send-lead-email/index.ts`
   - Line 130-137: Add API key sanitization
   - Line 598-618: Add diagnostic logging
   - Line 601: Test without timeout wrapper OR fix timeout wrapper
   - Line 620-623: Enhanced error logging

---

## ROOT CAUSE HYPOTHESIS (Ranked by Probability)

1. **AbortController Signal Interference** (90% confidence)
   - Working functions use regular fetch
   - Failing function uses fetchWithTimeout with signal
   - Signal may interfere with authentication

2. **API Key Not Trimmed** (60% confidence)
   - Secret may have whitespace
   - Need to trim before use

3. **Edge Function Not Redeployed** (40% confidence)
   - Code changes pushed but function not restarted
   - Old code still running

4. **Secret Caching** (20% confidence)
   - Supabase caches secrets
   - Function needs restart

---

## NEXT STEPS

1. Add diagnostic logging (see Change 1 & 2)
2. Test without timeout wrapper (see Change 3)
3. Deploy and run test script
4. Analyze logs to identify root cause
5. Implement permanent fix based on findings
