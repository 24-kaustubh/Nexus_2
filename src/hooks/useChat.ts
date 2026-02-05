import { useState, useCallback, useRef } from 'react';
import { chatAPI, type ChatMessage } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  /** Optional base64 audio from Sia (if response_format supports it) */
  audioBase64?: string | null;
}

export const useChat = (userId: string = 'anonymous') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Conversation history in Sia format for POST /api/v1/chat/ */
  const historyRef = useRef<ChatMessage[]>([]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      const newHistory: ChatMessage[] = [
        ...historyRef.current,
        { role: 'user', content: text },
      ];
      historyRef.current = newHistory;

      try {
        const response = await chatAPI.sendMessage(newHistory, 'text');

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          text: response.message,
          timestamp: new Date(),
          audioBase64: response.audio_base64 ?? undefined,
        };
        setMessages((prev) => [...prev, botMessage]);

        historyRef.current = [
          ...historyRef.current,
          { role: 'assistant', content: response.message },
        ];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Send message error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
  }, []);

  return {
    messages,
    sendMessage,
    loading,
    error,
    clearMessages,
  };
};
