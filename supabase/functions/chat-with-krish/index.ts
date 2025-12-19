/**
 * @file chat-with-krish Edge Function
 * @description AI chatbot powered by Vertex AI with RAG (Retrieval Augmented Generation)
 *              using the Mindmaker methodology corpus. Supports both main chat and Try It Widget modes.
 * @dependencies Google Cloud Service Account, Vertex AI API
 * @secrets GOOGLE_SERVICE_ACCOUNT_KEY
 * 
 * Request:
 *   POST { messages: Array<{role: string, content: string}>, widgetMode?: 'tryit' | undefined }
 * 
 * Response:
 *   { message: string, metadata: { model: string, cached: boolean, fallback: boolean } }
 * 
 * Error Handling:
 *   - Always returns 200 with fallback message on error (anti-fragile design)
 *   - Caches access tokens for 50 minutes
 *   - Comprehensive RAG diagnostic logging
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createLogger, extractRequestContext } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
});

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
  widgetMode: z.enum(['tryit']).optional(),
});

// Predictable response shape
interface ChatResponse {
  message: string;
  metadata?: {
    model: string;
    cached: boolean;
    fallback: boolean;
  };
}

// Fallback message for all failure scenarios
const FALLBACK_MESSAGE = `I'm having trouble connecting right now. Here's what I'd normally help with:

1. **Builder Session** - 60 minutes, one real problem → AI friction map + draft systems
   [Book now](/#book)

2. **30-Day Builder Sprint** - Build 3-5 working AI systems around your work
   [Learn more](/builder-sprint)

3. **AI Leadership Lab** - Executive team transformation (4 hours)
   [Learn more](/leadership-lab)

4. **Partner Program** - Portfolio-wide AI enablement
   [Learn more](/partner-program)`;

// Token cache (in-memory, expires after 50 minutes)
let cachedToken: { token: string; expiresAt: number } | null = null;

// Generate RS256-signed JWT for Google service account
async function generateJWT(serviceAccount: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import the private key
  const privateKey = serviceAccount.private_key;
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  // Properly strip PEM headers/footers and ALL whitespace including newlines
  const pemContents = privateKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\\n/g, '')   // Handle escaped newlines from JSON storage
    .replace(/\n/g, '')    // Handle actual newlines
    .replace(/\r/g, '')    // Handle carriage returns
    .replace(/\s/g, '')    // Remove any remaining whitespace
    .trim();

  console.log('PEM header found:', privateKey.includes(pemHeader));
  console.log('PEM footer found:', privateKey.includes(pemFooter));
  console.log('PEM contents length after cleanup:', pemContents.length);
  console.log('First 50 chars of cleaned PEM:', pemContents.substring(0, 50));

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${encodedSignature}`;
}

// Exchange JWT for access token
async function getAccessToken(serviceAccount: any): Promise<string> {
  // Check cache first
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    console.log('Using cached access token');
    return cachedToken.token;
  }

  console.log('Generating new access token');
  const jwt = await generateJWT(serviceAccount);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange failed:', response.status, errorText);
    throw new Error(`Failed to exchange JWT for access token: ${response.status}`);
  }

  const data = await response.json();
  const token = data.access_token;

  // Cache for 50 minutes (tokens expire at 60)
  cachedToken = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  return token;
}

// Extract content from Vertex AI response with guards
function extractContent(response: any): string {
  try {
    const candidate = response?.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text;
    
    // Check if model hit token limit before generating content
    if (candidate?.finishReason === 'MAX_TOKENS' && (!content || content.trim() === '')) {
      console.warn('Model hit MAX_TOKENS before generating content');
      return FALLBACK_MESSAGE;
    }
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      console.warn('Empty or invalid content in Vertex AI response:', JSON.stringify(response));
      return FALLBACK_MESSAGE;
    }
    
    return content;
  } catch (error) {
    console.error('Error extracting content:', error);
    return FALLBACK_MESSAGE;
  }
}

// Call Vertex AI with RAG
async function callVertexAI(messages: any[], accessToken: string, isTryItWidget: boolean = false, systemInstruction?: string): Promise<string> {
  const PROJECT_ID = 'gen-lang-client-0174430158';
  const LOCATION = 'us-east1';
  const MODEL = 'gemini-2.5-flash';
  const RAG_CORPUS_ID = '6917529027641081856';

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

  // Convert messages to Gemini format - filter out system messages
  const contents = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

  const requestBody: any = {
    contents,
    tools: {
      retrieval: {
        disable_attribution: false,
        vertex_rag_store: {
          rag_resources: [{
            rag_corpus: `projects/${PROJECT_ID}/locations/${LOCATION}/ragCorpora/${RAG_CORPUS_ID}`,
          }],
          similarity_top_k: 5,
          vector_distance_threshold: 0.5,
        },
      },
    },
    generation_config: {
      temperature: 0.8,
      max_output_tokens: isTryItWidget ? 1024 : 2048,
    },
  };

  // Add system instruction if provided
  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  console.log('=== VERTEX AI RAG REQUEST ===');
  console.log('Endpoint:', endpoint);
  console.log('Request body:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Vertex AI error:', response.status, errorText);

    if (response.status === 429) {
      return 'I\'m currently experiencing high traffic. Please try again in a moment or [book a session directly](/#book).';
    }
    
    if (response.status === 402) {
      return 'Service temporarily unavailable. Please [book a session directly](/#book).';
    }

    if (response.status === 401) {
      console.error('Authentication failed - token may be expired');
      cachedToken = null; // Clear cache
      throw new Error('Authentication failed');
    }

    throw new Error(`Vertex AI request failed: ${response.status}`);
  }

  const data = await response.json();
  
  console.log('=== VERTEX AI RESPONSE RECEIVED ===');
  console.log('Response status:', response.status);
  console.log('Full response keys:', Object.keys(data));
  console.log('Candidates count:', data.candidates?.length || 0);
  
  // COMPREHENSIVE RAG DIAGNOSTIC LOGGING
  console.log('=== RAG DIAGNOSTIC START ===');
  
  // Check for grounding metadata at correct path: data.candidates[0].groundingMetadata (camelCase)
  const candidate = data.candidates?.[0];
  
  if (candidate?.groundingMetadata) {
    console.log('✅ RAG is working - groundingMetadata found');
    console.log('Full grounding metadata:', JSON.stringify(candidate.groundingMetadata, null, 2));
    
    // Log retrieval queries (camelCase)
    if (candidate.groundingMetadata.retrievalQueries) {
      console.log('Retrieval queries used:', candidate.groundingMetadata.retrievalQueries);
    }
    
    // Log grounding chunks (actual corpus content retrieved)
    if (candidate.groundingMetadata.groundingChunks) {
      console.log(`Retrieved ${candidate.groundingMetadata.groundingChunks.length} chunks from corpus`);
      candidate.groundingMetadata.groundingChunks.forEach((chunk: any, idx: number) => {
        console.log(`\nChunk ${idx + 1}:`);
        console.log('  Source:', chunk.retrievedContext?.title || 'Unknown');
        console.log('  Content preview:', chunk.retrievedContext?.text?.substring(0, 200) || 'No text');
        console.log('  Relevance score:', chunk.relevanceScore || 'N/A');
      });
    }
    
    // Log grounding supports (how corpus was used in response)
    if (candidate.groundingMetadata.groundingSupports) {
      console.log('\nGrounding supports:', candidate.groundingMetadata.groundingSupports.length);
    }
  } else {
    console.warn('❌ No groundingMetadata found - RAG is NOT working');
    console.log('Full candidate structure:', JSON.stringify(candidate ? Object.keys(candidate) : 'No candidate', null, 2));
    console.log('Full response structure:', JSON.stringify(Object.keys(data), null, 2));
  }
  
  console.log('=== RAG DIAGNOSTIC END ===');
  
  return extractContent(data);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { requestId, sessionId } = extractRequestContext(req);
  const logger = createLogger('chat-with-krish', requestId, sessionId);
  
  logger.info('Chat request started');
  
  try {
    const body = await req.json();
    
    // Validate input
    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      logger.warn('Validation failed', { errors: parseResult.error.flatten() });
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: parseResult.error.flatten().fieldErrors }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    const { messages, widgetMode } = parseResult.data;
    const isTryItWidget = widgetMode === 'tryit';
    logger.info('Request validated', { widgetMode, messageCount: messages.length, isTryItWidget });

    // Get service account credentials
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    
    if (!serviceAccountJson) {
      console.error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
      throw new Error('Service configuration error');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (error) {
      console.error('Failed to parse service account JSON:', error);
      throw new Error('Invalid service account configuration');
    }

    // Validate service account structure
    if (!serviceAccount.private_key || !serviceAccount.client_email) {
      console.error('Invalid service account structure');
      throw new Error('Invalid service account configuration');
    }

    // System prompt based on context
    const systemPrompt = isTryItWidget 
      ? `You are Krish, founder of Mindmaker. The user has a specific AI decision challenge.

## MINDMAKER METHODOLOGY (Use these frameworks in your response)

### The Five Cognitive Frameworks for AI Decisions:
1. **A/B Framing**: Reframe decisions positively AND negatively to expose bias. "An 80% success rate is also a 20% failure risk."
2. **Dialectical Reasoning**: Explore thesis-antithesis-synthesis. What's the strongest case FOR and AGAINST?
3. **Mental Contrasting (WOOP)**: Wish → Outcome → Obstacle → Plan. Balance optimism with reality.
4. **Reflective Equilibrium**: Does this decision align with your organizational values and principles?
5. **First-Principles Thinking**: Strip assumptions, ask "Why?" five times, rebuild from fundamental truths.

### Key Mindmaker Insights:
- "We build working systems, not strategy decks"
- "Leaders learn by building, not by listening"
- "AI literacy is compounding leadership performance"
- Time savings: Session saves 2-5 hrs/week, Sprint saves 8-15 hrs/week
- ROI: 10-20x within 6 months for engaged leaders

### Outcomes We Deliver:
- Builder Session (60 min): 1 AI friction map + 1-2 draft systems ready to test
- Builder Sprint (30 days): 3-5 working AI systems + Builder Dossier + 90-day roadmap
- Leadership Lab: Shared language, 90-day pilot charter, 2 decisions run through AI

CRITICAL INSTRUCTIONS:
1. Apply ONE of the five frameworks to their specific challenge
2. Your response MUST be 3-5 sentences maximum
3. Provide ONE unique, specific insight (not generic advice)
4. Give ONE concrete next step with a clickable link
5. Use **bold** for the key insight
6. Format ALL links as [text](url)
7. Sound like Krish: direct, practical, zero fluff, slightly provocative

RESPONSE STRUCTURE:
[Apply a framework to their problem - be specific] [One actionable insight they can use immediately] [Link to next step]

EXAMPLES:
"**Let's apply first-principles thinking here.** Why do you need a chatbot? Strip the assumption. The fundamental need is probably faster customer resolution, not a chatbot. That opens other solutions—maybe a smart FAQ, maybe AI-assisted agents. **Map it out:** [Build a friction map](/) to see where AI actually removes work, or [book a Builder Session](/#book) for a 60-minute deep dive."

"**Classic build vs. buy tension.** Using dialectical reasoning: building gives you control but costs 6+ months; buying is fast but creates vendor lock-in. The synthesis? Buy a foundation, customize the 20% that matters. Most teams overcomplicate this. [Book a Builder Session](/#book) and we'll map the real decision in 60 minutes."`
      : `You are Krish, founder of Mindmaker. You help non-technical leaders build AI systems without code.

## MINDMAKER METHODOLOGY

### Core Philosophy
"AI literacy is about compounding leadership performance—using AI to think better, faster, and more creatively as a leader."

### The Five Cognitive Frameworks (Use these when helping with decisions):
1. **A/B Framing**: Reframe decisions positively AND negatively to expose bias
2. **Dialectical Reasoning**: Explore thesis-antithesis-synthesis for better decisions  
3. **Mental Contrasting (WOOP)**: Wish → Outcome → Obstacle → Plan
4. **Reflective Equilibrium**: Ensure decisions align with organizational values
5. **First-Principles Thinking**: Strip assumptions, find fundamental truths, rebuild

### What We Do
We turn non-technical leaders into no-code AI builders. Build working systems around your real work—no code, no waiting for IT.

### Programs & Outcomes
- **Builder Session** (60 min): 1 friction map + 1-2 draft systems → saves 2-5 hrs/week
- **Builder Sprint** (30 days): 3-5 working systems + Builder Dossier → saves 8-15 hrs/week  
- **Leadership Lab** (half/full day): Shared language + 90-day pilot charter for exec teams
- **Partner Program** (6-12 months): Portfolio-wide AI enablement for VCs/advisors

### Target Leaders
CEOs, COOs, GMs, CCOs, CPOs with P&L responsibility, 10+ years leadership, who need to build the future—not delegate it.

YOUR STYLE:
- Ultra-concise (1-3 sentences max)
- Direct, practical, zero fluff
- Give answers, not questions
- Apply frameworks when relevant
- Point to specific actions immediately

WHEN USERS ASK ABOUT:

**"How does this work?" / "What do you do?"**
→ "We help leaders build AI systems hands-on—working systems, not strategy decks. [Try the AI decision tool](/) or [book a Builder Session](/#book) to map your first system."

**"I want to learn more"**
→ "Three paths: [Try the AI tool](/) to test our approach, [book a Builder Session](/#book) for your specific problem, or [see the Builder Sprint](/builder-sprint) to build 3-5 systems in 30 days."

**AI decision questions**
→ Apply one of the five frameworks, give a specific insight, then "[Book a Builder Session](/#book) to go deeper."

**"Is this for me?"**
→ "Built for senior leaders with P&L responsibility who need AI literacy that compounds their performance. If you're making AI strategy decisions, this is for you. [Book a session](/#book)."

CRITICAL RULES:
1. Never ask follow-up questions—give actionable answers immediately
2. Every response includes at least ONE clickable link as [text](url)
3. Maximum 3 sentences unless explaining a program
4. When they have a decision challenge, apply one of the five frameworks
5. Default next step is ALWAYS [Book a Builder Session](/#book)

EXAMPLES:

User: "I'm overwhelmed by AI"
You: "Most leaders are—you're seeing noise, not signal. **First-principles question:** What's the one workflow draining most of your time? Start there. [Try our friction map tool](/) to identify it, or [book a Builder Session](/#book) to map it in 60 minutes."

User: "Should we build or buy our AI solution?"
You: "**Dialectical framing:** Building = control + 6 months; Buying = speed + vendor lock-in. The synthesis most teams miss: buy the foundation, customize the 20% that matters. [Book a Builder Session](/#book) and we'll map your specific case."`;

    // Get access token and call Vertex AI with system instruction
    logger.info('Authenticating with Google service account');
    const accessToken = await getAccessToken(serviceAccount);
    logger.info('Authentication successful, calling Vertex AI RAG');
    
    const assistantMessage = await callVertexAI(messages, accessToken, isTryItWidget, systemPrompt);
    logger.info('Vertex AI response received', { responseLength: assistantMessage.length });

    const response: ChatResponse = {
      message: assistantMessage,
      metadata: {
        model: 'gemini-2.5-flash',
        cached: cachedToken !== null,
        fallback: assistantMessage === FALLBACK_MESSAGE,
      },
    };

    logger.info('Chat request completed successfully');
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('Chat request failed', { error: error instanceof Error ? error.message : String(error) });
    
    // Always return a usable response, never break the UI
    const errorResponse: ChatResponse = {
      message: FALLBACK_MESSAGE,
      metadata: {
        model: 'gemini-2.5-flash',
        cached: false,
        fallback: true,
      },
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 200, // Return 200 to avoid breaking the UI
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
