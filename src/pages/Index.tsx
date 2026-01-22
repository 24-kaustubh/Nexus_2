import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductSection from "@/components/ProductSection";
import AboutSection from "@/components/AboutSection";

const Index = () => {
  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProductSection />
      <AboutSection />
    </main>
  );
};

export default Index;
