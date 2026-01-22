import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AnimatedLogo from "@/components/AnimatedLogo";
import ProfileButton from "@/components/ProfileButton";
import ChatHistory from "@/components/ChatHistory";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

const SIA = () => {
  const { user, loading } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setIsSpeaking(true);
        setTimeout(() => {
          setIsSpeaking(false);
        }, 3000);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedLogo isActive={false} size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <ChatHistory 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        userId={user?.id}
      />

      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 md:p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowHistory(true)}
          className="text-foreground hover:bg-secondary"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>

        <ProfileButton user={user} />
      </header>

      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <AnimatedLogo 
            isActive={isListening || isSpeaking} 
            isListening={isListening}
            isSpeaking={isSpeaking}
            size="lg" 
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-muted-foreground font-body text-lg"
          >
            {isListening 
              ? "Listening..." 
              : isSpeaking 
                ? "Speaking..." 
                : "Tap to start conversation"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleListening}
              className={`rounded-full w-16 h-16 transition-all duration-300 ${
                isListening 
                  ? "bg-accent text-accent-foreground glow-cyan" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default SIA;
