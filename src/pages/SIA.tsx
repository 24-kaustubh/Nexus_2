import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from '@/components/AnimatedLogo';
import ProfileButton from '@/components/ProfileButton';
import ChatHistory from '@/components/ChatHistory';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { wsUrl, isProductionBackend } from '@/lib/api-config';
import { connectSignalR, sendSignalRMessage, disconnectSignalR } from '@/lib/api';


interface VoiceMessage {
  id: string;
  text: string;
  type: 'user' | 'assistant' | 'transcript';
  timestamp: Date;
}

const SIA = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const signalrUserIdRef = useRef<string>('');
  const useSignalRRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(false);

  const playBase64Audio = (base64Content: string, onEnded: () => void) => {
    try {
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.onended = onEnded;
      audio.play().catch(() => onEnded());
    } catch (e) {
      console.error('Audio play error:', e);
      onEnded();
    }
  };

  // Initialize connection: SignalR for production (HTTPS), WebSocket for local
  useEffect(() => {
    cleanupRef.current = null;

    const initVoiceAssistant = async () => {
      if (isProductionBackend()) {
        useSignalRRef.current = true;
        try {
          signalrUserIdRef.current = await connectSignalR(
            {
              onTranscript: (text) => {
                setMessages(prev => [...prev, {
                  id: `transcript-${Date.now()}`,
                  text,
                  type: 'transcript',
                  timestamp: new Date(),
                }]);
              },
              onAudio: (base64Chunk) => {
                setMessages(prev => [...prev, {
                  id: `assistant-${Date.now()}`,
                  text: 'Speaking...',
                  type: 'assistant',
                  timestamp: new Date(),
                }]);
                playBase64Audio(base64Chunk, () => {
                  setIsSpeaking(false);
                  setTimeout(() => {
                    isListeningRef.current = false;
                    startListening();
                  }, 500);
                });
              },
              onComplete: () => {
                setIsSpeaking(false);
                setTimeout(() => {
                  isListeningRef.current = false;
                  startListening();
                }, 1000);
              },
            },
            (err) => {
              console.error('SignalR error:', err);
              setConnected(false);
              setError('Connection failed');
            }
          );
          setConnected(true);
          setError(null);
          startListening();
        } catch (err) {
          console.error('SignalR connect failed:', err);
          setError('Connection failed');
          setConnected(false);
        }
        cleanupRef.current = () => {
          disconnectSignalR();
        };
        return;
      }

      useSignalRRef.current = false;
      try {
        wsRef.current = new WebSocket(wsUrl());

        wsRef.current.onopen = () => {
          console.log('✅ Connected to Sia voice');
          setConnected(true);
          setError(null);
          startListening();
        };

        wsRef.current.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'transcript') {
              setMessages(prev => [...prev, {
                id: `transcript-${Date.now()}`,
                text: data.content,
                type: 'transcript',
                timestamp: new Date(),
              }]);
            } else if (data.type === 'audio') {
              setMessages(prev => [...prev, {
                id: `assistant-${Date.now()}`,
                text: data.text || 'Listening...',
                type: 'assistant',
                timestamp: new Date(),
              }]);
              playBase64Audio(data.content, () => {
                setIsSpeaking(false);
                setTimeout(() => {
                  isListeningRef.current = false;
                  startListening();
                }, 500);
              });
              setIsSpeaking(false);
            } else if (data.type === 'text') {
              setMessages(prev => [...prev, {
                id: `assistant-${Date.now()}`,
                text: data.content,
                type: 'assistant',
                timestamp: new Date(),
              }]);
              setIsSpeaking(false);
              setTimeout(() => startListening(), 1000);
            } else if (data.type === 'error') {
              setError(data.content || 'Error occurred');
              setIsSpeaking(false);
              setTimeout(() => startListening(), 1000);
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        };

        wsRef.current.onerror = () => {
          setConnected(false);
          setError('Connection failed');
        };

        wsRef.current.onclose = () => setConnected(false);
        cleanupRef.current = () => {
          if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
          }
        };
      } catch (err) {
        console.error('Failed to initialize voice:', err);
        setError('Failed to connect');
        setConnected(false);
      }
    };

    if (!loading && user) {
      initVoiceAssistant();
    }

    return () => {
      cleanupRef.current?.();
      stopListening();
    };
  }, [user, loading]);

  // Start continuous listening
  const startListening = async () => {
    try {
      if (isListeningRef.current) {
        console.log('Already listening, skipping...');
        return;
      }

      isListeningRef.current = true;
      console.log('🎤 Starting to listen...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      console.log('Using MIME type:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      let lastSpeechTime = Date.now();
      const SILENCE_THRESHOLD = 1500; // 1.5 seconds of silence after speech
      let hasActualSpeech = false;
      let consecutiveSilence = 0;
      const MAX_RECORDING_TIME = 30000; // Maximum 30 seconds per recording

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // Detect actual speech vs background noise
          // Speech chunks are typically larger (>1000 bytes)
          if (event.data.size > 1000) {
            lastSpeechTime = Date.now();
            hasActualSpeech = true;
            consecutiveSilence = 0;
            console.log('🗣️ Speech detected, size:', event.data.size);
          } else {
            // Small chunks indicate silence/noise
            consecutiveSilence++;
          }
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('⏹️ Recording stopped. Total chunks:', audioChunksRef.current.length);
        console.log('🔍 hasActualSpeech flag:', hasActualSpeech);
        isListeningRef.current = false;
        
        // Stop the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        try {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            console.log('📦 Audio blob size:', audioBlob.size, 'bytes');
            
            if (audioBlob.size < 5000) {
              console.log('⚠️ Audio too small (< 5KB), likely just noise. Restarting...');
              setTimeout(() => {
                startListening();
              }, 500);
              return;
            }
            
            const reader = new FileReader();

            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              console.log('📤 Sending audio to backend, base64 length:', base64Audio?.length ?? 0);

              if (useSignalRRef.current && signalrUserIdRef.current) {
                try {
                  await sendSignalRMessage('audio', base64Audio ?? '', signalrUserIdRef.current);
                  setIsSpeaking(true);
                  console.log('✅ Audio sent via SignalR, waiting for response...');
                } catch (e) {
                  console.error('SignalR send error:', e);
                  setError('Failed to send audio');
                  setTimeout(() => startListening(), 1000);
                }
                return;
              }

              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                  type: 'audio',
                  content: base64Audio,
                }));
                setIsSpeaking(true);
                console.log('✅ Audio sent to backend, waiting for response...');
              } else {
                console.error('❌ WebSocket not ready');
                setTimeout(() => startListening(), 1000);
              }
            };

            reader.onerror = (error) => {
              console.error('FileReader error:', error);
              setTimeout(() => {
                startListening();
              }, 500);
            };

            reader.readAsDataURL(audioBlob);
          } else {
            console.log('⚠️ No audio data recorded, restarting...');
            setTimeout(() => {
              startListening();
            }, 500);
          }
        } catch (e) {
          console.error('❌ Error in onstop:', e);
          setTimeout(() => {
            startListening();
          }, 500);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        isListeningRef.current = false;
      };

      mediaRecorder.start(100);
      setError(null);

      // Auto-stop after silence
      if (silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
      }

      const recordingStartTime = Date.now();
      
      silenceIntervalRef.current = setInterval(() => {
        const timeSinceLastSpeech = Date.now() - lastSpeechTime;
        const totalRecordingTime = Date.now() - recordingStartTime;
        
        // Stop if we detected speech and then silence
        if (hasActualSpeech && timeSinceLastSpeech > SILENCE_THRESHOLD) {
          console.log(`🛑 Silence detected (${timeSinceLastSpeech}ms since last speech), stopping recording`);
          clearInterval(silenceIntervalRef.current!);
          silenceIntervalRef.current = null;
          
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }
        
        // Safety: Stop if recording too long (prevents infinite recording)
        if (totalRecordingTime > MAX_RECORDING_TIME) {
          console.log(`⏱️ Max recording time (${MAX_RECORDING_TIME}ms) reached, stopping`);
          clearInterval(silenceIntervalRef.current!);
          silenceIntervalRef.current = null;
          
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }
      }, 300);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setError(err.message || 'Microphone access denied');
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Chat History Sidebar */}
      <ChatHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        userId={user != null ? String(user.id) : undefined}
      />

      {/* Header */}
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

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Animated Logo */}
                    {/* Animated Logo */}
<AnimatedLogo 
  size="xl" 
  isListening={!isSpeaking}
  isSpeaking={isSpeaking}
  isActive={connected}
/>



          {/* Status Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-muted-foreground font-body text-lg text-center"
          >
            {isSpeaking ? (
              <span className="text-green-500">Speaking...</span>
            ) : (
              <span className="text-foreground">Listening...</span>
            )}
          </motion.p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-red-500/20 text-red-500 rounded-lg text-sm text-center max-w-sm"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default SIA;