import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-black/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
          {/* Logo - NEXUS Image Only */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            <img
              src="https://agi-prod-file-upload-public-main-use1.s3.amazonaws.com/e044ebf6-e722-4b86-b306-7aa86c4ee5b1"
              alt="NEXUS Logo"
              className="h-40 w-auto object-contain"
            />
          </motion.div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;