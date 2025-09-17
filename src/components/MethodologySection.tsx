import { Button } from "@/components/ui/button";
import { Search, Target, Rocket, TrendingUp, ArrowRight } from "lucide-react";

const MethodologySection = () => {
const phases = [
  {
    number: "01",
    title: "LEARN", 
    subtitle: "Discovery Sprint",
    goal: "Comprehensive diagnostic across team capabilities, tech stack, and objectives",
    description: "We assess your current AI literacy levels, technology infrastructure, and strategic objectives to identify gaps and opportunities for AI-driven competitive advantage.",
    benefits: [
      "Team AI literacy assessment",
      "Technology stack evaluation",
      "Market position analysis",
      "Strategic AI opportunity mapping"
    ],
    icon: Search,
    cta: "Start Learning Sprint"
  },
  {
    number: "02", 
    title: "DECIDE",
    subtitle: "Product Strategy",
    goal: "AI + data-led product planning aligned with corporate revenue strategy",
    description: "Transform discovery insights into concrete AI product strategies that deliver measurable business outcomes and sustainable competitive advantages.",
    benefits: [
      "AI-first product roadmap",
      "Revenue-aligned strategy framework",
      "Competitive differentiation blueprint", 
      "Investment prioritization matrix"
    ],
    icon: Target,
    cta: "Build Strategy Framework"
  },
  {
    number: "03",
    title: "ALIGN",
    subtitle: "Literacy & Operations", 
    goal: "Team education paired with revenue operations and GTM planning",
    description: "Build internal AI champions through comprehensive literacy programs while aligning operational processes for speed-to-market execution.",
    benefits: [
      "Executive and team AI education",
      "Workflow redesign and automation",
      "GTM process optimization",
      "Internal capability development"
    ],
    icon: Rocket,
    cta: "Align Your Teams"
  },
  {
    number: "04",
    title: "SELL",
    subtitle: "GTM Excellence",
    goal: "Agentic AI pricing, monetization, and automated sales & marketing systems",
    description: "Deploy AI-powered go-to-market systems that automate sales processes, optimize pricing strategies, and create scalable revenue generation engines.",
    benefits: [
      "AI-powered pricing optimization",
      "Automated sales and marketing systems", 
      "Revenue generation at scale",
      "Measurable ROI and growth metrics"
    ],
    icon: TrendingUp,
    cta: "Launch GTM Excellence"
  }
];

  return (
    <section className="section-padding bg-muted">
      <div className="container-width">
        <div className="text-center mb-20 fade-in-up">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
            LEARN → DECIDE → ALIGN → SELL
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            Our proven literacy-first methodology transforms leadership teams from AI-confused to AI-confident. 
            Each phase builds strategic capability while delivering measurable business outcomes.
          </p>
        </div>

        <div className="space-y-24">
          {phases.map((phase, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center fade-in-up ${
              index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
            }`} style={{animationDelay: `${index * 0.2}s`}}>
              
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold text-primary">
                    {phase.number}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide">{phase.title}</h3>
                    <p className="text-sm font-normal leading-relaxed text-muted-foreground">{phase.subtitle}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-foreground mb-3">Goal:</h4>
                  <p className="text-sm font-normal leading-relaxed text-muted-foreground">{phase.goal}</p>
                </div>
                
                <p className="text-sm font-normal leading-relaxed text-muted-foreground mb-8">
                  {phase.description}
                </p>
                
                <div className="mb-8">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-foreground mb-4">Key Benefits:</h4>
                  <ul className="space-y-3">
                    {phase.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm font-normal leading-relaxed text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button className="bg-primary text-white hover:bg-primary-600 focus:ring-2 focus:ring-ring group">
                  {phase.cta}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              {/* Visual */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                <div className="glass-card p-12 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-primary text-white rounded-2xl mb-8">
                    <phase.icon className="h-12 w-12" />
                  </div>
                  
                  <div className="text-6xl font-bold text-primary mb-4">
                    {phase.number}
                  </div>
                  
                  <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    {phase.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;