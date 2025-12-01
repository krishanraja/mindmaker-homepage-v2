import { useState, useEffect, useRef, RefObject } from 'react';

interface UseScrollLockOptions {
  lockThreshold: number;      // Viewport position to engage lock (0-1, e.g., 0.3 = 30% from top)
  onProgress: (delta: number) => void;  // Callback with scroll delta
  isComplete: boolean;        // When true, release lock
  enabled?: boolean;          // Allow disabling
}

interface UseScrollLockReturn {
  sectionRef: RefObject<HTMLElement>;
  isLocked: boolean;
}

export const useScrollLock = (options: UseScrollLockOptions): UseScrollLockReturn => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  const touchStartYRef = useRef(0);
  const scrollPositionRef = useRef(0);

  const { lockThreshold, onProgress, isComplete, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleWheel = (e: WheelEvent) => {
      if (!isLocked) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Send scroll delta to animation
      onProgress(e.deltaY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isLocked) return;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isLocked) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const currentY = e.touches[0].clientY;
      const delta = touchStartYRef.current - currentY;  // Positive = scroll down
      touchStartYRef.current = currentY;
      
      onProgress(delta);
    };

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate threshold position in pixels
      const thresholdY = viewportHeight * lockThreshold;
      
      // Should lock if section top is within threshold and animation not complete
      const shouldLock = rect.top <= thresholdY && rect.bottom > 0 && !isComplete;

      if (shouldLock && !isLocked) {
        // Engage lock
        setIsLocked(true);
        scrollPositionRef.current = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPositionRef.current}px`;
        document.body.style.width = '100%';
      } else if ((!shouldLock || isComplete) && isLocked) {
        // Release lock
        setIsLocked(false);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPositionRef.current);
      }
    };

    // Attach listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      
      // Cleanup: ensure body styles are reset
      if (isLocked) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    };
  }, [isLocked, isComplete, lockThreshold, onProgress, enabled]);

  return { sectionRef, isLocked };
};
