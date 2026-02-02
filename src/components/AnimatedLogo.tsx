import { motion } from "framer-motion";

interface AnimatedLogoProps {
  isActive?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-24 h-24",
  md: "w-40 h-40",
  lg: "w-60 h-60",
  xl: "w-72 h-72",
};

const AnimatedLogo = ({
  isActive = false,
  isListening = false,
  isSpeaking = false,
  size = "lg",
  className = ""
}: AnimatedLogoProps) => {
  
  // Static Flat-Top Hexagon points with padding to prevent clipping
  const outerPoints = "30,12 70,12 92,50 70,88 30,88 8,50";
  const innerPoints = "35,24 65,24 81,50 65,76 35,76 19,50";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* subtleGlow: used for the Outer Hexagon while listening */}
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* intenseGlow: used for both hexagons while speaking */}
          <filter id="intenseGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagon - Pointy Corners, No Movement */}
        <motion.polygon
          points={outerPoints}
          stroke="white"
          strokeWidth="3.5"
          strokeLinejoin="miter" // Sharp corners
          animate={{
            // Switches to intenseGlow when speaking, subtleGlow when listening
            filter: isSpeaking 
              ? "url(#intenseGlow)" 
              : isListening 
              ? "url(#subtleGlow)" 
              : "none",
            opacity: (isListening || isSpeaking) ? [1, 0.8, 1] : 1
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Inner Hexagon - Pointy Corners, No Movement */}
        <motion.polygon
          points={innerPoints}
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="miter" // Sharp corners
          animate={{
            // Only glows (intensely) when speaking
            filter: isSpeaking ? "url(#intenseGlow)" : "none",
            opacity: isSpeaking ? [0.6, 1, 0.6] : 1
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    </motion.div>
  );
};

export default AnimatedLogo;