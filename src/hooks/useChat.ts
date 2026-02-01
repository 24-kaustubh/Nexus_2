import { useState, useCallback, useRef, useEffect } from 'react';
import { chatAPI, createWebSocketConnection } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const useChat = (userId: string = 'anonymous') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const conversationIdRef = useRef<string>('');

  // Initialize WebSocket
  useEffect(() => {
    wsRef.current = createWebSocketConnection(
      userId,
      (data) => {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          text: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      },
      (error) => {
        console.error('WebSocket Error:', error);
        setError('Connection error. Using HTTP fallback.');
      }
    );

    return () => {
      wsRef.current?.close();
    };
  }, [userId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        // Use HTTP if WebSocket not ready, otherwise use WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              message: text,
              user_id: userId,
            })
          );
        } else {
          // Fallback to HTTP
          const response = await chatAPI.sendMessage(
            text,
            userId,
            conversationIdRef.current
          );
          conversationIdRef.current = response.conversation_id;

          const botMessage: Message = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            text: response.message,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Send message error:', err);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = '';
  }, []);

  return {
    messages,
    sendMessage,
    loading,
    error,
    clearMessages,
  };
};
