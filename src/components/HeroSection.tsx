import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HexagonLogo from "./HexagonLogo";
import { Button } from "./ui/button";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleCheckOutSIA = () => {
    navigate("/auth");
  };

  return (
    <section id="about" className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      
      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="font-display text-sm sm:text-lg md:text-xl font-semibold tracking-widest uppercase text-foreground mb-8 sm:mb-12 text-center w-full"
      >
        Intelligence, made natural.
      </motion.p>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="font-body text-sm sm:text-base md:text-lg text-foreground/80 text-center max-w-2xl sm:max-w-3xl mb-8 sm:mb-12 md:mb-16 leading-relaxed px-2 sm:px-0 w-full"
      >
        Check out SIA — Super Intelligent Assistant, our first flagship software product. 
        SIA makes AI feel more human, bridging the gap between people and intelligence 
        to become a real-life companion you can rely on.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="w-full flex justify-center"
      >
        <Button variant="hero" size="hero" onClick={handleCheckOutSIA}>
          CHECK OUT S.I.A.
        </Button>
      </motion.div>
    </section>
  );
};

export default HeroSection;
