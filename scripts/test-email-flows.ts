/**
 * Email Flow Test Script
 * 
 * This script tests all CTA paths by sending test emails through the send-lead-email edge function.
 * Each test scenario represents a different user flow and CTA path.
 * 
 * Usage:
 *   deno run --allow-net --allow-env scripts/test-email-flows.ts
 * 
 * Or via Supabase CLI:
 *   supabase functions invoke send-lead-email --body '{"name":"Krish Raja","email":"krish@tesla.com",...}'
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Test scenarios covering all CTA paths
const testScenarios = [
  {
    id: 1,
    name: "Main Page - Book Your Initial Consult (Bottom)",
    description: "User clicks 'Book Your Initial Consult' at bottom of main page",
    source: "initial-consult",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "CEO",
      selectedProgram: "not-sure",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 120,
        scrollDepth: 75,
      },
    },
  },
  {
    id: 2,
    name: "Navigation - Book Session (Top Nav)",
    description: "User clicks 'Book Session' button in top navigation",
    source: "navigation",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Executive Director",
      selectedProgram: "not-sure",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 45,
        scrollDepth: 20,
      },
    },
  },
  {
    id: 3,
    name: "ProductLadder - Individual Build 1hr",
    description: "User selects Individual → Build → 1hr commitment on main page",
    source: "product-ladder",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "CTO",
      selectedProgram: "build",
      commitmentLevel: "1hr",
      audienceType: "individual",
      pathType: "build",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 180,
        scrollDepth: 90,
      },
    },
  },
  {
    id: 4,
    name: "ProductLadder - Individual Orchestrate 4wk",
    description: "User selects Individual → Orchestrate → 4wk commitment on main page",
    source: "product-ladder",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "CFO",
      selectedProgram: "orchestrate",
      commitmentLevel: "4wk",
      audienceType: "individual",
      pathType: "orchestrate",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 240,
        scrollDepth: 85,
      },
    },
  },
  {
    id: 5,
    name: "ProductLadder - Individual Build 90d",
    description: "User selects Individual → Build → 90d commitment on main page",
    source: "product-ladder",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "VP Product",
      selectedProgram: "build",
      commitmentLevel: "90d",
      audienceType: "individual",
      pathType: "build",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 300,
        scrollDepth: 95,
      },
    },
  },
  {
    id: 6,
    name: "ProductLadder - Team 3hr",
    description: "User selects Team → 3hr commitment on main page",
    source: "product-ladder",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "VP Engineering",
      selectedProgram: "team",
      commitmentLevel: "3hr",
      audienceType: "team",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 200,
        scrollDepth: 80,
      },
    },
  },
  {
    id: 7,
    name: "ProductLadder - Team 4wk",
    description: "User selects Team → 4wk commitment on main page",
    source: "product-ladder",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Chief Operating Officer",
      selectedProgram: "team",
      commitmentLevel: "4wk",
      audienceType: "team",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 280,
        scrollDepth: 88,
      },
    },
  },
  {
    id: 8,
    name: "ProductLadder - Team 90d",
    description: "User selects Team → 90d commitment on main page",
    source: "product-ladder",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Chief Strategy Officer",
      selectedProgram: "team",
      commitmentLevel: "90d",
      audienceType: "team",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 350,
        scrollDepth: 92,
      },
    },
  },
  {
    id: 9,
    name: "Individual Page - Build 1hr",
    description: "User on /individual page, selects Build → 1hr, clicks CTA",
    source: "individual-page",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Product Manager",
      selectedProgram: "build",
      commitmentLevel: "1hr",
      audienceType: "individual",
      pathType: "build",
      sessionData: {
        pagesVisited: ["/", "/individual"],
        timeOnSite: 150,
        scrollDepth: 60,
      },
    },
  },
  {
    id: 10,
    name: "Individual Page - Build 4wk",
    description: "User on /individual page, selects Build → 4wk, clicks CTA",
    source: "individual-page",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Senior Product Manager",
      selectedProgram: "build",
      commitmentLevel: "4wk",
      audienceType: "individual",
      pathType: "build",
      sessionData: {
        pagesVisited: ["/", "/individual"],
        timeOnSite: 220,
        scrollDepth: 70,
      },
    },
  },
  {
    id: 11,
    name: "Individual Page - Orchestrate 90d",
    description: "User on /individual page, selects Orchestrate → 90d, clicks CTA",
    source: "individual-page",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Board Member",
      selectedProgram: "orchestrate",
      commitmentLevel: "90d",
      audienceType: "individual",
      pathType: "orchestrate",
      sessionData: {
        pagesVisited: ["/", "/individual"],
        timeOnSite: 380,
        scrollDepth: 85,
      },
    },
  },
  {
    id: 12,
    name: "Team Page - 3hr",
    description: "User on /team page, selects 3hr, clicks CTA",
    source: "team-page",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Head of Engineering",
      selectedProgram: "team",
      commitmentLevel: "3hr",
      audienceType: "team",
      sessionData: {
        pagesVisited: ["/", "/team"],
        timeOnSite: 160,
        scrollDepth: 55,
      },
    },
  },
  {
    id: 13,
    name: "Team Page - 4wk",
    description: "User on /team page, selects 4wk, clicks CTA",
    source: "team-page",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "VP Operations",
      selectedProgram: "team",
      commitmentLevel: "4wk",
      audienceType: "team",
      sessionData: {
        pagesVisited: ["/", "/team"],
        timeOnSite: 250,
        scrollDepth: 75,
      },
    },
  },
  {
    id: 14,
    name: "Team Page - 90d",
    description: "User on /team page, selects 90d, clicks CTA",
    source: "team-page",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Chief Technology Officer",
      selectedProgram: "team",
      commitmentLevel: "90d",
      audienceType: "team",
      sessionData: {
        pagesVisited: ["/", "/team"],
        timeOnSite: 420,
        scrollDepth: 90,
      },
    },
  },
  {
    id: 15,
    name: "ConsultationBooking Component",
    description: "User uses ConsultationBooking component (e.g., on BuilderSprint page)",
    source: "consultation-booking",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Founder",
      selectedProgram: "builder-sprint",
      sessionData: {
        pagesVisited: ["/", "/builder-sprint"],
        timeOnSite: 200,
        scrollDepth: 65,
      },
    },
  },
  {
    id: 16,
    name: "FloatingBookCTA (Mobile)",
    description: "User clicks floating CTA on mobile after scrolling",
    source: "floating-cta",
    body: {
      name: "Krish Raja",
      email: "krish@tesla.com",
      jobTitle: "Mobile User",
      selectedProgram: "not-sure",
      sessionData: {
        pagesVisited: ["/"],
        timeOnSite: 180,
        scrollDepth: 50,
      },
    },
  },
];

async function testEmailFlow(
  supabaseUrl: string,
  supabaseAnonKey: string,
  scenario: typeof testScenarios[0]
) {
  try {
    console.log(`\n[${scenario.id}] Testing: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    console.log(`   Source: ${scenario.source}`);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.functions.invoke('send-lead-email', {
      body: scenario.body,
    });
    
    if (error) {
      console.error(`   ❌ ERROR:`, error);
      return { success: false, error };
    }
    
    console.log(`   ✅ SUCCESS: Email sent`);
    console.log(`   Response:`, data);
    return { success: true, data };
    
  } catch (err) {
    console.error(`   ❌ EXCEPTION:`, err);
    return { success: false, error: err };
  }
}

async function runAllTests() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://your-project.supabase.co';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 'your-anon-key';
  
  console.log('='.repeat(80));
  console.log('EMAIL FLOW TEST SUITE');
  console.log('='.repeat(80));
  console.log(`Total scenarios: ${testScenarios.length}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log('='.repeat(80));
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const result = await testEmailFlow(supabaseUrl, supabaseAnonKey, scenario);
    results.push({ scenario, result });
    
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  
  console.log(`✅ Successful: ${successful}/${testScenarios.length}`);
  console.log(`❌ Failed: ${failed}/${testScenarios.length}`);
  
  if (failed > 0) {
    console.log('\nFailed scenarios:');
    results
      .filter(r => !r.result.success)
      .forEach(r => {
        console.log(`  - [${r.scenario.id}] ${r.scenario.name}`);
        console.log(`    Error: ${r.result.error}`);
      });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('EXPECTED EMAILS');
  console.log('='.repeat(80));
  console.log(`You should receive ${testScenarios.length} emails at krish@themindmaker.ai`);
  console.log('Each email subject will indicate which CTA path was tested.');
  console.log('Verify that:');
  console.log('  1. Company research works for tesla.com domain');
  console.log('  2. Commitment levels are correctly displayed');
  console.log('  3. Audience types and path types are captured');
  console.log('  4. Session data is included');
  console.log('='.repeat(80));
  
  return results;
}

// Run tests if executed directly
if (import.meta.main) {
  runAllTests().catch(console.error);
}
