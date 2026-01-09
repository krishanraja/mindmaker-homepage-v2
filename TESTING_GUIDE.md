# Testing Guide - Lead Capture & Calendly Flow Fixes

## Implementation Summary

All fixes have been implemented:

1. ✅ **Database Migration**: Created `leads` table for persistent lead storage
2. ✅ **Edge Function**: Added database insert before email send
3. ✅ **Calendly Utility**: Added script wait mechanism, commitmentLevel support, better error handling
4. ✅ **Frontend Components**: Updated error handling, commitmentLevel passing
5. ✅ **Email Utility**: Returns error status instead of swallowing errors

## Testing Checklist

### Prerequisites
- Ensure Supabase environment variables are set:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `GOOGLE_AI_API_KEY`

### Test Scenarios

#### 1. Main Page - "Book Your Initial Consult" (Bottom of Page)
- **Location**: Scroll to bottom of main page
- **Action**: Click "Book Your Initial Consult"
- **Expected**:
  - Modal opens
  - Fill form (name: "Krish Raja", email: "krish@tesla.com", job title: "CEO")
  - Submit
  - Email sent to krish@themindmaker.ai
  - Lead saved to database
  - Calendly opens with name/email pre-filled
  - commitmentLevel NOT in URL (not selected)

#### 2. Main Page - "Book Session" (Top Navigation)
- **Location**: Top right navigation
- **Action**: Click "Book Session"
- **Expected**: Same as Test 1

#### 3. Product Ladder - Individual → Build → 1 Hour
- **Location**: Main page, "Who is this for?" section
- **Action**: 
  - Select "Individual"
  - Select "Build with AI"
  - Set slider to 1 Hour (leftmost)
  - Click "Book a Session"
- **Expected**:
  - Modal opens with path pre-selected
  - Fill form (name: "Krish Raja", email: "krish@tesla.com", job title: "CTO")
  - Submit
  - Email sent with commitmentLevel="1hr", audienceType="individual", pathType="build"
  - Lead saved to database
  - Calendly opens with commitmentLevel in URL (a2 parameter)

#### 4. Product Ladder - Individual → Orchestrate → 4 Week
- **Location**: Main page, "Who is this for?" section
- **Action**:
  - Select "Individual"
  - Select "Orchestrate AI"
  - Set slider to 4 Week (middle)
  - Click "Book a Session"
- **Expected**:
  - Modal opens with path pre-selected
  - Fill form and submit
  - Email sent with commitmentLevel="4wk", audienceType="individual", pathType="orchestrate"
  - Calendly opens with commitmentLevel in URL

#### 5. Product Ladder - Individual → Build → 90 Day
- **Location**: Main page, "Who is this for?" section
- **Action**:
  - Select "Individual"
  - Select "Build with AI"
  - Set slider to 90 Day (rightmost)
  - Click "Book a Session"
- **Expected**:
  - Email sent with commitmentLevel="90d"
  - Calendly opens with commitmentLevel in URL

#### 6. Product Ladder - Team → 3 Hour
- **Location**: Main page, "Who is this for?" section
- **Action**:
  - Select "Team"
  - Set slider to 3 Hour (leftmost)
  - Click "Book a Session"
- **Expected**:
  - Email sent with commitmentLevel="3hr", audienceType="team"
  - Calendly opens with commitmentLevel in URL

#### 7. Product Ladder - Team → 4 Week
- **Location**: Main page, "Who is this for?" section
- **Action**:
  - Select "Team"
  - Set slider to 4 Week (middle)
  - Click "Book a Session"
- **Expected**: Email sent with commitmentLevel="4wk"

#### 8. Product Ladder - Team → 90 Day
- **Location**: Main page, "Who is this for?" section
- **Action**:
  - Select "Team"
  - Set slider to 90 Day (rightmost)
  - Click "Book a Session"
- **Expected**: Email sent with commitmentLevel="90d"

#### 9. Individual Page - "Book Your Session" (Sticky CTA)
- **Location**: `/individual` page, bottom sticky CTA
- **Action**: 
  - Navigate to `/individual?path=build&commitment=1hr`
  - Click "Book Your Session"
- **Expected**:
  - Modal opens with path="build", commitmentLevel="1hr", audienceType="individual"
  - Email sent with correct context
  - Calendly opens with commitmentLevel in URL

#### 10. Individual Page - Navigation "Book Session"
- **Location**: `/individual` page, top navigation
- **Action**: Click "Book Session" in nav
- **Expected**: Same as Test 9

#### 11. Team Page - "Book Your Session" (Sticky CTA)
- **Location**: `/team` page, bottom sticky CTA
- **Action**:
  - Navigate to `/team?commitment=4wk`
  - Click "Book Your Session"
- **Expected**:
  - Modal opens with commitmentLevel="4wk", audienceType="team"
  - Email sent with correct context
  - Calendly opens with commitmentLevel in URL

#### 12. Team Page - Navigation "Book Session"
- **Location**: `/team` page, top navigation
- **Action**: Click "Book Session" in nav
- **Expected**: Same as Test 11

#### 13. ConsultationBooking Component
- **Location**: Anywhere ConsultationBooking is used
- **Action**: Fill form and submit
- **Expected**: Email sent, Calendly opens

#### 14. Error Scenario - Email API Failure
- **Action**: Temporarily break email API (or use invalid key)
- **Expected**:
  - User sees error toast: "Email notification failed"
  - User still proceeds to Calendly
  - Lead still saved to database (if DB works)

#### 15. Error Scenario - Calendly Script Not Loaded
- **Action**: Block Calendly script in DevTools Network tab
- **Expected**:
  - System waits up to 5 seconds for script
  - Falls back to direct navigation (window.location.href)
  - Calendly still opens

#### 16. Error Scenario - Popup Blocker
- **Action**: Enable popup blocker in browser
- **Expected**:
  - System detects popup blocked
  - Falls back to direct navigation
  - Calendly opens in same tab

## Database Verification

After each test, verify in Supabase:

```sql
SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;
```

Check:
- ✅ All fields populated correctly
- ✅ commitmentLevel matches test input
- ✅ audienceType matches test input
- ✅ pathType matches test input (for individual)
- ✅ company_research populated (for non-personal emails)
- ✅ engagement_score calculated
- ✅ email_sent = true after email sent
- ✅ email_sent_at timestamp set

## Email Verification

Check inbox at `krish@themindmaker.ai` for each test:
- ✅ Email received
- ✅ Subject includes company name and session type
- ✅ Commitment level prominently displayed
- ✅ Company research included (for tesla.com)
- ✅ All session data included
- ✅ Brand colors used correctly
- ✅ AI-readable structure present

## Calendly Verification

For each test with commitmentLevel:
- ✅ Open browser DevTools → Network tab
- ✅ Check Calendly URL contains `a2=` parameter
- ✅ Verify `a2` value matches commitmentLevel (e.g., "1hr", "4wk", "90d")
- ✅ Verify name and email pre-filled
- ✅ Verify Calendly popup/widget opens OR direct navigation works

## Browser Console Checks

Open DevTools Console for each test:
- ✅ No errors in console
- ✅ "Lead saved to database: [UUID]" logged (if DB works)
- ✅ "Email sent successfully" logged
- ✅ No "Calendly widget error" messages
- ✅ No "Supabase credentials not available" warnings (if env vars set)

## Mobile Testing

Test on mobile viewport (DevTools → Toggle device toolbar):
- ✅ Modal opens as Drawer (not Dialog)
- ✅ Form fields accessible
- ✅ Submit button works
- ✅ Calendly opens correctly
- ✅ FloatingBookCTA appears on Individual/Team pages

## Performance Testing

- ✅ Calendly script wait doesn't block UI (max 5s)
- ✅ Email send doesn't block Calendly opening
- ✅ Database insert doesn't block email send
- ✅ No noticeable delays in user flow

## Success Criteria

All tests pass if:
1. ✅ All 16 CTA paths send emails
2. ✅ All emails received at krish@themindmaker.ai
3. ✅ All leads saved to database
4. ✅ Calendly opens for all tests
5. ✅ commitmentLevel in Calendly URL when provided
6. ✅ No silent failures
7. ✅ Users informed of all errors
8. ✅ Company research works for tesla.com

## Known Issues to Watch For

1. **Database Insert Fails**: If `SUPABASE_SERVICE_ROLE_KEY` not set, database insert skipped but email still sent
2. **Calendly Script Timeout**: If script takes >5s, falls back to direct navigation
3. **Popup Blocker**: Modern browsers may block popups, system falls back to direct navigation

## Next Steps After Testing

1. If all tests pass: Commit and push to main
2. If any failures: Document in issues, fix, retest
3. Monitor Supabase logs for any errors
4. Monitor email delivery rates
