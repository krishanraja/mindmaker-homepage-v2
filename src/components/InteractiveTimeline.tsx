import React, { useState, useEffect, useRef } from 'react';
import { Brain, Lightbulb, Target, Rocket, Zap, Users, Bot, Star } from 'lucide-react';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  impact: string;
  meaning: string;
  icon: React.ComponentType<{ className?: string }>;
  gradientStep: number;
}

const InteractiveTimeline = () => {
  const [activeItem, setActiveItem] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timelineData: TimelineItem[] = [
    {
      year: "1956",
      title: "AI is Born",
      description: "The term 'Artificial Intelligence' is coined at Dartmouth Conference",
      impact: "What this means for you:",
      meaning: "You're living in the age AI was always meant to reach - mass adoption.",
      icon: Brain,
      gradientStep: 0
    },
    {
      year: "1997", 
      title: "Deep Blue Beats Chess Master",
      description: "AI defeats world chess champion Garry Kasparov in historic match",
      impact: "What this means for you:",
      meaning: "AI excels at strategic thinking - learn to collaborate, not compete.",
      icon: Target,
      gradientStep: 1
    },
    {
      year: "2011",
      title: "Watson Wins Jeopardy!",
      description: "IBM's Watson defeats human champions at complex trivia",
      impact: "What this means for you:",
      meaning: "AI processes information instantly - your value is in interpretation and wisdom.",
      icon: Lightbulb,
      gradientStep: 2
    },
    {
      year: "2016",
      title: "AlphaGo's Breakthrough", 
      description: "AI masters the ancient game of Go through intuitive learning",
      impact: "What this means for you:",
      meaning: "AI can be creative and intuitive - embrace hybrid human-AI collaboration.",
      icon: Zap,
      gradientStep: 3
    },
    {
      year: "2020",
      title: "GPT-3 Revolution",
      description: "AI begins writing, coding, and creating at human-level quality",
      impact: "What this means for you:",
      meaning: "AI is your creative partner - focus on prompting, editing, and strategic direction.",
      icon: Rocket,
      gradientStep: 4
    },
    {
      year: "2022",
      title: "ChatGPT Goes Viral",
      description: "1 million users in 5 days - AI enters mainstream consciousness",
      impact: "What this means for you:",
      meaning: "AI literacy is now as essential as digital literacy was in the 90s.",
      icon: Users,
      gradientStep: 5
    },
    {
      year: "2024",
      title: "AI Agents Emerge",
      description: "AI systems begin completing complex multi-step autonomous tasks",
      impact: "What this means for you:",
      meaning: "The future belongs to those who can orchestrate AI agents effectively.",
      icon: Bot,
      gradientStep: 6
    },
    {
      year: "2025",
      title: "Your AI Literacy Journey",
      description: "You decide how AI shapes your future - starting today",
      impact: "What this means for you:",
      meaning: "Right now, you have the power to shape how AI impacts your life and career.",
      icon: Star,
      gradientStep: 7
    }
  ];

  const currentItem = timelineData[activeItem];

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextItem();
    } else if (isRightSwipe) {
      prevItem();
    }
  };

  const nextItem = () => {
    setActiveItem((prev) => (prev + 1) % timelineData.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2000);
  };

  const prevItem = () => {
    setActiveItem((prev) => (prev - 1 + timelineData.length) % timelineData.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2000);
  };

  const handleDotClick = (index: number) => {
    setActiveItem(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleContentClick = () => {
    nextItem();
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;
    
    const interval = setInterval(() => {
      setActiveItem((prev) => {
        const next = (prev + 1) % timelineData.length;
        if (next === 0) {
          setIsAutoPlaying(false);
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, timelineData.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevItem();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextItem();  
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying(!isAutoPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAutoPlaying]);

  // Generate brand-aligned gradient based on progress
  const getGradientStyle = (step: number) => {
    const opacity = 0.15 + (step / timelineData.length) * 0.3;
    return {
      background: `linear-gradient(135deg, hsl(var(--primary) / ${opacity}) 0%, hsl(var(--accent) / ${opacity * 0.8}) 100%)`
    };
  };

  return (
    <div 
      ref={containerRef}
      className="w-full mx-auto mb-12 px-4 sm:px-6 select-none"
      style={{ width: '896px', maxWidth: '100%' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          The AI Revolution Timeline
        </h2>
        <p className="text-white/70 text-base sm:text-lg font-medium tracking-wide">
          Tap, swipe, or click to explore each milestone
        </p>
      </div>

      {/* Interactive Progress Bar */}
      <div className="mb-8">
        <div className="relative">
          {/* Progress track */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-white/60 to-white/40 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((activeItem + 1) / timelineData.length) * 100}%` }}
            />
          </div>
          
          {/* Interactive dots */}
          <div className="flex justify-between items-center mt-6">
            {timelineData.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`relative transition-all duration-500 transform ${
                  index === activeItem 
                    ? 'scale-125' 
                    : index < activeItem 
                      ? 'scale-100' 
                      : 'scale-75'
                }`}
                aria-label={`Go to ${timelineData[index].year}`}
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-500 ${
                  index === activeItem 
                    ? 'bg-white shadow-lg shadow-white/25 ring-2 ring-white/30 ring-offset-2 ring-offset-transparent' 
                    : index < activeItem 
                      ? 'bg-white/70 hover:bg-white/90' 
                      : 'bg-white/30 hover:bg-white/50'
                }`} />
                
                {/* Active indicator pulse */}
                {index === activeItem && (
                  <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed-Height Content Container */}
      <div className="relative h-[480px] sm:h-[420px] overflow-hidden">
        <div 
          className="glass-card-dark h-full transition-all duration-700 ease-out transform hover:scale-[1.02] cursor-pointer"
          style={getGradientStyle(currentItem.gradientStep)}
          onClick={handleContentClick}
          role="button"
          tabIndex={0}
          aria-label="Tap to advance to next milestone"
        >
          <div className="h-full flex flex-col justify-between p-6 sm:p-8" style={{ width: '100%' }}>
            {/* Top Section - Icon and Year */}
            <div className="flex flex-col items-center text-center space-y-6" style={{ height: '140px' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-700">
                <currentItem.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              
              <div className="font-gobold text-4xl sm:text-5xl md:text-6xl text-white transition-all duration-700 tracking-wider drop-shadow-lg">
                {currentItem.year}
              </div>
            </div>

            {/* Middle Section - Title and Description */}
            <div className="flex-1 flex flex-col justify-center text-center space-y-6 px-4" style={{ minHeight: '180px' }}>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight transition-all duration-700 tracking-tight drop-shadow-md">
                {currentItem.title}
              </h3>
              <p className="text-white/85 text-base sm:text-lg md:text-xl leading-relaxed transition-all duration-700 font-medium tracking-wide max-w-2xl mx-auto">
                {currentItem.description}
              </p>
            </div>

            {/* Bottom Section - Impact */}
            <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 sm:p-6 border border-white/10 transition-all duration-700" style={{ minHeight: '120px' }}>
              <h4 className="text-white/90 font-bold mb-3 text-sm sm:text-base text-center tracking-widest uppercase">
                {currentItem.impact}
              </h4>
              <p className="text-white text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-center tracking-wide drop-shadow-sm">
                {currentItem.meaning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Status Bar */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <div className="text-white/60 text-sm">
          {activeItem + 1} of {timelineData.length}
        </div>
        
        {isAutoPlaying && !isPaused && (
          <div className="flex items-center space-x-1 text-white/40 text-xs">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
            <span>Auto-playing</span>
          </div>
        )}
      </div>

      {/* Gesture Hint */}
      <div className="text-center mt-4">
        <p className="text-white/50 text-xs sm:text-sm">
          ← Swipe or use arrow keys to navigate →
        </p>  
      </div>
    </div>
  );
};

export default InteractiveTimeline;