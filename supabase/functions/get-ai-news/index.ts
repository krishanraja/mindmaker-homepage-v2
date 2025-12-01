import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsHeadline {
  title: string;
  source: string;
}

interface Provider {
  name: 'lovable' | 'openai' | 'fallback';
  key?: string;
  endpoint?: string;
  model?: string;
}

// Provider cascade: Lovable AI → OpenAI → Fallback
const getProvider = (): Provider => {
  const LOVABLE_KEY = Deno.env.get('LOVABLE_API_KEY');
  const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (LOVABLE_KEY) {
    console.log('✅ Using LOVABLE AI (Plan A)');
    return {
      name: 'lovable',
      key: LOVABLE_KEY,
      endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
      model: 'google/gemini-2.5-flash'
    };
  }
  
  if (OPENAI_KEY) {
    console.log('⚠️ LOVABLE_API_KEY missing, using OPENAI (Plan B)');
    return {
      name: 'openai',
      key: OPENAI_KEY,
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini'
    };
  }
  
  console.error('❌ No API keys available, returning fallback (Plan C)');
  return { name: 'fallback' };
};

const SYSTEM_PROMPT = `You are a senior business journalist writing the AI briefing for Forbes, Business Insider, and The Wall Street Journal. Your audience: Fortune 500 CEOs, board members, enterprise leaders.

Write 20 headlines about AI in business that executives would actually read.

Mix:
- **Breaking**: Major deals, earnings impacts, regulatory moves
- **Analysis**: What a trend means for enterprise strategy  
- **Data**: Research findings, market shifts, adoption stats
- **Risk**: Compliance issues, cautionary intelligence

Tone: Authoritative, factual, business-focused. Like Financial Times.
NO marketing speak. NO hype. NO "revolutionary" or "game-changing".
NO brackets like [SIGNAL] or [HOT TAKE].

Use real publication names: Forbes, WSJ, Bloomberg, Reuters, McKinsey, Gartner, FT.

Format: JSON array [{"title": "headline 60-90 chars", "source": "Publication Name"}]`;

// Safe content extraction
const extractContent = (data: any): string | null => {
  try {
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
};

// Safe JSON parsing with multiple strategies
const parseHeadlines = (content: string): NewsHeadline[] => {
  // Strategy 1: Direct parse
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.headlines) return parsed.headlines;
    if (parsed.news) return parsed.news;
  } catch {}
  
  // Strategy 2: Extract JSON from markdown code blocks
  const match = content.match(/\[[\s\S]*?\]/);
  if (match) {
    try { 
      return JSON.parse(match[0]); 
    } catch {}
  }
  
  return [];
};

// Validate headlines
const validateHeadlines = (headlines: any[]): NewsHeadline[] => {
  return headlines
    .filter(h => 
      h && 
      typeof h.title === 'string' && 
      h.title.length > 15 &&
      typeof h.source === 'string' && 
      h.source.length > 0
    )
    .slice(0, 20);
};

const FALLBACK_HEADLINES: NewsHeadline[] = [
  { title: "Microsoft AI revenue tops $13B quarterly as Copilot adoption accelerates", source: "Bloomberg" },
  { title: "EU regulators fine Meta €1.2B over AI training data practices", source: "Financial Times" },
  { title: "OpenAI enterprise contracts reach $2B ARR amid pricing pressure", source: "The Information" },
  { title: "McKinsey: 70% of AI pilots fail to reach production deployment", source: "McKinsey" },
  { title: "Google Cloud loses ground to AWS in enterprise AI infrastructure", source: "Reuters" },
  { title: "Anthropic raises Series D at $18B valuation as AI race intensifies", source: "WSJ" },
  { title: "CFOs report AI investments underperforming ROI expectations", source: "Gartner" },
  { title: "Healthcare AI adoption slows amid regulatory uncertainty", source: "STAT News" },
  { title: "Amazon quietly scales back Alexa AI features citing costs", source: "Bloomberg" },
  { title: "Enterprise AI spending to reach $150B by 2027, IDC forecasts", source: "IDC" },
  { title: "SEC increases scrutiny of AI-related claims in earnings calls", source: "WSJ" },
  { title: "China tech giants pivot to open-source AI amid chip restrictions", source: "FT" },
  { title: "AI talent market cooling as layoffs hit tech sector", source: "Fortune" },
  { title: "Banks face $50B compliance burden from incoming AI regulations", source: "Reuters" },
  { title: "Nvidia data center revenue surges 400% on AI chip demand", source: "Bloomberg" },
  { title: "Insurance industry leads in AI claims automation at 80%", source: "McKinsey" },
  { title: "Microsoft, Google in talks over AI patent cross-licensing", source: "The Information" },
  { title: "AI-generated code now accounts for 25% of GitHub commits", source: "GitHub" },
  { title: "Enterprise CIOs prioritize AI governance over new deployments", source: "Gartner" },
  { title: "Salesforce cuts workforce as AI automates sales functions", source: "WSJ" }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const provider = getProvider();
    
    // Plan C: Return fallback immediately if no API keys
    if (provider.name === 'fallback') {
      console.log('📋 Returning fallback headlines (no API keys configured)');
      return new Response(
        JSON.stringify({
          headlines: FALLBACK_HEADLINES,
          timestamp: new Date().toISOString(),
          provider: 'fallback',
          fallback: true,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Generating AI news briefing via ${provider.name}...`);

    const response = await fetch(provider.endpoint!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: 'Generate 20 AI business news headlines.' }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider.name} API error:`, response.status, errorText);
      throw new Error(`${provider.name} API error: ${response.status}`);
    }

    const data = await response.json();
    const content = extractContent(data);
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received, parsing headlines...');
    
    const headlines = parseHeadlines(content);
    const validHeadlines = validateHeadlines(headlines);

    if (validHeadlines.length === 0) {
      throw new Error('No valid headlines generated');
    }

    console.log(`✅ Generated ${validHeadlines.length} headlines via ${provider.name}`);

    return new Response(
      JSON.stringify({
        headlines: validHeadlines,
        timestamp: new Date().toISOString(),
        provider: provider.name,
        fallback: false,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating AI news:', error);
    
    return new Response(
      JSON.stringify({
        headlines: FALLBACK_HEADLINES,
        timestamp: new Date().toISOString(),
        provider: 'fallback',
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
