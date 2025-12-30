import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { User, Lightbulb, Map, TrendingUp, Mic } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

type DialogType = 'quiz' | 'decision' | 'friction' | 'portfolio' | null;

interface ToolsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToolClick: (toolId: DialogType) => void;
}

interface InteractiveCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  delay?: number;
  hasVoice?: boolean;
}

const InteractiveCard = ({ icon, title, subtitle, description, onClick, delay = 0, hasVoice = true }: InteractiveCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="premium-card flex-1 flex flex-col p-6 cursor-pointer group relative overflow-hidden rounded-2xl"
        onClick={onClick}
      >
        {/* Animated gradient border effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--mint) / 0.3) 0%, transparent 50%, hsl(var(--mint) / 0.2) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint/30 to-mint/10 flex items-center justify-center shadow-lg shadow-mint/10"
                animate={isHovered ? { scale: 1.05, rotate: 3 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {icon}
              </motion.div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{title}</h3>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            
            {/* Voice indicator badge */}
            {hasVoice && (
              <motion.div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint/10 border border-mint/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.3 }}
              >
                <Mic className="w-3 h-3 text-mint" />
                <span className="text-[10px] font-medium text-mint-dark">Voice</span>
              </motion.div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
          
          <div className="mt-auto">
            <Button 
              variant="mint" 
              className="w-full group/btn relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Open Tool
                <motion.span
                  animate={isHovered ? { x: 4 } : { x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.span>
              </span>
            </Button>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-mint/20 to-transparent rotate-45"
            animate={isHovered ? { scale: 1.5, opacity: 1 } : { scale: 1, opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Mobile carousel card - more compact with glass morphism
const MobileInteractiveCard = ({ icon, title, subtitle, description, onClick, hasVoice = true }: InteractiveCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <div 
        className="h-full flex flex-col p-5 cursor-pointer rounded-2xl relative overflow-hidden"
        onClick={onClick}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--card) / 0.95), hsl(var(--mint) / 0.05))',
          backdropFilter: 'blur(12px)',
          border: '2px solid hsl(var(--mint) / 0.3)',
          boxShadow: '0 8px 32px hsl(var(--mint) / 0.1), inset 0 1px 0 hsl(var(--mint) / 0.1)',
        }}
      >
        {/* Voice indicator */}
        {hasVoice && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-mint/15 border border-mint/25">
            <Mic className="w-2.5 h-2.5 text-mint" />
            <span className="text-[9px] font-medium text-mint-dark">Voice</span>
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-mint/30 to-mint/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight">{title}</h3>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
          {description}
        </p>
        
        <Button 
          variant="mint" 
          className="w-full"
          size="default"
        >
          Open Tool →
        </Button>
      </div>
    </motion.div>
  );
};

export const ToolsDrawer = ({ open, onOpenChange, onToolClick }: ToolsDrawerProps) => {
  const isMobile = useIsMobile();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const cards = [
    {
      id: 'quiz' as const,
      icon: <User className="w-5 h-5 text-mint-dark" />,
      title: "Builder Profile Quiz",
      subtitle: "60-second assessment",
      description: "Where are you on your AI journey? Take a quick assessment to get personalized recommendations."
    },
    {
      id: 'decision' as const,
      icon: <Lightbulb className="w-5 h-5 text-mint-dark" />,
      title: "AI Decision Helper",
      subtitle: "Instant clarity",
      description: "Stuck on an AI decision? Get structured advice and a clear next step right now."
    },
    {
      id: 'friction' as const,
      icon: <Map className="w-5 h-5 text-mint-dark" />,
      title: "Friction Map Builder",
      subtitle: "Map your time sink",
      description: "Visualize your biggest friction point and see how AI can help you reclaim your time."
    },
    {
      id: 'portfolio' as const,
      icon: <TrendingUp className="w-5 h-5 text-mint-dark" />,
      title: "Model out your starting points",
      subtitle: "Build your AI portfolio",
      description: "Select your weekly tasks and see your personalized transformation roadmap."
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-sm font-bold italic text-mint-dark dark:text-mint text-center tracking-widest">
            IDEATE WITH MINDMAKER AI
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-1 gap-4">
            {cards.map((card, index) => (
              <InteractiveCard
                key={card.id}
                icon={card.icon}
                title={card.title}
                subtitle={card.subtitle}
                description={card.description}
                onClick={() => {
                  onToolClick(card.id);
                  onOpenChange(false);
                }}
                delay={0.1 * (index + 1)}
                hasVoice={true}
              />
            ))}
          </div>

          {/* Mobile: Swipe Carousel */}
          <div className="md:hidden">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "center",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent>
                {cards.map((card) => (
                  <CarouselItem key={card.id} className="basis-[85%]">
                    <MobileInteractiveCard
                      icon={card.icon}
                      title={card.title}
                      subtitle={card.subtitle}
                      description={card.description}
                      onClick={() => {
                        onToolClick(card.id);
                        onOpenChange(false);
                      }}
                      hasVoice={true}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'w-8 bg-mint' 
                      : 'w-2 bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

