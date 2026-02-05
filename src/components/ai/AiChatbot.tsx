'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Gem, Send, Sparkles, Trash2, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const t = useTranslations('aiChat');
  const locale = useLocale();
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
      const messageText = err instanceof Error ? err.message : t('sendFailed');
      setError(messageText);
      updateAssistantMessage(
        assistantMessage.id,
        messageText || t('responseFailed'),
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
        language: locale,
      }),
    });

    if (!response.ok) {
      const fallbackText = await response.text();
      throw new Error(fallbackText || t('sendFailed'));
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
        event.message || t('responseFailed'),
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

  const markdownClassName =
    'break-words whitespace-pre-wrap leading-[1.7] text-[#32353b] ' +
    '[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-[#c88c24] [&_h1]:text-base [&_h1:first-child]:mt-0 ' +
    '[&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-[#c88c24] [&_h2]:text-sm ' +
    '[&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-[#c88c24] [&_h3]:text-sm ' +
    '[&_p]:mb-2 ' +
    '[&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:leading-[1.8] [&_ul]:space-y-1 [&_ol]:space-y-1 ' +
    '[&_table]:mt-3 [&_table]:w-full [&_table]:border-collapse ' +
    '[&_th]:bg-[#3a3125] [&_th]:text-[#f0ebe3] [&_th]:text-left [&_th]:px-3 [&_th]:py-2 ' +
    '[&_td]:border [&_td]:border-[#e6d3ae] [&_td]:px-3 [&_td]:py-2 ' +
    '[&_tbody_tr:nth-child(even)]:bg-[#f6f1e9] [&_tbody_tr:nth-child(odd)]:bg-[#fffaf1] ' +
    '[&_strong]:text-[#d97706] ' +
    '[&_code]:whitespace-pre-wrap [&_code]:break-words ' +
    '[&_pre]:mt-2 [&_pre]:rounded-md [&_pre]:bg-[#f6f1e9] [&_pre]:p-3 [&_pre]:whitespace-pre-wrap [&_pre]:break-words';

  const renderAssistantContent = (content: string) => {
    const text = content ?? '';
    if (text.toLowerCase().includes('unauthorized')) {
      return (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-600">
          Unauthorized. Please login to continue.
        </div>
      );
    }
    const keywordIcons = [
      { keyword: '圣遗物', Icon: Gem },
      { keyword: 'artifact', Icon: Gem },
      { keyword: '角色', Icon: User },
      { keyword: 'character', Icon: User },
    ];

    const matchedIcons = keywordIcons.filter(({ keyword }) =>
      text.toLowerCase().includes(keyword.toLowerCase()),
    );

    const markdown = text || (isStreaming && '...') || '';

    return (
      <div className="flex items-start gap-2">
        {matchedIcons.length > 0 && (
          <div className="mt-0.5 flex items-center gap-1 text-[#c9a35a]">
            {matchedIcons.map(({ keyword, Icon }) => (
              <Icon key={keyword} className="h-4 w-4" />
            ))}
          </div>
        )}
        <ReactMarkdown remarkPlugins={[remarkGfm]} className={markdownClassName}>
          {markdown}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div
      className="rounded-2xl border border-[#e2c27a]/60 bg-[#f0ebe3] text-[#32353b] shadow-[0_12px_30px_rgba(50,53,59,0.12)]"
      data-testid="ai-chatbot"
    >
      <div className="flex items-center justify-between border-b border-[#e2c27a]/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#e7d7b7]">
            <img
              src="/paimeng.jpeg"
              alt="Paimon"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#32353b]">{t('title')}</p>
            <p className="text-xs text-[#6a6d73]">{t('subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 rounded-md border border-[#d8c399] px-2 py-1 text-xs text-[#6a6d73] hover:text-[#32353b]"
        >
          <Trash2 className="h-3 w-3" />
          {t('newChat')}
        </button>
      </div>

      <div className="max-h-[520px] overflow-y-auto px-4 py-4">
        {!hasMessages && (
          <div className="rounded-lg border border-dashed border-[#d8c399] bg-white/40 px-4 py-6 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-[#c9a35a]" />
            <p className="text-sm font-medium text-[#32353b]">{t('emptyTitle')}</p>
            <p className="mt-1 text-xs text-[#6a6d73]">
              {t('emptyExample')}
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
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#e7d7b7]">
                  <img
                    src="/paimeng.jpeg"
                    alt="Paimon"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[75%] px-4 py-3 text-sm leading-[1.7] shadow-sm',
                  message.role === 'user'
                    ? 'rounded-[18px_18px_2px_18px] bg-[linear-gradient(135deg,#b78b2e,#8c5f14)] text-white'
                    : 'rounded-[18px_18px_18px_2px] border border-[#e2c27a] bg-[rgba(255,255,255,0.65)] text-[#32353b]',
                )}
                data-testid={
                  message.role === 'user'
                    ? 'ai-chat-message-user'
                    : 'ai-chat-message-assistant'
                }
              >
                {message.role === 'assistant'
                  ? renderAssistantContent(message.content)
                  : message.content}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {error && (
        <div className="border-t border-[#e2c27a]/40 px-4 py-2 text-xs text-[#b94a48]">
          {error}
        </div>
      )}

      <div className="border-t border-[#e2c27a]/40 px-4 py-3">
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
            placeholder={t('inputPlaceholder')}
            className="min-h-[48px] flex-1 resize-none rounded-lg border border-[#d8c399] bg-white/70 px-3 py-2 text-sm text-[#32353b] placeholder:text-[#8a8d93] focus:border-[#c9a35a] focus:outline-none"
            data-testid="ai-chat-input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#caa65a,#a8782a)] px-4 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="ai-chat-send"
          >
            <Send className="h-4 w-4" />
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  );
}
