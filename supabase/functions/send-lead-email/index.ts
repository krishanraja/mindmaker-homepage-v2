/**
 * @file send-lead-email Edge Function
 * @description Processes lead submissions with AI-powered company research and sends
 *              enriched lead notification emails via Resend with retry logic.
 * @dependencies Resend API, Google AI (Gemini) API
 * @secrets RESEND_API_KEY, GOOGLE_AI_API_KEY
 * 
 * Request:
 *   POST { name, email, jobTitle, selectedProgram, commitmentLevel, audienceType, pathType, sessionData }
 * 
 * Response:
 *   { success: true } or { error: string }
 * 
 * Features:
 *   - Company research via Gemini with Google Search grounding (skipped for personal email domains)
 *   - Structured output for reliable parsing
 *   - Exponential backoff retry (3 attempts)
 *   - Session engagement data included in email
 *   - Commitment level prominently displayed
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger, extractRequestContext } from '../_shared/logger.ts';
import { fetchWithTimeout } from '../_shared/timeout.ts';
import { extractDomain, validateEnvVars, ensureString } from '../_shared/validation.ts';

// Validate required environment variables at startup
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const googleAIApiKey = Deno.env.get("GOOGLE_AI_API_KEY");

const envValidation = validateEnvVars({
  RESEND_API_KEY: RESEND_API_KEY,
});

if (!envValidation.isValid) {
  console.error("CRITICAL: Missing required environment variables:", envValidation.missing);
  // Don't throw here - we'll handle it in the handler to return proper error response
}

// Initialize Supabase client for database operations
// In Supabase Edge Functions, these are available via environment variables
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY should be set in Supabase dashboard
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not available - database insert will be skipped");
    console.warn("Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML escape helper to prevent XSS in email content
const escapeHtml = (str: string | undefined | null): string => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Input validation schemas
const sessionDataSchema = z.object({
  frictionMap: z.object({
    problem: z.string().max(1000),
    timeSaved: z.number(),
    toolRecommendations: z.array(z.string()),
    generatedAt: z.string(),
  }).optional(),
  portfolioBuilder: z.object({
    selectedTasks: z.array(z.object({
      name: z.string(),
      hours: z.number(),
      savings: z.number(),
    })),
    totalTimeSaved: z.number(),
    totalCostSavings: z.number(),
  }).optional(),
  assessment: z.object({
    profileType: z.string(),
    profileDescription: z.string(),
    recommendedProduct: z.string(),
  }).optional(),
  tryItWidget: z.object({
    challenges: z.array(z.object({
      input: z.string(),
      response: z.string(),
      timestamp: z.string(),
    })),
  }).optional(),
  pagesVisited: z.array(z.string()).default([]),
  timeOnSite: z.number().default(0),
  scrollDepth: z.number().default(0),
});

const leadRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  jobTitle: z.string().max(100, "Job title too long").default(""),
  selectedProgram: z.string().max(50).default("not-sure"),
  commitmentLevel: z.string().max(20).optional(), // e.g., "1hr", "3hr", "4wk", "90d"
  audienceType: z.string().max(20).optional(), // "individual" or "team"
  pathType: z.string().max(20).optional(), // "build" or "orchestrate" (for individual)
  sessionData: sessionDataSchema.default({
    pagesVisited: [],
    timeOnSite: 0,
    scrollDepth: 0,
  }),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const body = await req.json();
    
    // Validate input
    const parseResult = leadRequestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation failed:", parseResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.flatten().fieldErrors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const { name, email, jobTitle, selectedProgram, commitmentLevel, audienceType, pathType, sessionData } = parseResult.data;
    console.log("Processing lead:", { name, email, jobTitle, commitmentLevel, audienceType, pathType });

    // Safely extract domain from email
    const domain = extractDomain(email);
    if (!domain) {
      console.error("Invalid email format - cannot extract domain:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Calculate engagement score early (needed for database insert)
    const engagementFactors = [
      sessionData.frictionMap ? 25 : 0,
      sessionData.portfolioBuilder && sessionData.portfolioBuilder.selectedTasks.length > 0 ? 25 : 0,
      sessionData.assessment ? 20 : 0,
      sessionData.tryItWidget && sessionData.tryItWidget.challenges.length > 0 ? 15 : 0,
      Math.min(sessionData.timeOnSite / 180 * 10, 10), // Max 10 points for 3+ min
      Math.min(sessionData.scrollDepth / 100 * 5, 5), // Max 5 points for 100% scroll
    ];
    const engagementScore = Math.round(engagementFactors.reduce((a, b) => a + b, 0));
    
    // Research company using Gemini with Google Search grounding
    // Ensure companyName is always a string (never undefined)
    let companyResearch = {
      companyName: ensureString(domain, "Unknown Company"),
      industry: "Unknown",
      companySize: "unknown",
      latestNews: "Unable to verify company information",
      suggestedScope: "Discovery call to understand specific needs",
      confidence: "low"
    };

    // Personal email domains to skip
    const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "me.com", "protonmail.com", "aol.com"];
    const isPersonalEmail = personalDomains.some(pd => domain.toLowerCase().includes(pd));

    if (googleAIApiKey && domain && !isPersonalEmail) {
      try {
        const researchPrompt = `You are a business research assistant. Research the company associated with the email domain "${domain}" and the person's job title "${jobTitle}".

Please provide the following information:
1. The actual company name (not just the domain)
2. The industry/sector they operate in
3. Company size category: startup (1-50 employees), smb (51-500), mid-market (501-5000), enterprise (5000+), or unknown
4. Their most recent significant business news from the past 6 months (acquisition, funding round, product launch, leadership change, expansion, partnership, etc.). If no recent news found, say "No recent significant news found"
5. Based on their interest in "${selectedProgram}" and commitment level "${commitmentLevel || 'not specified'}", suggest a one-sentence scope of work that would be relevant to their business needs

IMPORTANT: Use Google Search to find current, accurate information. If you cannot find reliable information, explicitly state "Unable to verify" rather than making assumptions.

Format your response as a JSON object with these exact keys:
{
  "companyName": "string",
  "industry": "string",
  "companySize": "startup|smb|mid-market|enterprise|unknown",
  "latestNews": "string (one sentence)",
  "suggestedScope": "string (one sentence)",
  "confidence": "high|medium|low"
}`;

        // Use timeout wrapper for Gemini API (30 second timeout)
        const response = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${googleAIApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: researchPrompt
                }]
              }],
              tools: [{
                googleSearchRetrieval: {} // Enable Google Search grounding
              }],
              generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              }
            }),
          },
          30000 // 30 second timeout
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Gemini API error:", errorText);
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Gemini research response:", JSON.stringify(data, null, 2));

        // Extract text from Gemini response
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (responseText) {
          // Try to extract JSON from the response (handle code blocks or plain JSON)
          let jsonText = responseText;
          
          // Remove markdown code blocks if present
          jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          
          // Try to find JSON object
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              companyResearch = {
                companyName: ensureString(parsed.companyName, domain || "Unknown Company"),
                industry: ensureString(parsed.industry, "Unknown"),
                companySize: ensureString(parsed.companySize, "unknown"),
                latestNews: ensureString(parsed.latestNews, "Unable to verify company information"),
                suggestedScope: ensureString(parsed.suggestedScope, "Discovery call to understand specific needs"),
                confidence: ensureString(parsed.confidence, "low")
              };
              console.log("Successfully parsed company research:", companyResearch);
            } catch (parseError) {
              console.error("Failed to parse Gemini JSON response:", parseError);
              console.error("Response text:", responseText);
              // Try to extract information from text if JSON parsing fails
              const companyMatch = responseText.match(/companyName["\s:]+"([^"]+)"/i) || 
                                  responseText.match(/company["\s:]+"([^"]+)"/i) ||
                                  responseText.match(/company["\s:]+([A-Z][^,\.\n]+)/i);
              if (companyMatch && companyMatch[1]) {
                companyResearch.companyName = ensureString(companyMatch[1].trim(), domain || "Unknown Company");
                console.log("Extracted company name from text:", companyResearch.companyName);
              }
            }
          } else {
            console.warn("No JSON object found in Gemini response");
            // Try basic text extraction
            const companyMatch = responseText.match(/(?:company|companyName)[\s:]+([A-Z][^,\.\n]+)/i);
            if (companyMatch && companyMatch[1]) {
              companyResearch.companyName = ensureString(companyMatch[1].trim(), domain || "Unknown Company");
            }
          }
        } else {
          console.warn("Empty response from Gemini API");
        }
      } catch (error) {
        console.error("Error researching company with Gemini:", error);
      }
    }

    // Build comprehensive email
    const programLabels: Record<string, string> = {
      "for-you": "For You (Individual)",
      "for-team": "For Your Leadership Team",
      "for-portfolio": "For Your Business Portfolio",
      "not-sure": "Not sure yet",
      "build": "Build with AI",
      "orchestrate": "Orchestrate AI",
      "team": "Team Alignment",
      "individual": "Individual",
    };

    // Commitment level labels
    const commitmentLabels: Record<string, string> = {
      "1hr": "1 Hour Session",
      "3hr": "3 Hour Session",
      "4wk": "4 Week Program",
      "90d": "90 Day Program",
    };

    // Build session type label - ensure it's never undefined
    let sessionTypeLabel = programLabels[selectedProgram] || selectedProgram || "Not specified";
    if (audienceType === "individual" && pathType) {
      const pathLabel = programLabels[pathType] || pathType || "Individual";
      const commitmentLabel = commitmentLevel ? (commitmentLabels[commitmentLevel] || commitmentLevel) : "Not specified";
      sessionTypeLabel = `${pathLabel} - ${commitmentLabel}`;
    } else if (audienceType === "team") {
      const commitmentLabel = commitmentLevel ? (commitmentLabels[commitmentLevel] || commitmentLevel) : "Not specified";
      sessionTypeLabel = `Team Alignment - ${commitmentLabel}`;
    } else if (commitmentLevel) {
      const commitmentLabel = commitmentLabels[commitmentLevel] || commitmentLevel;
      sessionTypeLabel = `${sessionTypeLabel} - ${commitmentLabel}`;
    }
    
    // Final safety check
    if (!sessionTypeLabel || sessionTypeLabel === 'undefined') {
      sessionTypeLabel = "Not specified";
    }

    // Calculate engagement score (0-100)
    const engagementFactors = [
      sessionData.frictionMap ? 25 : 0,
      sessionData.portfolioBuilder && sessionData.portfolioBuilder.selectedTasks.length > 0 ? 25 : 0,
      sessionData.assessment ? 20 : 0,
      sessionData.tryItWidget && sessionData.tryItWidget.challenges.length > 0 ? 15 : 0,
      Math.min(sessionData.timeOnSite / 180 * 10, 10), // Max 10 points for 3+ min
      Math.min(sessionData.scrollDepth / 100 * 5, 5), // Max 5 points for 100% scroll
    ];
    const engagementScore = Math.round(engagementFactors.reduce((a, b) => a + b, 0));
    const engagementLevel = engagementScore >= 70 ? 'Hot 🔥' : engagementScore >= 40 ? 'Warm ☀️' : 'New 🌱';

    const timeMinutes = Math.floor(sessionData.timeOnSite / 60);
    const timeSeconds = sessionData.timeOnSite % 60;

    // Final safety check: Ensure companyResearch.companyName is ALWAYS a string
    // This prevents any "Cannot read properties of undefined (reading 'replace')" errors
    companyResearch.companyName = ensureString(companyResearch.companyName, domain || "Unknown Company");
    companyResearch.industry = ensureString(companyResearch.industry, "Unknown");
    companyResearch.companySize = ensureString(companyResearch.companySize, "unknown");
    companyResearch.latestNews = ensureString(companyResearch.latestNews, "Unable to verify company information");
    companyResearch.suggestedScope = ensureString(companyResearch.suggestedScope, "Discovery call to understand specific needs");
    companyResearch.confidence = ensureString(companyResearch.confidence, "low");

    // Insert lead to database FIRST (before email send)
    // This ensures we capture the lead even if email fails
    let leadId: string | null = null;
    const supabaseClient = getSupabaseClient();
    
    if (supabaseClient) {
      try {
        const { data: leadData, error: dbError } = await supabaseClient
          .from('leads')
          .insert({
            name,
            email,
            job_title: jobTitle,
            selected_program: selectedProgram,
            commitment_level: commitmentLevel,
            audience_type: audienceType,
            path_type: pathType,
            session_data: sessionData,
            company_research: companyResearch,
            engagement_score: engagementScore,
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database insert error:', dbError);
          // Continue with email send even if DB fails - don't block the flow
        } else {
          leadId = leadData?.id || null;
          console.log('Lead saved to database:', leadId);
        }
      } catch (dbErr) {
        console.error('Database insert exception:', dbErr);
        // Continue with email send even if DB fails
      }
    } else {
      console.warn('Supabase client not available - skipping database insert');
    }

    // Build email HTML with professional CEO-grade design
    // Clean, high-contrast, actionable lead capture email
    let emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 680px; margin: 0 auto; padding: 0; background-color: #ffffff;">
  
  <!-- Header: Lead Contact Information - MOST PROMINENT -->
  <div style="background: linear-gradient(135deg, #0e1a2b 0%, #1a2b3d 100%); padding: 48px 40px; text-align: center;">
    <p style="color: #7ef4c2; margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">NEW LEAD</p>
    <h1 style="color: #ffffff; margin: 0 0 12px 0; font-size: 42px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1;">${escapeHtml(name)}</h1>
    <p style="color: #ffffff; margin: 0 0 24px 0; font-size: 20px; font-weight: 500;">${escapeHtml(jobTitle || 'Role not specified')}</p>
    
    <!-- Lead Email - PROMINENTLY DISPLAYED -->
    <div style="background: rgba(126, 244, 194, 0.2); border: 3px solid #7ef4c2; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 500px;">
      <p style="color: #7ef4c2; margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">CONTACT EMAIL</p>
      <a href="mailto:${escapeHtml(email)}" style="color: #ffffff; font-size: 22px; font-weight: 700; text-decoration: none; word-break: break-all; display: block;">${escapeHtml(email)}</a>
    </div>
  </div>
  
  <!-- Main Content -->
  <div style="background: #ffffff; padding: 40px;">
    
    <!-- Company Information -->
    <div style="background: #f8f9fa; border-left: 4px solid #0e1a2b; border-radius: 8px; padding: 28px; margin-bottom: 32px;">
      <h2 style="color: #0e1a2b; margin: 0 0 20px 0; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">COMPANY</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666666; font-size: 14px; width: 120px; vertical-align: top; font-weight: 600;">Company:</td>
          <td style="padding: 10px 0; color: #1a1a1a; font-size: 16px; font-weight: 700;">${escapeHtml(companyResearch.companyName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666666; font-size: 14px; vertical-align: top; font-weight: 600;">Industry:</td>
          <td style="padding: 10px 0; color: #1a1a1a; font-size: 15px; font-weight: 500;">${escapeHtml(companyResearch.industry)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666666; font-size: 14px; vertical-align: top; font-weight: 600;">Size:</td>
          <td style="padding: 10px 0; color: #1a1a1a; font-size: 15px;">
            <span style="background: #e8f5f0; color: #0e1a2b; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; text-transform: capitalize;">${escapeHtml(companyResearch.companySize)}</span>
          </td>
        </tr>
        ${companyResearch.latestNews && companyResearch.latestNews !== 'Unable to verify company information' ? `
        <tr>
          <td style="padding: 10px 0; color: #666666; font-size: 14px; vertical-align: top; font-weight: 600;">Recent News:</td>
          <td style="padding: 10px 0; color: #1a1a1a; font-size: 15px; line-height: 1.5;">${escapeHtml(companyResearch.latestNews)}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Program Interest - Prominent if available -->
    ${commitmentLevel || sessionTypeLabel !== 'Not specified' ? `
    <div style="background: linear-gradient(135deg, #7ef4c2 0%, #5dd4a8 100%); border-radius: 12px; padding: 32px; margin-bottom: 32px; border: 2px solid #0e1a2b;">
      <h2 style="color: #0e1a2b; margin: 0 0 16px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">PROGRAM INTEREST</h2>
      ${commitmentLevel ? `
      <p style="color: #0e1a2b; margin: 0 0 8px 0; font-size: 28px; font-weight: 900; line-height: 1.2;">${escapeHtml(commitmentLabels[commitmentLevel] || commitmentLevel)}</p>
      ` : ''}
      <p style="color: #0e1a2b; margin: ${commitmentLevel ? '8px' : '0'} 0 0 0; font-size: 18px; font-weight: 700;">${escapeHtml(sessionTypeLabel)}</p>
    </div>
    ` : ''}
    
    `;

    // Add session engagement data
    if (sessionData.frictionMap) {
      emailHtml += `
    <div style="background: #fff8e6; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
      <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">🗺️ Used Friction Map Tool</h3>
      <p style="margin: 0 0 8px 0; color: #451a03; font-size: 14px;"><strong>Problem:</strong> "${escapeHtml(sessionData.frictionMap.problem)}"</p>
      <p style="margin: 0 0 8px 0; color: #451a03; font-size: 14px;"><strong>Potential Savings:</strong> ${sessionData.frictionMap.timeSaved}h/week</p>
      <p style="margin: 0; color: #451a03; font-size: 14px;"><strong>Tools:</strong> ${sessionData.frictionMap.toolRecommendations.map(t => escapeHtml(t)).join(", ")}</p>
    </div>
      `;
    }

    if (sessionData.portfolioBuilder && sessionData.portfolioBuilder.selectedTasks.length > 0) {
      const tasks = sessionData.portfolioBuilder.selectedTasks.map(t => 
        `${escapeHtml(t.name)} (${t.hours}h/week)`
      ).join(", ");
      emailHtml += `
    <div style="background: #e8f5f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #7ef4c2;">
      <h3 style="color: #0e1a2b; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">📊 Used Portfolio Builder</h3>
      <p style="margin: 0 0 8px 0; color: #0e1a2b; font-size: 14px;"><strong>Tasks:</strong> ${tasks}</p>
      <p style="margin: 0 0 8px 0; color: #0e1a2b; font-size: 14px;"><strong>Time Savings:</strong> ${sessionData.portfolioBuilder.totalTimeSaved}h/week</p>
      <p style="margin: 0; color: #0e1a2b; font-size: 14px;"><strong>Cost Savings:</strong> $${sessionData.portfolioBuilder.totalCostSavings.toLocaleString()}/month</p>
    </div>
      `;
    }

    if (sessionData.assessment) {
      emailHtml += `
    <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">✅ Completed Assessment</h3>
      <p style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 14px;"><strong>Profile:</strong> ${escapeHtml(sessionData.assessment.profileType)}</p>
      <p style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 14px;">${escapeHtml(sessionData.assessment.profileDescription)}</p>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px;"><strong>Recommended:</strong> ${escapeHtml(sessionData.assessment.recommendedProduct)}</p>
    </div>
      `;
    }

    if (sessionData.tryItWidget && sessionData.tryItWidget.challenges.length > 0) {
      const lastChallenge = sessionData.tryItWidget.challenges[sessionData.tryItWidget.challenges.length - 1];
      emailHtml += `
    <div style="background: #fdf4ff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #a855f7;">
      <h3 style="color: #7e22ce; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">💡 Used Try It Widget (${sessionData.tryItWidget.challenges.length}x)</h3>
      <p style="margin: 0 0 8px 0; color: #581c87; font-size: 14px;"><strong>Last Challenge:</strong> "${escapeHtml(lastChallenge.input)}"</p>
      <p style="margin: 0; color: #581c87; font-size: 13px; font-style: italic;">"${escapeHtml(lastChallenge.response.substring(0, 200))}..."</p>
    </div>
      `;
    }

    <!-- Engagement Metrics - Compact -->
    <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid #e0e0e0;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
        <div>
          <p style="color: #666666; margin: 0; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Engagement</p>
          <p style="color: #1a1a1a; margin: 8px 0 0 0; font-size: 20px; font-weight: 800;">${engagementLevel}</p>
        </div>
        <div>
          <p style="color: #666666; margin: 0; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Score</p>
          <p style="color: #1a1a1a; margin: 8px 0 0 0; font-size: 20px; font-weight: 800;">${engagementScore}/100</p>
        </div>
        <div>
          <p style="color: #666666; margin: 0; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Time</p>
          <p style="color: #1a1a1a; margin: 8px 0 0 0; font-size: 20px; font-weight: 800;">${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; padding: 24px; background: #0e1a2b; color: #ffffff;">
    <p style="margin: 0; color: #7ef4c2; font-size: 11px; font-weight: 600;">Lead captured at <a href="https://www.themindmaker.ai" style="color: #7ef4c2; text-decoration: none;">themindmaker.ai</a></p>
    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.6); font-size: 10px;">© ${new Date().getFullYear()} Mindmaker LLC</p>
  </div>
</body>
</html>
    `;

    // Send email with retry logic
    let emailSent = false;
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Email send attempt ${attempt}/${maxRetries}`);
        
        // Log request details for debugging
        const requestBody = {
          from: 'Mindmaker Leads <leads@themindmaker.ai>',
          to: ['krish@themindmaker.ai'],
          reply_to: email,
          subject: `🎯 Lead: ${name} from ${companyResearch.companyName} - ${sessionTypeLabel}`,
          html: emailHtml,
        };
        
        console.log("Resend API request details:", {
          url: 'https://api.resend.com/emails',
          method: 'POST',
          hasApiKey: !!sanitizedApiKey,
          apiKeyLength: sanitizedApiKey.length,
          apiKeyPrefix: sanitizedApiKey.substring(0, 5),
          from: requestBody.from,
          to: requestBody.to,
          subjectLength: requestBody.subject.length,
          htmlLength: requestBody.html.length
        });
        
        // CRITICAL FIX: Use regular fetch instead of fetchWithTimeout
        // Working functions (send-contact-email, send-leadership-insights-email) use regular fetch
        // The AbortController signal in fetchWithTimeout may interfere with Resend API authentication
        const emailResponse = await fetch(
          'https://api.resend.com/emails',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sanitizedApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          
          // Enhanced error logging for debugging
          console.error("Resend API error details:", {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            errorBody: errorText,
            attempt: attempt,
            requestHeaders: {
              'Authorization': `Bearer ${sanitizedApiKey.substring(0, 5)}...`,
              'Content-Type': 'application/json'
            },
            responseHeaders: Object.fromEntries(emailResponse.headers.entries())
          });
          
          lastError = new Error(`Resend API error (${emailResponse.status}): ${errorText}`);
          console.error(`Email send attempt ${attempt} failed:`, lastError.message);
          
          // Exponential backoff: 1s, 2s, 4s
          if (attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt - 1) * 1000;
            console.log(`Retrying in ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }
          
          throw lastError;
        }

        const emailData = await emailResponse.json();
        console.log("Email sent successfully:", emailData);
        emailSent = true;
        
        // Update lead record with email status
        if (leadId && supabaseClient) {
          try {
            await supabaseClient
              .from('leads')
              .update({ 
                email_sent: true,
                email_sent_at: new Date().toISOString()
              })
              .eq('id', leadId);
            console.log('Lead email status updated:', leadId);
          } catch (updateErr) {
            console.error('Failed to update lead email status:', updateErr);
            // Don't fail the whole request if update fails
          }
        }
        
        break;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Email attempt ${attempt} error:`, lastError);
        
        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          console.log(`Network error, retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    if (!emailSent) {
      console.error("CRITICAL: Email failed after all retry attempts");
      throw new Error(`Email delivery failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      leadId: leadId 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-lead-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
