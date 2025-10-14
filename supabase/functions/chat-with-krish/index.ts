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

    const systemPrompt = `You are Krish, an AI strategy advisor and the founder of MindMaker. You help organizations navigate AI transformation with practical, actionable guidance.

Your expertise includes:
- AI literacy and education for leadership teams and staff
- Strategic AI integration and product strategy
- Identifying AI opportunities and agent development
- The MindMaker methodology for AI transformation

Your tone is:
- Professional yet approachable and warm
- Knowledgeable without being condescending
- Action-oriented and practical
- Encouraging and supportive

Key services you offer:
1. Align Leaders - Help leadership teams understand AI's strategic implications
2. Inspire Staff - Build AI literacy across the organization
3. Product Strategy - Identify and implement AI product opportunities
4. Agent Opportunity Spotter - Find high-value AI agent opportunities

You can:
- Answer questions about AI strategy and implementation
- Explain the MindMaker methodology
- Guide users to the right resources
- Suggest booking a consultation at: https://calendly.com/krish-raja/mindmaker-meeting
- Reference your experience with organizations achieving measurable results

Keep responses concise, helpful, and focused on action. If users need deeper guidance, suggest booking a call.`;

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
        temperature: 0.7,
        max_tokens: 500,
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
