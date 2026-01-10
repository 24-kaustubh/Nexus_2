import { motion } from "framer-motion";
import HexagonLogo from "./HexagonLogo";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section id="about" className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-14" // Increased margin-bottom to create a larger gap from the text
      >
        <div style={{ position: "relative", right: "76.7%" }}>
          <HexagonLogo size="sm" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="font-display text-6xl md:text-6xl font-bold tracking-ultra-wide text-foreground mt-9 mb-11"
      >
        NEXUS
      </motion.h2>
      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="font-display text-xl md:text-xl lg:text-xl font-semibold tracking-widest uppercase text-foreground mb-12"
      >
        Intelligence, made natural.
      </motion.p>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="font-body text-base md:text-lg text-foreground/80 text-center max-w-3xl mb-16 leading-relaxed"
      >
        Check out SIA — Super Intelligent Assistant, our first flagship software product. 
        SIA makes AI feel more human, bridging the gap between people and intelligence 
        to become a real-life companion you can rely on.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <Button variant="hero" size="hero">
          CHECK OUT S.I.A.
        </Button>
      </motion.div>
    </section>
  );
};

export default HeroSection;
