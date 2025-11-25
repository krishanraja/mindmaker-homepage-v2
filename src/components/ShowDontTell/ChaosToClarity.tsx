import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type Category = "Technical" | "Commercial" | "Organizational" | "Competitive";

interface Concept {
  id: number;
  label: string;
  category: Category;
}

const concepts: Concept[] = [
  // Technical (4)
  { id: 1, label: "Context windows", category: "Technical" },
  { id: 2, label: "Tokens", category: "Technical" },
  { id: 3, label: "RAG", category: "Technical" },
  { id: 4, label: "Prompt engineering", category: "Technical" },
  
  // Commercial (4)
  { id: 5, label: "Vendor overpromises", category: "Commercial" },
  { id: 6, label: "ROI fog", category: "Commercial" },
  { id: 7, label: "Pilot purgatory", category: "Commercial" },
  { id: 8, label: "Integration debt", category: "Commercial" },
  
  // Organizational (4)
  { id: 9, label: "Misaligned teams", category: "Organizational" },
  { id: 10, label: "Rogue AI experiments", category: "Organizational" },
  { id: 11, label: "Change fatigue", category: "Organizational" },
  { id: 12, label: "Shadow IT", category: "Organizational" },
  
  // Competitive (4)
  { id: 13, label: "Competitor noise", category: "Competitive" },
  { id: 14, label: "Board pressure", category: "Competitive" },
  { id: 15, label: "Fear of betting wrong", category: "Competitive" },
  { id: 16, label: "Rapid obsolescence", category: "Competitive" },
];

const ChaosToClarity = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress through section
      const scrolled = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight + windowHeight)));
      
      setScrollProgress(progress);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Faster animation: 0.15-0.5 instead of 0.2-0.8
  const organizationLevel = 
    scrollProgress < 0.15 ? 0 : 
    scrollProgress > 0.5 ? 1 : 
    (scrollProgress - 0.15) / 0.35;

  // Chaotic random positions
  const getRandomPosition = (id: number) => {
    const seed = id * 123.456;
    const randX = (Math.sin(seed) * 10000) % 1;
    const randY = (Math.cos(seed * 1.5) * 10000) % 1;
    
    return {
      x: 10 + randX * 80,
      y: 10 + randY * 80,
      rotation: (randX - 0.5) * 30,
    };
  };

  // Organized 2x2 grid positions
  const getOrganizedPosition = (concept: Concept, index: number) => {
    const categoryPositions = {
      Technical: { baseX: 20, baseY: 25 },
      Commercial: { baseX: 60, baseY: 25 },
      Organizational: { baseX: 20, baseY: 65 },
      Competitive: { baseX: 60, baseY: 65 },
    };

    const categoryIndex = concepts
      .filter(c => c.category === concept.category)
      .findIndex(c => c.id === concept.id);

    const base = categoryPositions[concept.category];
    const offsetX = (categoryIndex % 2) * 15;
    const offsetY = Math.floor(categoryIndex / 2) * 8;

    return {
      x: base.baseX + offsetX - 10,
      y: base.baseY + offsetY - 4,
      rotation: 0,
    };
  };

  // Interpolate between chaos and clarity
  const getPosition = (concept: Concept, index: number) => {
    const chaos = getRandomPosition(concept.id);
    const clarity = getOrganizedPosition(concept, index);
    
    return {
      x: chaos.x + (clarity.x - chaos.x) * organizationLevel,
      y: chaos.y + (clarity.y - chaos.y) * organizationLevel,
      rotation: chaos.rotation * (1 - organizationLevel),
    };
  };

  // Dynamic headline based on organization level
  const getHeadline = () => {
    if (organizationLevel < 0.3) return "AI feels like chaos";
    if (organizationLevel < 0.7) return "Organizing your acceleration plan...";
    return "Your individualized acceleration plan";
  };

  const getCategoryColor = (category: Category) => {
    const colors = {
      Technical: "text-muted-foreground",
      Commercial: "text-amber-600 dark:text-amber-400",
      Organizational: "text-red-600 dark:text-red-400",
      Competitive: "text-purple-600 dark:text-purple-400",
    };
    return colors[category];
  };

  return (
    <section 
      ref={sectionRef} 
      className="section-padding bg-background py-32 relative overflow-hidden"
    >
      <div className="container-width">
        {/* Dynamic Headline */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 transition-all duration-500"
            style={{
              fontWeight: 300 + (organizationLevel * 600),
              opacity: 0.7 + (organizationLevel * 0.3),
            }}
          >
            {getHeadline()}
          </h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            animate={{ opacity: organizationLevel > 0.7 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            We transform the overwhelming complexity into a clear, actionable roadmap.
          </motion.p>
        </motion.div>

        {/* Category Labels - fade in when organized */}
        <motion.div 
          className="grid grid-cols-2 gap-8 max-w-4xl mx-auto mb-8"
          animate={{ opacity: organizationLevel > 0.5 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {["Technical", "Commercial", "Organizational", "Competitive"].map((cat) => (
            <div 
              key={cat} 
              className={`text-sm font-bold uppercase tracking-wider text-center ${getCategoryColor(cat as Category)}`}
            >
              {cat}
            </div>
          ))}
        </motion.div>

        {/* Concepts Visualization */}
        <div className="relative h-[500px] md:h-[600px] max-w-4xl mx-auto">
          {concepts.map((concept, index) => {
            const pos = getPosition(concept, index);
            
            return (
              <motion.div
                key={concept.id}
                className={`absolute px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border whitespace-nowrap
                  ${organizationLevel > 0.7 ? 'bg-mint/10 border-mint/30 text-foreground' : 'bg-muted/50 border-border text-muted-foreground'}`}
                animate={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  rotate: pos.rotation,
                  opacity: 0.6 + (organizationLevel * 0.4),
                }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                  mass: 0.5,
                }}
                style={{
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {concept.label}
              </motion.div>
            );
          })}
        </div>

        {/* Final Message */}
        <motion.div 
          className="text-center mt-16"
          animate={{ opacity: organizationLevel > 0.8 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg text-mint font-semibold">
            Clear. Structured. Actionable.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ChaosToClarity;
