import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";
import { BuilderAssessment } from "@/components/Interactive/BuilderAssessment";
import { FrictionMapBuilder } from "@/components/Interactive/FrictionMapBuilder";
import { TryItWidget } from "@/components/Interactive/AIDecisionHelper";
import { PortfolioBuilder } from "@/components/Interactive/PortfolioBuilder";
import { X, Mic, Crown, Wrench, Users } from "lucide-react";
import { Dialog, DialogWizardContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { ToolsDrawerButton } from "@/components/ToolsDrawerButton";

type DialogType = 'quiz' | 'decision' | 'friction' | 'portfolio' | null;

// ICP Slider Component with shimmering borders
const ICPSlider = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isMobile = useIsMobile();

  const icps = [
    {
      id: 'hands-off',
      icon: Crown,
      title: 'HANDS-OFF LEADERS',
      description: 'AI systems, authority, and ideas. Deploy working systems without hands-on building.',
    },
    {
      id: 'hands-on',
      icon: Wrench,
      title: 'HANDS-ON BUILDERS',
      description: 'Build alongside AI. Create weapons-grade GTM engines, content engines, and apps.',
    },
    {
      id: 'teams',
      icon: Users,
      title: 'TEAMS NEEDING TRANSFORMATION',
      description: 'Sharpen communal AI literacy before committing. Stop wasting your one bullet.',
    },
  ];

  return (
    <div className="mb-12 md:mb-16">
      {/* Desktop: Horizontal Slider with visible previews */}
      <div className="hidden md:block">
        <div className="relative max-w-6xl mx-auto px-8">
          <div className="flex items-center gap-6 overflow-hidden">
            {icps.map((icp, index) => {
              const IconComponent = icp.icon;
              const isSelected = selectedIndex === index;
              const offset = index - selectedIndex;
              const scale = isSelected ? 1 : 0.9;
              const opacity = Math.abs(offset) <= 1 ? 1 : 0.4;
              
              return (
                <motion.div
                  key={icp.id}
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedIndex(index)}
                  initial={false}
                  animate={{
                    scale,
                    opacity,
                    x: offset * 20,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative p-6 rounded-2xl bg-card border-2 overflow-hidden group" style={{ minHeight: '200px' }}>
                    {/* Subtle shimmer border effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        border: isSelected ? '2px solid hsl(var(--mint) / 0.4)' : '2px solid hsl(var(--border))',
                        boxShadow: isSelected
                          ? '0 0 15px hsl(var(--mint) / 0.15), inset 0 0 15px hsl(var(--mint) / 0.08)'
                          : 'none',
                      }}
                      animate={{
                        boxShadow: isSelected
                          ? [
                              '0 0 15px hsl(var(--mint) / 0.15), inset 0 0 15px hsl(var(--mint) / 0.08)',
                              '0 0 20px hsl(var(--mint) / 0.2), inset 0 0 18px hsl(var(--mint) / 0.1)',
                              '0 0 15px hsl(var(--mint) / 0.15), inset 0 0 15px hsl(var(--mint) / 0.08)',
                            ]
                          : 'none',
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          className="w-16 h-16 rounded-xl bg-gradient-to-br from-mint/30 to-mint/10 flex items-center justify-center"
                          animate={isSelected ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <IconComponent className="w-8 h-8 text-mint" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-mint-dark dark:text-mint mb-1">{icp.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-foreground/80 leading-relaxed">{icp.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-6">
            {icps.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  selectedIndex === index ? 'w-8 bg-mint' : 'w-2 bg-muted-foreground/30'
                }`}
                aria-label={`Select ${icps[index].title}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Full-width swipeable cards */}
      <div className="md:hidden">
        <Carousel
          setApi={(api) => {
            if (api) {
              api.on("select", () => {
                setSelectedIndex(api.selectedScrollSnap());
              });
            }
          }}
          opts={{
            align: "center",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {icps.map((icp, index) => {
              const IconComponent = icp.icon;
              return (
                <CarouselItem key={icp.id} className="basis-full">
                  <div className="relative p-6 rounded-2xl bg-card border-2 overflow-hidden mx-2" style={{ minHeight: '200px' }}>
                    {/* Subtle shimmer border effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        border: '2px solid hsl(var(--mint) / 0.4)',
                        boxShadow: '0 0 15px hsl(var(--mint) / 0.15), inset 0 0 15px hsl(var(--mint) / 0.08)',
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 15px hsl(var(--mint) / 0.15), inset 0 0 15px hsl(var(--mint) / 0.08)',
                          '0 0 20px hsl(var(--mint) / 0.2), inset 0 0 18px hsl(var(--mint) / 0.1)',
                          '0 0 15px hsl(var(--mint) / 0.15), inset 0 0 15px hsl(var(--mint) / 0.08)',
                        ],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-mint/30 to-mint/10 flex items-center justify-center">
                          <IconComponent className="w-8 h-8 text-mint" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-mint-dark dark:text-mint mb-1">{icp.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-foreground/80 leading-relaxed">{icp.description}</p>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {icps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                selectedIndex === index ? 'w-8 bg-mint' : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TheProblem = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { elementRef: triggerRef, isVisible } = useScrollTrigger({ threshold: 0.2 });
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const isMobile = useIsMobile();

  const getDialogTitle = () => {
    switch (dialogType) {
      case 'quiz': return 'Builder Profile Quiz';
      case 'decision': return 'AI Decision Helper';
      case 'friction': return 'Friction Map Builder';
      case 'portfolio': return 'Model out your starting points';
      default: return '';
    }
  };

  const renderDialogContent = () => {
    switch (dialogType) {
      case 'quiz':
        return <BuilderAssessment compact={false} onClose={() => setDialogType(null)} />;
      case 'decision':
        return <TryItWidget compact={false} onClose={() => setDialogType(null)} />;
      case 'friction':
        return <FrictionMapBuilder compact={false} onClose={() => setDialogType(null)} />;
      case 'portfolio':
        return <PortfolioBuilder compact={false} onClose={() => setDialogType(null)} />;
      default:
        return null;
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="section-padding bg-muted/30 relative overflow-hidden"
    >
      {/* Background GIF overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(/mindmaker-background.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-mint/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-mint/5 rounded-full blur-3xl pointer-events-none" />
      
      <div ref={triggerRef as any} className="container-width relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground dark:text-foreground">
              Boss the boardroom confidently.
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground dark:text-foreground/90 max-w-3xl mx-auto mb-8">
              Three paths. One outcome: confident boardroom leadership.
            </p>
          </motion.div>

          {/* ICP Heading */}
          <h3 className="text-sm font-bold italic text-mint-dark dark:text-mint text-center tracking-widest mb-10">
            WHO DOES MINDMAKER HELP?
          </h3>

          {/* ICP Slider */}
          <ICPSlider />
        </div>
      </div>

      {/* Tools Drawer Button */}
      <ToolsDrawerButton onToolClick={setDialogType} />

      {/* Dialog for Interactive Components */}
      <Dialog open={dialogType !== null} onOpenChange={() => setDialogType(null)}>
        <DialogWizardContent className="sm:max-w-2xl sm:max-h-[85vh]" hideCloseButton={isMobile}>
          {/* Mobile: Header with close button integrated into tool */}
          {!isMobile && (
            <div className="shrink-0 p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{getDialogTitle()}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Powered by Mindmaker Methodology
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint/10 border border-mint/20">
                  <Mic className="w-3 h-3 text-mint" />
                  <span className="text-[10px] font-medium text-mint-dark">Voice Enabled</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 sm:p-6 sm:pt-4">
            {renderDialogContent()}
          </div>
        </DialogWizardContent>
      </Dialog>
    </section>
  );
};

export default TheProblem;
