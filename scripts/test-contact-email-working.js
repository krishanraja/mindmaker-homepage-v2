/**
 * Test the working send-contact-email function
 * This helps verify if the issue is specific to send-lead-email
 * 
 * Usage: $env:VITE_SUPABASE_URL = "https://..."; $env:VITE_SUPABASE_PUBLISHABLE_KEY = "..." ; node scripts/test-contact-email-working.js
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  process.exit(1);
}

console.log("🔍 Testing working function: send-contact-email\n");
console.log(`Supabase URL: ${SUPABASE_URL}\n`);

async function testContactEmail() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-contact-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test to verify the working function still works'
      }),
    });

    const responseText = await response.text();
    
    console.log("Response Status:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error("\n❌ Error:");
      console.error(responseText);
      return;
    }

    const data = JSON.parse(responseText);
    console.log("\n✅ Success!");
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("\n📬 If this works, the API key is valid and the issue is specific to send-lead-email");
    
  } catch (error) {
    console.error("\n❌ Exception:", error);
  }
}

testContactEmail();
