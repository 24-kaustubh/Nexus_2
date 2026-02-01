import { useState, useEffect, useRef } from 'react';
import { createWebSocket, sendMessage, closeWebSocket } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sia';
  timestamp: Date;
}

export function SiaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await createWebSocket('user_anonymous');
        setConnected(true);
        setError(null);
      } catch (err) {
        console.error('Failed to connect:', err);
        setError('Failed to connect to Sia. Please try again.');
        setConnected(false);
      }
    };

    initializeConnection();

    return () => {
      closeWebSocket();
    };
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !connected || loading) return;

    const userMessage = input.trim();
    const messageId = Date.now().toString();

    // Add user message to chat
    setMessages(prev => [...prev, {
      id: messageId,
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    }]);

    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Send to backend
      const response = await sendMessage(userMessage);

      // Add Sia response
      setMessages(prev => [...prev, {
        id: `sia-${messageId}`,
        text: response,
        sender: 'sia',
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setMessages(prev => [...prev, {
        id: `error-${messageId}`,
        text: `Error: ${err.message || 'Failed to process message'}`,
        sender: 'sia',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-semibold text-foreground">
              Chat with Sia
            </h1>
            <p className={`text-sm ${connected ? 'text-green-500' : 'text-red-500'}`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <p className="text-lg mb-2">Start a conversation with Sia...</p>
              <p className="text-sm">Type a message below to get started</p>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-secondary text-secondary-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm break-words">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.sender === 'user'
                  ? 'text-primary-foreground/70'
                  : 'text-secondary-foreground/70'
              }`}>
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Sia is thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border px-6 py-4 bg-card">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={connected ? "Message Sia..." : "Connecting..."}
            disabled={!connected || loading}
            className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            disabled={!connected || loading || !input.trim()}
            className="px-4 py-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SiaChat;