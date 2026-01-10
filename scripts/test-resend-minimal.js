/**
 * Minimal Resend API Test
 * Simplest possible test to isolate the issue
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("Set RESEND_API_KEY environment variable");
  process.exit(1);
}

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
.then(text => {
  console.log('Status:', r.status);
  console.log('Response:', text);
})
.catch(console.error);
