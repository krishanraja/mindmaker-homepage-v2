import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface ScreenData {
  type: 'problem' | 'opportunity';
  video: string;
  headline: string;
  overlayOpacity: number;
}

const screens: ScreenData[] = [
  {
    type: 'problem',
    video: '/problem 1.mp4',
    headline: 'AI is being bought like software and implemented like labor.',
    overlayOpacity: 0.75,
  },
  {
    type: 'opportunity',
    video: '/solution 1.mp4',
    headline: 'Leaders need to embrace AI, not delegate it.',
    overlayOpacity: 0.35,
  },
  {
    type: 'problem',
    video: '/problem 2.mp4',
    headline: 'Dashboard theatre blurs what real success looks like.',
    overlayOpacity: 0.75,
  },
  {
    type: 'opportunity',
    video: '/solution 2.mp4',
    headline: 'Leaders who build their own systems can\'t be fooled.',
    overlayOpacity: 0.35,
  },
  {
    type: 'problem',
    video: '/problem 3.mp4',
    headline: 'Leadership teams are looking to one another for the answer.',
    overlayOpacity: 0.75,
  },
  {
    type: 'opportunity',
    video: '/solution 3.mp4',
    headline: 'Teams aligned once can create compounding successes across the org.',
    overlayOpacity: 0.35,
  },
];

interface ScreenProps {
  screen: ScreenData;
  index: number;
}

const Screen = ({ screen, index }: ScreenProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div
      ref={ref}
      className="relative h-screen w-full snap-start snap-always overflow-hidden"
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src={screen.video} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${screen.overlayOpacity})`,
        }}
        aria-hidden="true"
      />

      {/* Text Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12">
        <motion.h2
          className={`max-w-[28rem] text-center font-display text-3xl font-normal leading-[1.15] tracking-tight sm:text-4xl sm:max-w-[32rem] md:text-5xl md:max-w-[36rem] lg:text-6xl lg:max-w-[40rem] ${
            screen.type === 'problem'
              ? 'text-white'
              : 'text-foreground'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1], // Custom easing for deliberate, calm motion
            delay: 0.2,
          }}
          tabIndex={0}
        >
          {screen.headline}
        </motion.h2>
      </div>
    </div>
  );
};

interface MobileScreenProps {
  screen: ScreenData;
  index: number;
}

const MobileScreen = ({ screen, index }: MobileScreenProps) => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src={screen.video} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${screen.overlayOpacity})`,
        }}
        aria-hidden="true"
      />

      {/* Text Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6">
        <motion.h2
          className={`max-w-[24rem] text-center font-display text-2xl font-normal leading-[1.15] tracking-tight sm:text-3xl sm:max-w-[28rem] md:text-4xl md:max-w-[32rem] ${
            screen.type === 'problem'
              ? 'text-white'
              : 'text-foreground'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2,
          }}
          tabIndex={0}
        >
          {screen.headline}
        </motion.h2>
      </div>
    </div>
  );
};

const TheProblem = () => {
  const isMobile = useIsMobile();

  // Mobile: Use Carousel for swipe-based paging
  if (isMobile) {
    return (
      <section className="relative w-full overflow-hidden" aria-label="Problem to opportunity journey">
        {/* Section Title */}
        <div className="container-width py-12 md:py-16">
          <h2 className="text-center font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Boss the boardroom confidently.
          </h2>
        </div>

        {/* Mobile Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: false,
            dragFree: false,
            containScroll: 'trimSnaps',
            duration: 25,
          }}
          orientation="vertical"
          className="h-screen w-full"
        >
          <CarouselContent className="h-screen -mt-0">
            {screens.map((screen, index) => (
              <CarouselItem key={index} className="h-screen basis-full pt-0">
                <MobileScreen screen={screen} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>
    );
  }

  // Desktop: Use CSS scroll-snap with natural page scroll
  return (
    <>
      {/* Section Title */}
      <div className="container-width py-12 md:py-16">
        <h2 className="text-center font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Boss the boardroom confidently.
        </h2>
      </div>

      {/* Scroll-Snap Screens */}
      <section 
        className="relative w-full snap-y snap-mandatory" 
        aria-label="Problem to opportunity journey"
      >
        {screens.map((screen, index) => (
          <Screen key={index} screen={screen} index={index} />
        ))}
      </section>
    </>
  );
};

export default TheProblem;
