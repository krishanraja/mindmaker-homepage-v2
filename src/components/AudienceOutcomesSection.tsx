import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, ArrowRight } from "lucide-react";

const AudienceOutcomesSection = () => {
  const outcomes = [
    {
      audience: "Leaders/Founders",
      title: "AI Alignment Sprint",
      timeline: "30 Days",
      investment: "$5-10K",
      outcome: "Build AI-forward leadership confidence and speed of decision",
      benefits: [
        "Diagnose AI readiness across your org",
        "Align leadership team on AI strategy",
        "Design leverage points for measurable ROI",
        "Safe space to practice agentic thinking on real work",
        "Result: Save 5-10 hrs/week per leader"
      ],
      icon: Target,
      gradient: "from-primary to-primary-600",
      cta: "Start Your Sprint"
    },
    {
      audience: "Investors",
      title: "Portfolio License",
      timeline: "Annual Program",
      investment: "$20-50K/year",
      outcome: "Raise AI literacy across portfolios to de-risk funding",
      benefits: [
        "Portfolio-wide AI Leadership Index™ dashboard",
        "License to deploy sprints across companies",
        "Quarterly performance tracking",
        "Halve failed pilot spend",
        "Partner revenue share model"
      ],
      icon: TrendingUp,
      gradient: "from-accent to-accent-400",
      cta: "Explore Partner Program"
    },
    {
      audience: "Consultants/Educators",
      title: "Framework Partnership",
      timeline: "License Model",
      investment: "Custom",
      outcome: "Integrate the Mindmaker framework to accelerate transformation",
      benefits: [
        "License Mindmaker Method™ and Literacy-to-Leverage Loop™",
        "White-label sprint delivery frameworks",
        "Partner revenue share model",
        "Unlock new revenue streams",
        "Full partner enablement program"
      ],
      icon: Users,
      gradient: "from-primary to-accent",
      cta: "Become a Partner"
    },
  ];

  return (
    <section id="outcomes" className="section-padding bg-muted/30">
      <div className="container-width">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Three Distinct Paths.</span>
            <br />
            <span className="text-primary">One Performance System.</span>
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            Choose the engagement that fits your needs — from 30-day sprints to annual partnerships.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {outcomes.map((outcome, index) => {
            const IconComponent = outcome.icon;
            return (
              <div 
                key={index}
                className="glass-card p-8 fade-in-up hover:scale-105 transition-all duration-300 flex flex-col"
                style={{animationDelay: `${index * 0.15}s`}}
              >
                {/* Header */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-primary/60 tracking-wider mb-3">
                    {outcome.audience}
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${outcome.gradient} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {outcome.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {outcome.outcome}
                  </p>
                </div>

                {/* Timeline & Investment */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                    <div className="text-sm font-semibold text-foreground">{outcome.timeline}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Investment</div>
                    <div className="text-sm font-semibold text-primary">{outcome.investment}</div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="flex-grow mb-6">
                  <div className="text-sm font-semibold text-foreground mb-3">What You Get:</div>
                  <ul className="space-y-2">
                    {outcome.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Button 
                  variant="hero-primary" 
                  size="lg" 
                  className="w-full group"
                  onClick={() => window.open('https://calendly.com/krish-raja/mindmaker-meeting', '_blank')}
                >
                  {outcome.cta}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center fade-in-up" style={{animationDelay: '0.5s'}}>
          <p className="text-sm text-muted-foreground">
            All pathways include access to AI Leadership Index™ performance tracking
          </p>
        </div>
      </div>
    </section>
  );
};

export default AudienceOutcomesSection;
