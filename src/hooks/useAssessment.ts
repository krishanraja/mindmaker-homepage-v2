import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    score: number;
  }[];
}

export interface BuilderProfile {
  type: string;
  description: string;
  strengths: string[];
  nextSteps: string[];
  recommendedProduct: string;
  productLink: string;
  frameworkUsed?: string;
}

const QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'approach',
    question: 'How do you currently approach AI in your work?',
    options: [
      { value: 'exploring', label: "I'm exploring but haven't built systems yet", score: 1 },
      { value: 'experimenting', label: "I'm experimenting with a few tools", score: 2 },
      { value: 'building', label: "I'm actively building AI workflows", score: 3 },
    ],
  },
  {
    id: 'frustration',
    question: "What's your biggest AI frustration?",
    options: [
      { value: 'overwhelm', label: 'Too many tools, unclear where to start', score: 1 },
      { value: 'implementation', label: "I know what's possible but can't implement", score: 2 },
      { value: 'scale', label: 'Built pilots but struggling to scale', score: 3 },
    ],
  },
  {
    id: 'goal',
    question: 'What would success look like for you in 90 days?',
    options: [
      { value: 'clarity', label: 'Clear understanding of AI for my role', score: 1 },
      { value: 'systems', label: '3-5 working AI systems I use daily', score: 2 },
      { value: 'transformation', label: 'Team-wide AI transformation underway', score: 3 },
    ],
  },
];

export const useAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answerQuestion = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const generateProfile = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    // Calculate total score for fallback
    let totalScore = 0;
    QUESTIONS.forEach(q => {
      const answer = answers[q.id];
      const option = q.options.find(o => o.value === answer);
      if (option) totalScore += option.score;
    });

    // Build context from answers for AI
    const answerSummary = QUESTIONS.map(q => {
      const answer = answers[q.id];
      const option = q.options.find(o => o.value === answer);
      return `${q.question}: ${option?.label || 'Not answered'}`;
    }).join('\n');

    try {
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d84be03b-cc5f-4a51-8624-1abff965b9ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAssessment.ts:84',message:'Calling chat-with-krish',data:{answerSummary,totalScore},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'FRONTEND'})}).catch(()=>{});
      // #endregion
      
      const { data, error: apiError } = await supabase.functions.invoke('chat-with-krish', {
        body: {
          messages: [
            {
              role: 'user',
              content: `You are analyzing a senior leader's AI readiness assessment. Your job is to create a deeply personalized, insightful profile that demonstrates expert-level understanding of their specific situation.

ASSESSMENT RESPONSES:
${answerSummary}

## DEEP ANALYSIS PROCESS (Follow this systematically):

### Step 1: Extract Specific Language
- Pull out exact phrases, words, or patterns from their answers (not just the option they selected)
- Note their tone: Are they cautious? Enthusiastic? Overwhelmed? Confident but stuck?
- Identify contradictions: Do they say one thing but their choices suggest another?

### Step 2: Pattern Recognition Across Answers
- What story do their answers tell together? (e.g., "You selected 'experimenting' but also 'need structure' - this suggests you've tried tools but hit the 'now what?' wall")
- What are they NOT saying? (e.g., No mention of team? They might be thinking solo. No mention of ROI? They might be in exploration mode)
- What's their journey stage? (Curious → Experimenting → Building → Scaling → Transforming)

### Step 3: Identify Unique Combinations
- Their specific answer combination creates a unique profile (e.g., "Experimentation + Implementation challenge + Team of 10-50" = "You're a scaling leader who's past the demo phase but needs systems")
- What makes THIS person different from others with similar answers? Find the nuance.

### Step 4: Apply Mindmaker Framework (Choose ONE that best fits)
- **First-Principles Thinking**: If they're questioning fundamentals, stuck on assumptions, or need to rebuild from basics
- **Mental Contrasting (WOOP)**: If they have clear goals but obstacles are blocking them
- **Dialectical Reasoning**: If they're torn between options (build vs buy, speed vs quality, etc.)
- **A/B Framing**: If they're stuck in binary thinking or need perspective shift
- **Reflective Equilibrium**: If values/org culture alignment is the core challenge

### Step 5: Create Specific Strengths (NOT Generic)
BAD: "Open mindset" (anyone could have this)
GOOD: "Your recognition of overwhelm suggests you've moved past the 'AI is magic' phase—you're seeing the complexity, which is actually a strength because it means you're thinking critically, not just following hype."

Each strength must:
- Reference their specific answer combination
- Explain WHY it's a strength (not just what it is)
- Show you understand their unique position

### Step 6: Craft Actionable Next Steps
Each step must:
- Reference their specific answers (e.g., "You mentioned weekly reports take 5 hours - let's start there")
- Include timeline (e.g., "Within 2 weeks")
- Explain expected outcome
- Build on previous steps logically

## OUTPUT FORMAT (Return ONLY valid JSON, no markdown):

{
  "type": "A creative 2-3 word title that captures their UNIQUE position based on their answer combination. Must be specific, not generic. Examples: 'Experimentation Catalyst' (if experimenting + need structure), 'Systematization Builder' (if building + need systems), 'Transformation Architect' (if scaling + need strategy)",
  "description": "2-3 sentences that: (1) Acknowledge their EXACT journey stage from answers, (2) Identify the KEY insight/pattern you noticed (reference specific answers), (3) Frame their potential in concrete terms. MUST reference their actual responses, not generic statements.",
  "frameworkUsed": "The specific framework name AND a 1-sentence explanation of why it fits their situation",
  "strengths": [
    "Strength 1: Specific to their answer combination, with context explaining WHY it's a strength. Reference their actual words/choices. Example: 'Your selection of 'experimenting' combined with 'implementation challenge' shows you've moved past the 'AI is magic' phase—you're testing real workflows, which is a strength because it means you're thinking critically about fit, not just following hype.'",
    "Strength 2: Another specific insight that shows deep understanding of their unique position",
    "Strength 3: A third insight that demonstrates you've analyzed their full answer set, not just surface level"
  ],
  "nextSteps": [
    "Step 1: Highly specific, actionable step with timeline. Reference their answers directly. Example: 'Within 2 weeks, use our Friction Map Builder to map your weekly reporting workflow—you mentioned this takes 5 hours, and it's a perfect quick win to build confidence before tackling bigger systems.'",
    "Step 2: Another specific step that builds on step 1, tied to their situation",
    "Step 3: A third step that shows progression and addresses their specific journey stage"
  ],
  "recommendedProduct": "Builder Session OR AI Literacy-to-Influence OR AI Leadership Lab",
  "productLink": "/builder-session OR /builder-sprint OR /leadership-lab"
}

## QUALITY CHECKLIST:
Before finalizing, ask:
- [ ] Does the description reference their specific answers, not generic statements?
- [ ] Are strengths specific enough that only THIS person (with their answer combination) would get them?
- [ ] Do next steps reference their actual words/choices?
- [ ] Would a CEO read this and think "This person really understands my situation"?
- [ ] Is it clear this was written for THEM, not a template?

CRITICAL: This profile should feel like it was written by someone who spent 30 minutes understanding their specific situation. A CEO reading this should think "This is exactly where I am and exactly what I need."`
            }
          ],
          widgetMode: 'tryit'
        }
      });

      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d84be03b-cc5f-4a51-8624-1abff965b9ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAssessment.ts:115',message:'Response received',data:{hasData:!!data,hasError:!!apiError,errorMsg:apiError?.message,messageLength:data?.message?.length,metadataFallback:data?.metadata?.fallback},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'FRONTEND'})}).catch(()=>{});
      // #endregion

      if (apiError) throw new Error(apiError.message || 'API error');

      // Parse the AI response with robust extraction
      const responseText = data?.message || '';
      
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d84be03b-cc5f-4a51-8624-1abff965b9ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAssessment.ts:125',message:'Parsing response',data:{responseTextLength:responseText.length,first200:responseText.substring(0,200),isFallbackMessage:responseText.includes("I'm having trouble connecting")},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'FRONTEND'})}).catch(()=>{});
      // #endregion
      
      // Try multiple JSON extraction strategies
      let parsed: any = null;
      
      // Strategy 1: Direct JSON parse (if response is pure JSON)
      try {
        parsed = JSON.parse(responseText.trim());
      } catch {
        // Strategy 2: Extract JSON object from markdown or mixed content
        const jsonMatch = responseText.match(/\{[\s\S]*?\}(?=[^}]*$)/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            // Strategy 3: More aggressive extraction - find outermost braces
            const start = responseText.indexOf('{');
            const end = responseText.lastIndexOf('}');
            if (start !== -1 && end > start) {
              try {
                parsed = JSON.parse(responseText.slice(start, end + 1));
              } catch {
                // Give up on parsing
              }
            }
          }
        }
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d84be03b-cc5f-4a51-8624-1abff965b9ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAssessment.ts:155',message:'Parse result',data:{parsedSuccess:!!parsed,hasType:!!parsed?.type,hasStrengths:!!parsed?.strengths,hasNextSteps:!!parsed?.nextSteps},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'FRONTEND'})}).catch(()=>{});
      // #endregion
      
      // Validate the parsed object has required fields
      if (parsed && parsed.type && (parsed.strengths || parsed.nextSteps)) {
        // #region agent log
        fetch('http://127.0.0.1:7247/ingest/d84be03b-cc5f-4a51-8624-1abff965b9ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAssessment.ts:162',message:'AI profile SUCCESS',data:{type:parsed.type,strengthsCount:parsed.strengths?.length,nextStepsCount:parsed.nextSteps?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'FRONTEND'})}).catch(()=>{});
        // #endregion
        setProfile({
          type: parsed.type || 'AI Builder',
          description: parsed.description || "You're on a unique AI journey with significant potential.",
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Strategic thinking', 'Leadership drive', 'Growth mindset'],
          nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : ['Book a Builder Session to map your first AI system'],
          recommendedProduct: parsed.recommendedProduct || 'Builder Session',
          productLink: parsed.productLink || '/builder-session',
          frameworkUsed: parsed.frameworkUsed,
        });
        return;
      }
      
      throw new Error('Invalid AI response structure');
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d84be03b-cc5f-4a51-8624-1abff965b9ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAssessment.ts:180',message:'FALLBACK triggered',data:{errorMessage:err instanceof Error ? err.message : String(err),totalScore},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'FRONTEND'})}).catch(()=>{});
      // #endregion
      console.error('AI profile generation failed:', err);
      // Fallback to score-based profile
      let fallbackProfile: BuilderProfile;
      
      if (totalScore <= 4) {
        fallbackProfile = {
          type: 'Curious Explorer',
          description: "You're at the beginning of your AI journey. You see the potential but need a structured entry point.",
          strengths: ['Open mindset', 'Willingness to learn', 'Recognition of AI importance'],
          nextSteps: [
            'Start with a 1:1 Builder Session to build your first system',
            'Focus on one high-impact use case',
            'Build confidence through hands-on practice',
          ],
          recommendedProduct: 'Builder Session',
          productLink: '/builder-session',
        };
      } else if (totalScore <= 7) {
        fallbackProfile = {
          type: 'Strategic Builder',
          description: "You're actively experimenting and ready to systematize your approach.",
          strengths: ['Hands-on experience', 'Understanding of possibilities', 'Ready for structure'],
          nextSteps: [
            'Join AI Literacy-to-Influence to build working systems',
            'Develop a personal AI operating system',
            'Create reusable frameworks for your work',
          ],
          recommendedProduct: 'AI Literacy-to-Influence',
          productLink: '/builder-sprint',
        };
      } else {
        fallbackProfile = {
          type: 'Transformation Leader',
          description: "You're thinking at scale and ready to transform how your team works.",
          strengths: ['Strategic vision', 'Implementation experience', 'Leadership mandate'],
          nextSteps: [
            'Run an AI Leadership Lab for your executive team',
            'Build organization-wide AI capabilities',
            'Create a 90-day transformation roadmap',
          ],
          recommendedProduct: 'AI Leadership Lab',
          productLink: '/leadership-lab',
        };
      }
      setProfile(fallbackProfile);
    } finally {
      setIsGenerating(false);
    }
  }, [answers]);

  const nextQuestion = useCallback(() => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateProfile();
    }
  }, [currentStep, generateProfile]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setAnswers({});
    setProfile(null);
    setError(null);
  }, []);

  return {
    currentStep,
    questions: QUESTIONS,
    answers,
    profile,
    isGenerating,
    error,
    answerQuestion,
    nextQuestion,
    reset,
  };
};
