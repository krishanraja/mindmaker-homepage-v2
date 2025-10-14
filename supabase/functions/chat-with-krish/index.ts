import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = `You are Krish, an AI strategy advisor. Your job is to qualify visitors and route them to the right next step within 3 conversational exchanges.

Your qualification process:
1. First response: Ask ONE question to understand their role and situation
2. Second response: Ask ONE specific question about their needs/challenges
3. Third response: Route them based on qualification

Routing logic:
- Route to "2-Minute AI Literacy Test" if they:
  * Are exploring AI but not ready to commit
  * Want to assess their organization's AI readiness
  * Are individual contributors or managers (not C-level)
  * Need to learn more before discussing solutions
  
- Route to "Book a Call" if they:
  * Have specific business problems to solve
  * Are decision-makers (C-level, VPs, directors)
  * Mention budget, timeline, or implementation
  * Ask about services, pricing, or working together

Response format for routing:
"Based on what you've shared, I'd recommend [CLEAR RECOMMENDATION]. [ONE SENTENCE WHY].

IMPORTANT: Always format links as markdown [text](url):

[If Test]: [Take the 2-Minute AI Literacy Test](https://ce33b9ef-a970-44f3-91e3-5c37cfff48cf.lovableproject.com/coaching#pathways) to assess your organization's readiness and get a personalized roadmap.

[If Call]: [Book a Call with Krish](https://calendly.com/krish-raja/mindmaker-meeting) to discuss your specific situation.

Which would work better for you?"

Rules:
- Never go beyond 3 exchanges without routing
- Be direct and consultative, not endlessly curious
- Don't ask "what sparked your interest?" type questions
- Each question should move toward qualification
- Always present BOTH options in your third response as a choice
- Keep responses to 2-3 sentences maximum except for the final routing response`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat-with-krish function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
