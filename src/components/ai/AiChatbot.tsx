'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getToken } from '@/lib/authToken';
import type { AiChatResponse, AiChatStreamEvent } from '@/types/aiChat';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export function AiChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasMessages = messages.length > 0;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setError(null);
    setIsStreaming(true);

    try {
      await streamChat(trimmed, assistantMessage.id);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Failed to send message';
      setError(messageText);
      updateAssistantMessage(
        assistantMessage.id,
        messageText || 'AI response failed. Please try again later.',
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const streamChat = async (message: string, assistantId: string) => {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId ?? undefined,
        stream: true,
      }),
    });

    if (!response.ok) {
      const fallbackText = await response.text();
      throw new Error(fallbackText || 'Failed to send message');
    }

    const contentType = response.headers.get('Content-Type') ?? '';
    if (!response.body || !contentType.includes('text/event-stream')) {
      const data = (await response.json()) as AiChatResponse;
      setConversationId(data.conversationId);
      updateAssistantMessage(assistantId, data.response);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = processBuffer(buffer, assistantId);
    }
  };

  const processBuffer = (buffer: string, assistantId: string) => {
    let delimiterIndex = buffer.indexOf('\n\n');

    while (delimiterIndex !== -1) {
      const rawEvent = buffer.slice(0, delimiterIndex).trim();
      buffer = buffer.slice(delimiterIndex + 2);

      if (rawEvent) {
        const dataLines = rawEvent
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.replace(/^data:\s?/, ''));

        const dataPayload = dataLines.join('\n');
        if (dataPayload) {
          try {
            const event = JSON.parse(dataPayload) as AiChatStreamEvent;
            handleStreamEvent(event, assistantId);
          } catch {
            // Ignore malformed events
          }
        }
      }

      delimiterIndex = buffer.indexOf('\n\n');
    }

    return buffer;
  };

  const handleStreamEvent = (event: AiChatStreamEvent, assistantId: string) => {
    if (event.type === 'meta') {
      setConversationId(event.conversationId);
      return;
    }

    if (event.type === 'chunk') {
      appendAssistantMessage(assistantId, event.content);
      return;
    }

    if (event.type === 'error') {
      setError(event.message);
      updateAssistantMessage(
        assistantId,
        event.message || 'AI response failed. Please try again later.',
      );
    }
  };

  const updateAssistantMessage = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg)),
    );
  };

  const appendAssistantMessage = (id: string, chunk: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + chunk } : msg,
      ),
    );
  };

  const handleClear = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm" data-testid="ai-chatbot">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-genshin-gold/15">
            <img
              src="/paimeng.jpeg"
              alt="Paimon"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Strategy Assistant</p>
            <p className="text-xs text-muted-foreground">Builds, teams, and optimization advice</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-3 w-3" />
          New Chat
        </button>
      </div>

      <div className="max-h-[520px] overflow-y-auto px-4 py-4">
        {!hasMessages && (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-genshin-gold" />
            <p className="text-sm font-medium text-foreground">Ask anything about your Genshin strategy</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Example: “给我一个适合那维莱特的深渊队伍”
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex w-full items-start gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-genshin-gold/15">
                  <img
                    src="/paimeng.jpeg"
                    alt="Paimon"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground',
                )}
                data-testid={
                  message.role === 'user'
                    ? 'ai-chat-message-user'
                    : 'ai-chat-message-assistant'
                }
              >
                {message.content || (message.role === 'assistant' && isStreaming && '...')}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {error && (
        <div className="border-t border-border px-4 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about team comps, builds, or progression..."
            className="min-h-[48px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-genshin-gold focus:outline-none"
            data-testid="ai-chat-input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-genshin-gold px-4 text-sm font-semibold text-black transition-colors hover:bg-genshin-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="ai-chat-send"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
