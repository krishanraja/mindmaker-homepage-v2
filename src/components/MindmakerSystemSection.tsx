import { Brain, Target, Zap, TrendingUp, RefreshCw } from "lucide-react";

const MindmakerSystemSection = () => {
  const systemSteps = [
    {
      number: "01",
      title: "LITERACY",
      description: "See AI through the lens of strategy, not hype",
      icon: Brain,
    },
    {
      number: "02",
      title: "ALIGNMENT",
      description: "30-day sprint to diagnose and design leverage points",
      icon: Target,
    },
    {
      number: "03",
      title: "ACTION",
      description: "Apply AI to real business challenges with safe practice space",
      icon: Zap,
    },
    {
      number: "04",
      title: "ROI",
      description: "Measure decision velocity, leverage ratio, innovation cadence",
      icon: TrendingUp,
    },
    {
      number: "05",
      title: "REINFORCEMENT",
      description: "Quarterly performance tracking with AI Leadership Index™",
      icon: RefreshCw,
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
      <div className="container-width">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="text-foreground">
              Not a course. Not a workshop.
            </span>
            <br />
            <span className="text-primary">
              A compounding performance system.
            </span>
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto font-medium">
            Built in, not bolted on.
          </p>
        </div>

        {/* System Loop Visualization */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
            {systemSteps.map((step, index) => {
              const IconComponent = step.icon;
              const isLast = index === systemSteps.length - 1;
              
              return (
                <div key={index} className="relative">
                  <div 
                    className="glass-card p-6 h-full flex flex-col items-center text-center fade-in-up group hover:scale-105 transition-all duration-300"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    
                    <div className="text-xs font-bold text-primary/60 mb-2">
                      {step.number}
                    </div>
                    
                    <h3 className="text-sm font-bold uppercase tracking-wide text-foreground mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow connector for desktop */}
                  {!isLast && (
                    <div className="hidden md:block absolute top-1/2 -right-1 transform -translate-y-1/2 z-10">
                      <div className="text-primary/40 text-2xl">→</div>
                    </div>
                  )}
                  
                  {/* Downward arrow for mobile */}
                  {!isLast && (
                    <div className="md:hidden flex justify-center my-2">
                      <div className="text-primary/40 text-2xl">↓</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Loop back arrow */}
          <div className="flex justify-center mt-8">
            <div className="glass-card px-6 py-3 inline-flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-primary animate-spin" style={{animationDuration: '3s'}} />
              <span className="text-sm font-semibold text-foreground">Continuous Performance Loop</span>
            </div>
          </div>
        </div>

        {/* Key Differentiator */}
        <div className="max-w-3xl mx-auto text-center fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="glass-card p-8">
            <p className="text-lg md:text-xl font-medium text-foreground mb-4">
              "Most AI training dies in a graveyard of slide decks and forgotten demos."
            </p>
            <p className="text-base text-muted-foreground">
              Mindmaker builds the human capability that sits between algorithms and outcomes — 
              turning literacy into compounding performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MindmakerSystemSection;
