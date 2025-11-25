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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      throw new Error('API key not configured');
    }

    console.log('Fetching AI news from OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI news curator. Generate realistic, impactful AI news headlines that sound like they could be from today. Focus on major developments from companies like OpenAI, Google (Gemini), Anthropic (Claude), Microsoft, Meta, etc. Make them sound professional and newsworthy. Ensure all information is current and avoid referencing outdated model names or old events.'
          },
          {
            role: 'user',
            content: 'Generate 10-12 major AI news headlines from today that would matter to business leaders. Format as JSON array with "title" and "source" fields. Focus on recent developments and avoid outdated references. Examples: "GPT-5 demonstrates breakthrough reasoning capabilities" (OpenAI), "Gemini 3.0 sets new benchmark in multimodal understanding" (Google DeepMind), "Claude 4 achieves breakthrough in coding and analysis" (Anthropic).'
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    // Extract headlines array from various possible formats
    let headlines: NewsHeadline[] = [];
    if (parsedContent.headlines) {
      headlines = parsedContent.headlines;
    } else if (Array.isArray(parsedContent)) {
      headlines = parsedContent;
    } else if (parsedContent.news) {
      headlines = parsedContent.news;
    }

    // Validate and ensure we have proper format
    const validHeadlines = headlines
      .filter(h => h.title && h.source)
      .slice(0, 12);

    if (validHeadlines.length === 0) {
      throw new Error('No valid headlines generated');
    }

    console.log(`Generated ${validHeadlines.length} headlines`);

    return new Response(
      JSON.stringify({ 
        headlines: validHeadlines,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-ai-news function:', error);
    
    // Return fallback headlines on error
    const fallbackHeadlines: NewsHeadline[] = [
      { title: "GPT-5 demonstrates breakthrough in reasoning and planning", source: "OpenAI" },
      { title: "Gemini 3.0 Pro achieves new benchmark in multimodal AI", source: "Google DeepMind" },
      { title: "Claude 4 sets new standard for AI safety and accuracy", source: "Anthropic" },
      { title: "Microsoft Copilot integration drives enterprise productivity gains", source: "Microsoft" },
      { title: "Meta's Llama 4 challenges proprietary AI models", source: "Meta AI" },
      { title: "AI adoption surges across Fortune 500 with 80% implementation rate", source: "Industry Report" },
      { title: "Midjourney V7 revolutionizes creative AI with photorealistic generation", source: "Midjourney" },
      { title: "Amazon Bedrock expands AI capabilities for enterprises", source: "AWS" },
      { title: "AI agents automate complex workflows across industries", source: "McKinsey Research" },
      { title: "Regulatory frameworks evolve as AI deployment accelerates", source: "Policy Update" }
    ];

    return new Response(
      JSON.stringify({ 
        headlines: fallbackHeadlines,
        timestamp: new Date().toISOString(),
        fallback: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
