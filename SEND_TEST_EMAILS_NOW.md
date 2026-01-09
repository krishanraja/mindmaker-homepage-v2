# Send All Test Emails - Quick Instructions

## Option 1: Use the Test Page (Recommended)

1. Open your browser and navigate to: `https://www.themindmaker.ai/test-email-flows.html`
2. Open browser DevTools Console (F12)
3. Paste this code to set your Supabase credentials:

```javascript
window.SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., https://xxxxx.supabase.co
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

4. Refresh the page - it will auto-send all 16 test emails

## Option 2: Use Node.js Script

Run this in your terminal (make sure you have the Supabase URL and key):

```bash
node scripts/send-test-emails-node.js
```

## Option 3: Manual Testing

Test each CTA path manually on the live site:
- Main page bottom CTA
- Navigation "Book Session" button  
- Product Ladder - all 6 combinations (Individual Build/Orchestrate × 1hr/4wk/90d, Team × 3hr/4wk/90d)
- Individual page CTAs
- Team page CTAs

Each will send an email to krish@themindmaker.ai

## Expected Results

You should receive 16 emails total:
1. Main Page - Book Your Initial Consult (Bottom)
2. Navigation - Book Session (Top Nav)
3. Product Ladder - Individual Build 1hr
4. Product Ladder - Individual Orchestrate 4wk
5. Product Ladder - Individual Build 90d
6. Product Ladder - Team 3hr
7. Product Ladder - Team 4wk
8. Product Ladder - Team 90d
9. Individual Page - Build 1hr
10. Individual Page - Build 4wk
11. Individual Page - Orchestrate 90d
12. Team Page - 3hr
13. Team Page - 4wk
14. Team Page - 90d
15. ConsultationBooking Component
16. Builder Assessment / Friction Map / Portfolio Builder CTAs

Each email should include:
- Company research for tesla.com
- Commitment level (when applicable)
- Audience type and path type
- Session engagement data
