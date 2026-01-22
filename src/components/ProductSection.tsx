import { motion } from "framer-motion";
import HexagonLogo from "./HexagonLogo";

import siaDevice from "@/assets/sia-device.png";

const ProductSection = () => {
  return (
    <section id="about" className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      
      

      {/* Headings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center mb-16"
      >
        <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-widest uppercase text-foreground mb-4">
          A glimpse into the nearing future.
        </h3>
        <h4 className="font-display text-xl md:text-2xl font-bold tracking-widest uppercase text-foreground">
          Arriving Soon
        </h4>
      </motion.div>

      {/* Content Grid */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="font-body text-lg md:text-xl text-foreground/90 leading-relaxed ">
            SIA Device is Nexus' upcoming flagship hardware companion built to turn voice into action. 
            Beyond conversation, it's designed to operate your laptop, manage files, assist with messages 
            and emails, and keep your tasks and agenda organised. For visual requests, SIA is being built 
            to project AR/VR-style experiences bringing maps, images, and information into your space.
          </p>
        </motion.div>

        {/* Device Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <img
              src={siaDevice}
              alt="SIA Device - Nexus Hardware Companion"
              className="w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-2xl"
            />
            {/* Glow effect behind device */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-accent rounded-full scale-75" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductSection;
