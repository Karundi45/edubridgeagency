'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am EduBridge AI. I can help you find scholarships, draft motivation letters, or prepare for interviews. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a conversation ID for this session
  const [conversationId] = useState(() => Math.random().toString(36).substring(2, 15));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No reader available');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content += chunk;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      // Remove the empty assistant message if it failed
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1 || prev[i].content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50 to-white flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-text">EduBridge AI Assistant</h1>
          <p className="text-xs text-text-muted">Powered by Advanced AI</p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 flex items-center gap-2 border-b border-amber-100">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>AI can make mistakes. Always verify scholarship details, deadlines, and official links.</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface-alt text-primary'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>
            
            {/* Bubble */}
            <div className={`p-3.5 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-sm' 
                : 'bg-surface-alt text-text rounded-tl-sm border border-border'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-surface-alt text-primary flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-surface-alt border border-border">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about scholarships, motivation letters, or interview prep..."
            className="w-full max-h-32 min-h-[52px] p-3 pr-12 bg-surface-alt border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm custom-scrollbar"
            rows={1}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 bottom-2 rounded-lg"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
        <div className="mt-2 text-center">
          <p className="text-[10px] text-text-muted">Press Enter to send, Shift+Enter for new line.</p>
        </div>
      </div>
    </div>
  );
}
