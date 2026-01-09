# Email Flow Testing Guide

This document explains how to test all CTA paths to verify email functionality.

## Test Scenarios

The following 16 scenarios cover all CTA paths in the application:

1. **Main Page - Book Your Initial Consult (Bottom)** - Initial consult button at bottom of main page
2. **Navigation - Book Session (Top Nav)** - Book Session button in top navigation
3. **ProductLadder - Individual Build 1hr** - Individual → Build → 1hr commitment
4. **ProductLadder - Individual Orchestrate 4wk** - Individual → Orchestrate → 4wk commitment
5. **ProductLadder - Individual Build 90d** - Individual → Build → 90d commitment
6. **ProductLadder - Team 3hr** - Team → 3hr commitment
7. **ProductLadder - Team 4wk** - Team → 4wk commitment
8. **ProductLadder - Team 90d** - Team → 90d commitment
9. **Individual Page - Build 1hr** - /individual page, Build → 1hr
10. **Individual Page - Build 4wk** - /individual page, Build → 4wk
11. **Individual Page - Orchestrate 90d** - /individual page, Orchestrate → 90d
12. **Team Page - 3hr** - /team page, 3hr commitment
13. **Team Page - 4wk** - /team page, 4wk commitment
14. **Team Page - 90d** - /team page, 90d commitment
15. **ConsultationBooking Component** - ConsultationBooking component usage
16. **FloatingBookCTA (Mobile)** - Floating CTA on mobile

## Testing Methods

### Method 1: Browser Test Page

1. Open `public/test-email-flows.html` in your browser
2. Update the Supabase credentials in the script section:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
3. Click each "Send Test Email" button
4. Verify emails are received at krish@themindmaker.ai

### Method 2: Manual Testing via Application

Test each CTA path manually:

1. **Main Page Initial Consult**: Navigate to `/`, scroll to bottom, click "Book Your Initial Consult"
2. **Navigation Book Session**: Click "Book Session" in top navigation
3. **ProductLadder Individual Build 1hr**: Navigate to `/`, scroll to "Who is this for", select Individual → Build → 1hr, click CTA
4. Continue for all scenarios...

### Method 3: Direct Edge Function Invocation

Use Supabase CLI or dashboard to invoke the edge function directly:

```bash
supabase functions invoke send-lead-email \
  --body '{
    "name": "Krish Raja",
    "email": "krish@tesla.com",
    "jobTitle": "CEO",
    "selectedProgram": "not-sure",
    "sessionData": {
      "pagesVisited": ["/"],
      "timeOnSite": 120,
      "scrollDepth": 75
    }
  }'
```

## Verification Checklist

For each email received, verify:

- [ ] Email subject includes correct lead name and company
- [ ] Company research section shows Tesla information (for tesla.com domain)
- [ ] Commitment level is correctly displayed (if applicable)
- [ ] Audience type is correct (individual/team)
- [ ] Path type is correct (build/orchestrate, if applicable)
- [ ] Session data is included
- [ ] Engagement score is calculated
- [ ] Email is formatted correctly with brand colors
- [ ] AI-agent readable markers are present in HTML

## Expected Results

- **Total Emails**: 16 (one for each test scenario)
- **Company Research**: Should show Tesla company information for tesla.com domain
- **All Context Preserved**: Commitment levels, audience types, path types should all be captured
- **Email Quality**: Professional formatting, brand colors, clear structure

## Troubleshooting

If emails are not received:

1. Check Supabase edge function logs
2. Verify RESEND_API_KEY is set correctly
3. Verify GOOGLE_AI_API_KEY is set (for company research)
4. Check spam folder
5. Verify email address: krish@themindmaker.ai
