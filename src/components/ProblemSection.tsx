import { AlertTriangle, Clock, DollarSign, Users } from "lucide-react";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";
import LiveStatsPopup from "@/components/LiveStatsPopup";
import ResponsiveCardGrid from "@/components/ResponsiveCardGrid";
import { useState, useEffect, useCallback } from "react";

const ProblemSection = () => {
  const { elementRef, isVisible } = useScrollTrigger({ threshold: 0.4 });
  const [showPopup, setShowPopup] = useState(false);

  // Show popup when section becomes visible
  useEffect(() => {
    if (isVisible) {
      setShowPopup(true);
    }
  }, [isVisible]);

  // Memoize onClose callback to prevent recreation
  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const audienceProblems = [
    {
      audience: "Leaders",
      problem: "Drowning in AI noise",
      quote: "I know AI will change everything, but I don't know where to start or who to trust",
      pain: "Revenue at risk from poor AI investments, competitors advancing through effective AI",
      icon: Users,
    },
    {
      audience: "Founders", 
      problem: "Existential competition fear",
      quote: "Every competitor seems to be 'AI-powered' - am I already too late?",
      pain: "Cash burn on ineffective AI tools while missing real competitive advantages, losing market position to AI-literate competitors",
      icon: AlertTriangle,
    },
    {
      audience: "Teams",
      problem: "Job displacement anxiety", 
      quote: "Will we still be relevant in an AI world? How do we future-proof our careers?",
      pain: "Career stagnation as AI-literate peers advance, missing AI leadership opportunities",
      icon: Clock,
    },
  ];

  return (
    <section ref={elementRef} className="section-padding bg-background">
      <div className="container-width">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="text-destructive">70% of GenAI pilots stall</span>
            <br />
            <span className="text-foreground">because leadership operates from hype, not capability</span>
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            You've been over-sold on AI literacy and under-delivered on AI leadership infrastructure.
          </p>
        </div>
        
        <ResponsiveCardGrid 
          desktopGridClass="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          className="mb-16"
        >
          {audienceProblems.map((item, index) => (
            <div key={index} className="card p-4 sm:p-6 lg:p-8 fade-in-up h-full flex flex-col" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive text-white rounded-xl mb-6">
                <item.icon className="h-8 w-8" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {item.audience}
              </h3>
              
              <h4 className="text-lg font-medium text-destructive mb-4">
                {item.problem}
              </h4>
              
              <blockquote className="text-sm text-muted-foreground italic mb-4 leading-relaxed">
                "{item.quote}"
              </blockquote>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Reality:</strong> {item.pain}
              </p>
            </div>
          ))}
        </ResponsiveCardGrid>

        {/* Quote Section */}
        <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto text-center fade-in-up">
          <blockquote className="text-xl md:text-2xl font-bold text-foreground mb-6">
            "Most teams sit through demos that fade."
          </blockquote>
          <p className="text-base md:text-lg text-muted-foreground">
            The market doesn't need more AI courses — it needs leaders who can lead with AI.
            That's why we built the Mindmaker system.
          </p>
        </div>
      </div>

      {/* Live Stats Popup */}
      <LiveStatsPopup 
        isVisible={showPopup} 
        onClose={handleClosePopup} 
      />
    </section>
  );
};

export default ProblemSection;