import { Award, Users, Zap } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      number: "90+",
      label: "AI product strategies delivered",
      description: "to media & enterprise organizations",
      icon: Award,
    },
    {
      number: "50+", 
      label: "Executive seminars delivered",
      description: "on automation & AI futures",
      icon: Users,
    },
    {
      number: "16",
      label: "Years of proven expertise",
      description: "in tech & AI transformation",
      icon: Zap,
    },
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container-width">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            The Definitive AI Literacy &{" "}
            <span className="text-primary">
              Strategic Advisory
            </span>{" "}
            Firm
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Proven track record of transforming enterprises from AI confusion to competitive advantage
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="glass-card text-center p-6 group fade-in-up hover:scale-105 transition-all duration-300" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-8 w-8" />
              </div>
              
              <div className="text-4xl font-semibold text-foreground group-hover:scale-110 transition-transform duration-300 mb-4">
                {stat.number}
              </div>
              
              <div className="text-lg font-semibold text-foreground mb-2">
                {stat.label}
              </div>
              
              <div className="text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;