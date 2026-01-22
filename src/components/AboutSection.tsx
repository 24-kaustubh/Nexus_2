import { motion } from "framer-motion";
import HexagonLogo from "./HexagonLogo";


const AboutSection = () => {
  return (
    <section id="about" className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      

      
      {/* About Heading */}
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="font-display text-4xl md:text-6xl font-bold tracking-widest uppercase text-foreground mb-12"
      >
        About Us
      </motion.h3>

      {/* Description paragraphs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="max-w-5xl text-center space-y-6"
      >
        <p className="font-body text-base md:text-lg text-foreground/90 leading-relaxed">
          Nexus is building the meeting point between people and intelligence technology that feels natural, 
          human, and genuinely useful in real life. We believe AI shouldn't live only inside apps or dashboards. 
          It should understand intent, take action, and fit into your day without friction. That's why we design 
          intelligence around humans: calm, minimal, and built to help you move faster while feeling more in control.
        </p>

        <p className="font-body text-base md:text-lg text-foreground/90 leading-relaxed">
          Our first flagship product is SIA - Super Intelligent Assistant, designed to go beyond conversation. 
          SIA is being built to act: helping you manage tasks and agendas, operate your digital workspace when needed, 
          handle files and communications on command, and bring information into the moment through immersive, 
          visual experiences. Whether you need practical guidance, real-time execution, or a thoughtful companion, 
          SIA is crafted to feel present, not robotic.
        </p>

        <p className="font-body text-base md:text-lg text-foreground/90 leading-relaxed font-medium">
          Founded in 2024, Nexus exists for one simple goal: make intelligence more human, 
          and make humans more capable.
        </p>
      </motion.div>
    </section>
  );
};

export default AboutSection;
