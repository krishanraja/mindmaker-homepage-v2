const StatsSection = () => {
  const stats = [
    {
      number: "90+",
      label: "AI product strategies delivered to media organizations",
    },
    {
      number: "50+", 
      label: "Executive seminars & keynotes on automation futures",
    },
    {
      number: "16",
      label: "Years of proven expertise in tech & AI transformation",
    },
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title">The Definitive AI Literacy & Strategic Advisory Firm</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="stat-number mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="stat-label">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;