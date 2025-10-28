import { AlertCircle, Lightbulb, CheckCircle, TrendingUp } from "lucide-react";

const WhyThisWorksSection = () => {
  const reasons = [
    {
      icon: AlertCircle,
      label: "The Problem",
      title: "Training that dies in slide decks",
      description: "Most AI training dies in a graveyard of slide decks and forgotten demos. Leaders sit through presentations but never practice leading with AI."
    },
    {
      icon: Lightbulb,
      label: "The Insight",
      title: "Practice beats theory",
      description: "Courses teach about AI. Leaders need to practice leading with AI. The gap between knowing and doing is where transformation happens."
    },
    {
      icon: CheckCircle,
      label: "The Solution",
      title: "Safe practice until it's instinct",
      description: "Mindmaker gives you a safe space to apply AI to real work until agentic thinking becomes instinct. Build capability, not just knowledge."
    },
    {
      icon: TrendingUp,
      label: "The Proof",
      title: "Measurable outcomes",
      description: "Leaders save 5-10 hrs/week. Investors halve failed pilot spend. Partners unlock new revenue. Performance tracked quarterly."
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-muted/30 via-background to-primary/5">
      <div className="container-width">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Why This Works</span>
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            The contrarian approach that turns AI literacy into compounding performance
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reasons.map((reason, index) => {
              const IconComponent = reason.icon;
              return (
                <div 
                  key={index}
                  className="glass-card p-8 fade-in-up hover:scale-105 transition-all duration-300"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary/60 tracking-wider mb-1">
                        {reason.label}
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        {reason.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Closing Statement */}
          <div className="mt-12 text-center fade-in-up" style={{animationDelay: '0.5s'}}>
            <div className="glass-card p-8 md:p-12">
              <p className="text-xl md:text-2xl font-bold text-foreground mb-4">
                "The market doesn't need more AI courses."
              </p>
              <p className="text-lg text-muted-foreground">
                It needs infrastructure that turns literacy into leverage — 
                and leaders who can operate at the speed of AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyThisWorksSection;
