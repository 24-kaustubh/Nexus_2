import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import HexagonLogo from "./HexagonLogo";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
      // Navbar.tsx (className line)
className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-6 bg-black"

    >
      <HexagonLogo size="lg" />
    </motion.nav>
  );
};

export default Navbar;
