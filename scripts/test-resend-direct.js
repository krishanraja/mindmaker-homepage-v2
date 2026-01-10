/**
 * Direct Resend API Test
 * Bypasses edge function to test API key directly
 * 
 * Usage: $env:RESEND_API_KEY = "your-key"; node scripts/test-resend-direct.js
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("❌ Error: RESEND_API_KEY must be set as environment variable");
  console.error("Usage: $env:RESEND_API_KEY = 'your-key'; node scripts/test-resend-direct.js");
  process.exit(1);
}

const sanitizedKey = RESEND_API_KEY.trim();

console.log("🔍 Testing Resend API Key Directly...\n");
console.log("API Key Info:");
console.log(`  - Present: ${!!sanitizedKey}`);
console.log(`  - Length: ${sanitizedKey.length}`);
console.log(`  - Starts with: ${sanitizedKey.substring(0, 5)}...`);
console.log(`  - Format valid: ${sanitizedKey.startsWith('re_')}\n`);

if (!sanitizedKey.startsWith('re_')) {
  console.error("❌ API key format invalid - should start with 're_'");
  process.exit(1);
}

async function testResend() {
  try {
    console.log("📧 Sending test email...\n");
    
    const requestBody = {
      from: 'Mindmaker Leads <leads@themindmaker.ai>',
      to: ['krish@themindmaker.ai'],
      subject: 'Test Email - Direct API Call',
      html: `
        <h1>Direct API Test</h1>
        <p>This email was sent directly via Resend API, bypassing the edge function.</p>
        <p>If you receive this, the API key is valid and the issue is in the edge function.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    };

    console.log("Request Details:");
    console.log(`  - URL: https://api.resend.com/emails`);
    console.log(`  - Method: POST`);
    console.log(`  - From: ${requestBody.from}`);
    console.log(`  - To: ${requestBody.to.join(', ')}`);
    console.log(`  - Subject: ${requestBody.subject}\n`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sanitizedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response Status:", response.status, response.statusText);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("\n❌ Error Response:");
      console.error(responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        console.error("\nParsed Error:");
        console.error(JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // Not JSON, that's fine
      }
      
      return;
    }

    const data = JSON.parse(responseText);
    console.log("\n✅ Success!");
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("\n📬 Check your inbox at krish@themindmaker.ai");
    
  } catch (error) {
    console.error("\n❌ Exception:", error);
    console.error("Stack:", error.stack);
  }
}

testResend();
