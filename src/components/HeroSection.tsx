import { motion } from "framer-motion";
import HexagonLogo from "./HexagonLogo";
import { Button } from "./ui/button";

const WINDOWS_DOWNLOAD_URL = "https://github.com/orventhica/Sia/releases/download/v1.0.0/SIA_v1.0.0.zip";
const MAC_DOWNLOAD_URL = "https://x0.at/qN1_.dmg";

const HeroSection = () => {
  const handleDownloadWindows = () => {
    window.open(WINDOWS_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
  };

  const handleDownloadMac = () => {
    window.open(MAC_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="about" className="min-h-screen flex flex-col items-center justify-center px-6 py-10">

      

      {/* NEXUS wordmark */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="font-display font-black tracking-widest uppercase text-foreground text-5xl sm:text-7xl md:text-8xl lg:text-7xl mb-8 sm:mb-12 text-center"
      >
        ORVENTHICA
      </motion.h1>

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

      {/* Download Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <Button variant="hero" size="hero" onClick={handleDownloadWindows}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 inline-block">
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
          </svg>
          DOWNLOAD FOR WINDOWS
        </Button>
        <Button variant="hero" size="hero" onClick={handleDownloadMac}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 inline-block">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
          </svg>
          DOWNLOAD FOR MAC
        </Button>
      </motion.div>
    </section>
  );
};

export default HeroSection;