import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SpotlightProps {
  targetId: string;
  isActive: boolean;
  onComplete?: () => void;
  padding?: number;
}

const Spotlight = ({ targetId, isActive, onComplete, padding = 8 }: SpotlightProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      return;
    }

    const updatePosition = () => {
      const targetElement = document.getElementById(targetId);
      if (!targetElement) {
        setIsVisible(false);
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      setPosition({
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
      setIsVisible(true);
    };

    // Initial position
    updatePosition();

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    // Use ResizeObserver for dynamic content changes
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(targetElement);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
        resizeObserver.disconnect();
      };
    }
  }, [targetId, isActive, padding]);

  if (!isActive || !isVisible) return null;

  return createPortal(
    <AnimatePresence>
      {isActive && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9998] pointer-events-none"
        >
          {/* Dark overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Spotlight cutout */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="black" />
                <motion.rect
                  x={position.x}
                  y={position.y}
                  width={position.width}
                  height={position.height}
                  fill="white"
                  rx="8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="black"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Highlight border */}
          <motion.div
            className="absolute border-2 border-primary rounded-lg"
            style={{
              left: position.x,
              top: position.y,
              width: position.width,
              height: position.height,
              boxShadow: "0 0 0 4px hsl(var(--primary) / 0.2), 0 0 20px hsl(var(--primary) / 0.4)",
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />

          {/* Pulsing glow effect */}
          <motion.div
            className="absolute border-2 border-primary rounded-lg"
            style={{
              left: position.x,
              top: position.y,
              width: position.width,
              height: position.height,
            }}
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0.7)",
                "0 0 0 10px hsl(var(--primary) / 0)",
                "0 0 0 0 hsl(var(--primary) / 0.7)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Spotlight;
