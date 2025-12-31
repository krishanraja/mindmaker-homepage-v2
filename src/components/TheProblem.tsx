import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface PanelData {
  problem: {
    video: string;
    headline: string;
    objectPosition?: string; // Custom positioning for video clipping
  };
  opportunity: {
    video: string;
    headline: string;
    objectPosition?: string; // Custom positioning for video clipping
  };
}

const panels: PanelData[] = [
  {
    problem: {
      video: '/problem 1.mp4',
      headline: 'AI is being bought like software and implemented like labor.',
      objectPosition: 'center center',
    },
    opportunity: {
      video: '/solution 1.mp4',
      headline: 'Successful leaders are embracing AI literacy, not delegating it.',
      objectPosition: 'center center',
    },
  },
  {
    problem: {
      video: '/problem 2.mp4',
      headline: 'Dashboard theatre blurs what real success looks like.',
      objectPosition: 'center center',
    },
    opportunity: {
      video: '/solution 2.mp4',
      headline: 'Leaders who build their own systems can\'t be fooled.',
      objectPosition: 'center center',
    },
  },
  {
    problem: {
      video: '/problem 3.mp4',
      headline: 'Leadership teams are looking to one another for the answer.',
      objectPosition: 'center center',
    },
    opportunity: {
      video: '/solution 3.mp4',
      headline: 'Teams aligned once can create compounding successes across the org.',
      objectPosition: 'center center',
    },
  },
];

interface PanelProps {
  panel: PanelData;
  index: number;
}

const Panel = ({ panel, index }: PanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [wipeProgress, setWipeProgress] = useState(0);
  const [isWiped, setIsWiped] = useState(false);
  const isInView = useInView(panelRef, { once: false, amount: 0.3 });
  const isMobile = useIsMobile();

  // Trigger wipe on scroll-in (mobile) or hover (desktop)
  useEffect(() => {
    if (isInView && !isWiped && isMobile) {
      // Auto-trigger on scroll-in for mobile
      const timer = setTimeout(() => {
        setIsWiped(true);
        setWipeProgress(1);
        if (containerRef.current) {
          containerRef.current.style.setProperty('--wipe-progress', '100%');
        }
      }, 500); // Small delay for better UX

      return () => clearTimeout(timer);
    }
  }, [isInView, isWiped, isMobile]);

  // Handle hover for desktop
  const handleMouseEnter = useCallback(() => {
    if (!isMobile && !isWiped) {
      setIsWiped(true);
      setWipeProgress(1);
      if (containerRef.current) {
        containerRef.current.style.setProperty('--wipe-progress', '100%');
      }
    }
  }, [isMobile, isWiped]);

  // Handle click/tap as alternative trigger
  const handleClick = useCallback(() => {
    if (!isWiped) {
      setIsWiped(true);
      setWipeProgress(1);
      if (containerRef.current) {
        containerRef.current.style.setProperty('--wipe-progress', '100%');
      }
    }
  }, [isWiped]);

  // Initialize CSS variable (start at 100% = fully hidden)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--wipe-progress', '100%');
    }
  }, []);

  return (
    <div
      ref={panelRef}
      className="relative h-[80vh] w-full overflow-hidden cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Panel ${index + 1}: ${panel.problem.headline}`}
    >
      {/* Problem Video Layer (Bottom - Always Visible) */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: panel.problem.objectPosition || 'center center',
          }}
          aria-hidden="true"
        >
          <source src={panel.problem.video} type="video/mp4" />
        </video>
        
        {/* Problem Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
          aria-hidden="true"
        />

        {/* Problem Text Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.2,
            }}
            className="max-w-[90%] text-center"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              padding: '1.5rem 2rem',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h2
              className="font-display text-xl sm:text-2xl md:text-3xl font-normal leading-[1.15] tracking-tight text-white"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6)',
              }}
            >
              {panel.problem.headline}
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Solution Video Layer (Top - Revealed via Wipe) */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          clipPath: 'inset(var(--wipe-progress, 100%) 0 0 0)',
          transition: isWiped ? 'clip-path 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
          willChange: 'clip-path',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: panel.opportunity.objectPosition || 'center center',
          }}
          aria-hidden="true"
        >
          <source src={panel.opportunity.video} type="video/mp4" />
        </video>
        
        {/* Opportunity Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
          aria-hidden="true"
        />

        {/* Opportunity Text Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={wipeProgress > 0.3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.3,
            }}
            className="max-w-[90%] text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '1.5rem 2rem',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h2
              className="font-display text-xl sm:text-2xl md:text-3xl font-normal leading-[1.15] tracking-tight text-foreground"
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              {panel.opportunity.headline}
            </h2>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const TheProblem = () => {
  return (
    <section className="relative w-full py-12 md:py-16" aria-label="Problem to opportunity journey">
      {/* Section Title */}
      <div className="container-width mb-12 md:mb-16">
        <h2 className="text-center font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Boss the boardroom confidently.
            </h2>
      </div>

      {/* Three Panel Grid */}
      <div className="container-width">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {panels.map((panel, index) => (
            <Panel key={index} panel={panel} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheProblem;
