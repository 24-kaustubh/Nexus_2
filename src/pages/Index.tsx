import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductSection from "@/components/ProductSection";
import AboutSection from "@/components/AboutSection";
import SiaChat from "@/components/SiaChat";

const Index = () => {
  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProductSection />
      <AboutSection />
      
      {/* Sia Chat Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Chat with Sia</h2>
            <p className="text-gray-400">Experience the Human Side of AI</p>
          </div>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <SiaChat />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
