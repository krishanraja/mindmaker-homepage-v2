import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { usePortfolio } from '@/hooks/usePortfolio';
import { TrendingUp, Download, ArrowRight } from 'lucide-react';
import { useSessionData } from '@/contexts/SessionDataContext';
import { generatePortfolioPDF } from '@/utils/pdfGenerator';

interface PortfolioBuilderProps {
  compact?: boolean;
}

export const PortfolioBuilder = ({ compact = false }: PortfolioBuilderProps) => {
  const { tasks, toggleTask, updateTaskHours, getPortfolioData } = usePortfolio();
  const [showResults, setShowResults] = useState(false);
  const portfolioData = getPortfolioData();
  const { setPortfolioBuilder } = useSessionData();

  useEffect(() => {
    if (showResults) {
      const portfolio = getPortfolioData();
      setPortfolioBuilder({
        selectedTasks: portfolio.tasks.map(t => ({
          name: t.name,
          hours: t.hoursPerWeek,
          savings: t.potentialSavings
        })),
        totalTimeSaved: portfolio.totalTimeSaved,
        totalCostSavings: portfolio.totalCostSavings
      });
    }
  }, [showResults, getPortfolioData, setPortfolioBuilder]);

  const handleGenerate = () => {
    if (portfolioData.tasks.length > 0) {
      setShowResults(true);
    }
  };

  const handleDownload = () => {
    const masterPrompts = generateMasterPrompts(portfolioData.tasks);
    generatePortfolioPDF({
      ...portfolioData,
      masterPrompts,
    });
  };

  if (showResults) {
    return (
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-mint/5 to-ink/5 border-2 border-mint">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-mint" />
            Your AI Portfolio
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
            Edit
          </Button>
        </div>

        <div className="space-y-6">
          {/* Tasks */}
          <div>
            <div className="text-xs font-bold text-muted-foreground mb-3">YOUR AI SYSTEMS</div>
            <div className="space-y-3">
              {portfolioData.tasks.map(task => (
                <div key={task.id} className="p-4 rounded-lg bg-background border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm">{task.name}</div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Saves</div>
                        <div className="text-lg font-bold text-mint-dark">{task.potentialSavings}h/wk</div>
                    </div>
                  </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Current: {task.hoursPerWeek}h/week</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.aiTools.map((tool, i) => (
                          <span key={i} className="px-2 py-0.5 bg-mint/10 text-mint-dark rounded-full text-xs">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Impact */}
          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-background">
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-dark">{portfolioData.totalTimeSaved}h</div>
              <div className="text-xs text-muted-foreground">Saved per week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold">${(portfolioData.totalCostSavings / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Value per month</div>
            </div>
          </div>

          {/* Roadmap */}
          <div>
            <div className="text-xs font-bold text-muted-foreground mb-3">IMPLEMENTATION ROADMAP</div>
            <div className="space-y-2">
              {portfolioData.implementationRoadmap.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-mint/20 text-mint-dark flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="pt-0.5">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              className="flex-1 bg-mint text-ink hover:bg-mint/90"
              onClick={() => window.location.href = '/builder-sprint'}
            >
              Build This Portfolio →
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 bg-background/50 backdrop-blur-sm border-2 border-mint/30 hover:border-mint transition-colors">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Model out your starting points</h3>
        <p className="text-sm text-muted-foreground">
          Select your weekly tasks and see your personalized transformation roadmap
        </p>
      </div>

      <div className="space-y-6">
        {tasks.map(task => (
          <div key={task.id} className="space-y-3 pb-6 border-b last:border-0">
            <div className="flex items-start gap-3">
              <Checkbox
                id={task.id}
                checked={task.selected}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-1"
              />
              <label htmlFor={task.id} className="flex-1 cursor-pointer">
                <div className="font-semibold text-sm">{task.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tools: {task.aiTools.slice(0, 2).join(', ')}
                </div>
              </label>
            </div>

            {task.selected && (
              <div className="ml-7 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs text-muted-foreground">
                  Hours per week: <span className="font-bold text-foreground">{task.hoursPerWeek}h</span>
                </label>
                <Slider
                  value={[task.hoursPerWeek]}
                  onValueChange={([value]) => updateTaskHours(task.id, value)}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                {task.hoursPerWeek > 0 && (
                  <div className="text-xs text-mint-dark font-semibold">
                    → Could save {task.potentialSavings}h per week
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={handleGenerate}
        size="lg"
        className="w-full mt-6 bg-mint text-ink hover:bg-mint/90 font-bold"
        disabled={portfolioData.tasks.length === 0}
      >
        Generate Portfolio
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </Card>
  );
};

// Generate master prompts based on selected tasks
function generateMasterPrompts(tasks: Array<{ name: string; aiTools: string[] }>) {
  const prompts: Array<{ title: string; prompt: string }> = [];
  
  tasks.forEach(task => {
    const taskLower = task.name.toLowerCase();
    
    if (taskLower.includes('email') || taskLower.includes('communication')) {
      prompts.push({
        title: `${task.name} Accelerator`,
        prompt: `You are my [YOUR_ROLE] communication assistant. I need to [SPECIFIC_TASK] for [RECIPIENT/AUDIENCE]. 

Context: [RELEVANT_BACKGROUND]
Tone: [professional/casual/urgent]
Key points to include: [POINT_1], [POINT_2]

Draft a response that is clear, actionable, and under [WORD_COUNT] words.`
      });
    } else if (taskLower.includes('report') || taskLower.includes('data')) {
      prompts.push({
        title: `${task.name} Generator`,
        prompt: `Analyze the following [DATA_TYPE] and create a [REPORT_TYPE] report:

Data: [PASTE_DATA_OR_DESCRIBE]

Include:
1. Executive summary (3 sentences max)
2. Key metrics and trends
3. Anomalies or concerns
4. Recommended actions

Format for [AUDIENCE] with [FORMAL/CASUAL] tone.`
      });
    } else if (taskLower.includes('meeting') || taskLower.includes('notes')) {
      prompts.push({
        title: `${task.name} Optimizer`,
        prompt: `Process these meeting notes from a [MEETING_TYPE] meeting:

"[PASTE_NOTES]"

Create:
1. Executive summary (bullet points)
2. Decisions made
3. Action items (with owners and deadlines)
4. Open questions for follow-up
5. Key quotes worth remembering`
      });
    } else {
      prompts.push({
        title: `${task.name} Assistant`,
        prompt: `I am a [YOUR_ROLE] working on [SPECIFIC_TASK]. 

Context: [RELEVANT_BACKGROUND]
Constraints: [TIME/BUDGET/SCOPE_LIMITS]
Desired outcome: [WHAT_SUCCESS_LOOKS_LIKE]

Help me by providing:
1. A structured approach
2. Potential pitfalls to avoid
3. A draft output I can refine

Format for [INTENDED_USE].`
      });
    }
  });

  // Add a universal prompt if we have less than 2
  if (prompts.length < 2) {
    prompts.push({
      title: 'Strategic Decision Helper',
      prompt: `I need to make a decision about [DESCRIBE_DECISION].

Key factors: [FACTOR_1], [FACTOR_2], [FACTOR_3]
Constraints: [CONSTRAINTS]
Stakeholders: [WHO_IS_AFFECTED]

Provide:
1. Pros and cons analysis
2. Risk assessment
3. Your recommended path forward with reasoning
4. How to communicate this decision to stakeholders`
    });
  }

  return prompts;
}
