import { Button } from "@/components/ui/button";
import { Users, Briefcase, Zap } from "lucide-react";
import ResponsiveCardGrid from "@/components/ResponsiveCardGrid";

const AudienceOutcomesSection = () => {
  const outcomes = [
    {
      audience: "Enterprise Leaders",
      outcome: "Run & Future Proof",
      quote: "Transform from AI-anxious to AI-confident. Make strategic decisions with clarity and conviction.",
      reality: "Strategic AI roadmap, confident decision framework, effective risk mitigation, and team alignment",
      icon: Users,
      cta: "Executive Assessment"
    },
    {
      audience: "High Growth SMB",
      outcome: "Reclaim Purpose", 
      quote: "Stop chasing AI shiny objects. Focus on what matters: sustainable competitive advantage.",
      reality: "AI-integrated product-market fit, competitive differentiation, ROI-driven allocation, strong investor narrative",
      icon: Briefcase,
      cta: "High Growth Sprint"
    },
    {
      audience: "Teams", 
      outcome: "10x Your Value",
      quote: "Turn AI anxiety into career acceleration. Become the talent companies fight to keep.",
      reality: "Future-proof skills, AI productivity mastery, AI-first economy positioning, leadership confidence",
      icon: Zap,
      cta: "Team Program"
    },
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-16 bg-background">
      <div className="container-width">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-10 fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-4 sm:mb-5 lg:mb-4">
            <span className="text-success">
              Pick a Pathway
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground mx-auto px-4">
            Different audiences, different outcomes.<br className="sm:hidden" /> Same proven methodology<br className="sm:hidden" /> that delivers results.
          </p>
        </div>
        
        <ResponsiveCardGrid 
          desktopGridClass="grid grid-cols-1 md:grid-cols-3 gap-8"
          mobileCardHeight="h-[420px]"
        >
          {outcomes.map((outcome, index) => (
            <div key={index} className="card p-8 fade-in-up h-full flex flex-col" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success text-white rounded-xl mb-6">
                <outcome.icon className="h-8 w-8" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {outcome.audience}
              </h3>
              
              <h4 className="text-lg font-medium text-success mb-4">
                {outcome.outcome}
              </h4>
              
              <blockquote className="text-sm text-muted-foreground italic mb-4 leading-relaxed">
                "{outcome.quote}"
              </blockquote>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                <strong>Reality:</strong> {outcome.reality}
              </p>
              
              <Button 
                asChild
                size="lg"
                className="w-full bg-success hover:bg-success/90 text-white mt-auto min-h-[48px] text-sm sm:text-base font-semibold rounded-lg"
              >
                <a 
                  href={
                    outcome.cta === 'Executive Assessment' ? 'https://leaders.themindmaker.ai' :
                    outcome.cta === 'High Growth Sprint' ? 'https://smb.themindmaker.ai' :
                    outcome.cta === 'Team Program' ? 'https://teams.themindmaker.ai' :
                    '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {outcome.cta}
                </a>
              </Button>
            </div>
          ))}
        </ResponsiveCardGrid>
      </div>
    </section>
  );
};

export default AudienceOutcomesSection;