import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";

interface SpotlightProps {
  targetId: string;
  isActive: boolean;
  onComplete?: () => void;
  padding?: number;
  instruction?: string;
  instructionPosition?: "top" | "bottom" | "left" | "right" | "auto";
  showContinueButton?: boolean;
  onContinue?: () => void;
}

const Spotlight = ({
  targetId,
  isActive,
  padding = 8,
  instruction,
  instructionPosition = "auto",
  showContinueButton = false,
  onContinue,
}: SpotlightProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
    placement: "bottom",
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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

      // Calculate tooltip position
      if (instruction && tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const gap = 16; // Gap between target and tooltip

        let placement = instructionPosition;
        let x = 0;
        let y = 0;

        // Auto-detect best position
        if (instructionPosition === "auto") {
          const spaceBelow = window.innerHeight - (rect.bottom + gap);
          const spaceAbove = rect.top - gap;
          const spaceRight = window.innerWidth - (rect.right + gap);
          const spaceLeft = rect.left - gap;

          if (spaceBelow >= tooltipRect.height) {
            placement = "bottom";
          } else if (spaceAbove >= tooltipRect.height) {
            placement = "top";
          } else if (spaceRight >= tooltipRect.width) {
            placement = "right";
          } else if (spaceLeft >= tooltipRect.width) {
            placement = "left";
          } else {
            placement = "bottom"; // Default fallback
          }
        }

        // Calculate position based on placement
        switch (placement) {
          case "bottom":
            x = rect.left + rect.width / 2 - tooltipRect.width / 2;
            y = rect.bottom + gap;
            break;
          case "top":
            x = rect.left + rect.width / 2 - tooltipRect.width / 2;
            y = rect.top - tooltipRect.height - gap;
            break;
          case "right":
            x = rect.right + gap;
            y = rect.top + rect.height / 2 - tooltipRect.height / 2;
            break;
          case "left":
            x = rect.left - tooltipRect.width - gap;
            y = rect.top + rect.height / 2 - tooltipRect.height / 2;
            break;
        }

        // Ensure tooltip stays within viewport
        x = Math.max(
          16,
          Math.min(x, window.innerWidth - tooltipRect.width - 16)
        );
        y = Math.max(
          16,
          Math.min(y, window.innerHeight - tooltipRect.height - 16)
        );

        setTooltipPosition({ x, y, placement });
      }
    };

    // Initial position
    updatePosition();

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    // Use ResizeObserver for dynamic content changes
    const targetElement = document.getElementById(targetId);
    let resizeObserver: ResizeObserver | null = null;

    if (targetElement) {
      resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(targetElement);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [targetId, isActive, padding, instruction, instructionPosition]);

  // Generate unique mask ID to avoid conflicts (stable across renders)
  const maskId = useMemo(
    () => `spotlight-mask-${targetId.replace(/[^a-zA-Z0-9]/g, "-")}`,
    [targetId]
  );

  if (!isActive || !isVisible) return null;

  return createPortal(
    <AnimatePresence>
      {isActive && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9998] pointer-events-none"
        >
          {/* Combined dark overlay with spotlight cutout using SVG mask */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <defs>
              <mask id={maskId}>
                {/* White = visible, Black = transparent */}
                <rect width="100%" height="100%" fill="white" />
                <motion.rect
                  x={position.x}
                  y={position.y}
                  width={position.width}
                  height={position.height}
                  fill="black"
                  rx="8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </mask>
            </defs>
            {/* Dark overlay with mask applied */}
            <motion.rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.6)"
              mask={`url(#${maskId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </svg>

          {/* Highlight border */}
          <motion.div
            className="absolute border-2 border-primary rounded-lg pointer-events-none"
            style={{
              left: position.x,
              top: position.y,
              width: position.width,
              height: position.height,
              boxShadow:
                "0 0 0 4px hsl(var(--primary) / 0.2), 0 0 20px hsl(var(--primary) / 0.4)",
              zIndex: 2,
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
            className="absolute border-2 border-primary rounded-lg pointer-events-none"
            style={{
              left: position.x,
              top: position.y,
              width: position.width,
              height: position.height,
              zIndex: 2,
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

          {/* Instruction tooltip */}
          {instruction && (
            <motion.div
              ref={tooltipRef}
              className="absolute bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 rounded-lg shadow-xl pointer-events-auto"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                zIndex: 3,
                maxWidth: "320px",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                delay: 0.1,
              }}
            >
              <p className="text-sm leading-relaxed mb-3">{instruction}</p>

              {/* Continue button */}
              {showContinueButton && onContinue && (
                <button
                  onClick={onContinue}
                  className="w-full bg-primary text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Continue
                </button>
              )}

              {/* Arrow pointer */}
              <div
                className="absolute w-3 h-3 bg-white dark:bg-gray-800 rotate-45"
                style={{
                  ...(tooltipPosition.placement === "bottom" && {
                    top: "-6px",
                    left: "50%",
                    transform: "translateX(-50%) rotate(45deg)",
                  }),
                  ...(tooltipPosition.placement === "top" && {
                    bottom: "-6px",
                    left: "50%",
                    transform: "translateX(-50%) rotate(45deg)",
                  }),
                  ...(tooltipPosition.placement === "right" && {
                    left: "-6px",
                    top: "50%",
                    transform: "translateY(-50%) rotate(45deg)",
                  }),
                  ...(tooltipPosition.placement === "left" && {
                    right: "-6px",
                    top: "50%",
                    transform: "translateY(-50%) rotate(45deg)",
                  }),
                }}
              />
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Spotlight;
