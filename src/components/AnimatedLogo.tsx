import { motion } from "framer-motion";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isActive?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
}

const sizeClasses = {
  sm: "w-20 h-24",
  md: "w-40 h-48",
  lg: "w-64 h-80",
  xl: "w-80 h-96",
};

const HexagonLogo = ({
  size = "md",
  className = "",
  isActive = false,
  isListening = false,
  isSpeaking = false,
}: AnimatedLogoProps) => {
  
  const currentState = isSpeaking 
    ? "speaking" 
    : isListening 
      ? "listening" 
      : isActive 
        ? "active" 
        : "idle";

  const outerVariants = {
    idle: { 
      strokeOpacity: 0.3, 
      strokeWidth: 60, 
      filter: "none" 
    },
    active: { 
      strokeOpacity: 0.8, 
      strokeWidth: 60, 
      filter: "url(#glow)" 
    },
    listening: {
      strokeOpacity: [0.6, 1, 0.6],
      strokeWidth: [60, 65, 60],
      filter: "url(#glow)",
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    speaking: {
      strokeOpacity: 1,
      strokeWidth: [60, 90, 60],
      filter: "url(#glow)",
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const innerVariants = {
    idle: { 
      strokeOpacity: 0.3, 
      strokeWidth: 32, 
      filter: "none" 
    },
    active: { 
      strokeOpacity: 0.8, 
      strokeWidth: 32, 
      filter: "url(#glow)" 
    },
    listening: {
      strokeOpacity: [0.6, 1, 0.6],
      strokeWidth: [32, 38, 32],
      filter: "url(#glow)",
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.2
      }
    },
    speaking: {
      strokeOpacity: 1,
      strokeWidth: [32, 55, 32],
      filter: "url(#glow)",
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.1
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <svg
        viewBox="-200 -200 2000 2000"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="35" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="-200" y="-200" width="2000" height="2000" fill="black" />
        
        <g
          transform="translate(0, 0)"
          stroke="white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer Hexagon */}
          <motion.path
            d="M 400 232 L 1200 232 L 1568 920 L 1200 1608 L 400 1608 L 32 920 Z"
            variants={outerVariants}
            initial="idle"
            animate={currentState}
          />

          {/* Inner Hexagon */}
          <motion.path
            d="M 480 430 L 1120 430 L 1380 920 L 1120 1410 L 480 1410 L 220 920 Z"
            variants={innerVariants}
            initial="idle"
            animate={currentState}
          />
        </g>
      </svg>
    </motion.div>
  );
};

export default HexagonLogo;
