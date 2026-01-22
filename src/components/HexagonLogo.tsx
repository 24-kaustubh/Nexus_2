import { motion } from "framer-motion";

interface HexagonLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  isActive?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
}

const sizeClasses = {
  sm: "w-12 h-14",
  md: "w-12 h-14",
  lg: "w-12 h-14",
};

const HexagonLogo = ({ size = "sm", className = "" }: HexagonLogoProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative ${sizeClasses[size]} ${className}`}
    >
      <svg
        viewBox="0 0 1600 1600"
        width="200%"
        height="200%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="1600" height="1600" fill="black" />

        <g
          transform="translate(0, -350)"
          stroke="white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M 400 232 L 1200 232 L 1568 920 L 1200 1608 L 400 1608 L 32 920 Z"
            strokeWidth="60"
          />

          <path
            d="M 480 430 L 1120 430 L 1380 920 L 1120 1410 L 480 1410 L 220 920 Z"
            strokeWidth="32"
          />
        </g>
      </svg>
    </motion.div>
  );
};

export default HexagonLogo;
