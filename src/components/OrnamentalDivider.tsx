import { motion } from "framer-motion";

interface OrnamentalDividerProps {
  className?: string;
}

const OrnamentalDivider = ({ className = "" }: OrnamentalDividerProps) => {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`relative w-full max-w-4xl mx-auto flex items-center justify-center gap-4 ${className}`}
    >
      {/* Left line */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/30 to-foreground/60" />
      
      {/* Center ornament */}
      <div className="flex items-center gap-2">
        <span className="text-foreground/50 text-xs">✧</span>
        <div className="w-2 h-2 rounded-full bg-foreground/30" />
        <span className="text-foreground/50 text-xs">✧</span>
      </div>
      
      {/* Right line */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-foreground/30 to-foreground/60" />
    </motion.div>
  );
};

export default OrnamentalDivider;
