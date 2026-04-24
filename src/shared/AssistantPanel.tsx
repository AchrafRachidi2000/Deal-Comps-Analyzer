import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ChevronDown,
  ChevronUp,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface ChatMessage {
  role: string; // 'user' | 'assistant' | 'status'
  content: string;
  timestamp: string;
}

export interface AssistantSendContext {
  pushStatus: (text: string) => void;
}

interface AssistantPanelProps {
  title?: string;
  initialMessages?: ChatMessage[];
  reasoningContent?: React.ReactNode;
  suggestedPrompts?: string[];
  autoReplyText?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onSend?: (
    userMessage: string,
    history: ChatMessage[],
    ctx: AssistantSendContext
  ) => Promise<string>;
}

const DEFAULT_REASONING = (
  <>
    <p className="mb-2">
      You're in <span className="font-medium text-gray-900">Similar companies</span> mode with <span className="font-medium text-indigo-600">@Medtronic</span> and <span className="font-medium text-indigo-600">@Philips</span> as the main references.
    </p>
    <p>
      These suggestions are closest on: <span className="italic">Products & Services</span>, <span className="italic">Technology focus</span>, and <span className="italic">Industries served</span>, within your Medtech respiratory monitoring criteria and geo / size guardrails.
    </p>
  </>
);

const DEFAULT_PROMPTS = ['Suggested action', 'Filter by EV > $500M', 'Exclude financial buyers'];

export function AssistantPanel({
  title = 'Deal Assistant',
  initialMessages = [],
  reasoningContent = DEFAULT_REASONING,
  suggestedPrompts = DEFAULT_PROMPTS,
  autoReplyText = "I've updated the filters based on your request. Is there anything else you'd like to analyze regarding these transactions?",
  collapsed = false,
  onToggleCollapsed,
  onSend,
}: AssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [showReasoning, setShowReasoning] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!collapsed) scrollToBottom();
  }, [messages, collapsed, isReplying]);

  const nowStamp = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = async () => {
    if (!input.trim() || isReplying) return;

    const userText = input;
    const newUserMsg: ChatMessage = {
      role: 'user',
      content: userText,
      timestamp: nowStamp(),
    };
    const nextHistory = [...messages, newUserMsg];
    setMessages(nextHistory);
    setInput('');

    if (onSend) {
      setIsReplying(true);
      const ctx: AssistantSendContext = {
        pushStatus: (text: string) => {
          setMessages((prev) => [
            ...prev,
            { role: 'status', content: text, timestamp: nowStamp() },
          ]);
        },
      };
      try {
        const reply = await onSend(userText, nextHistory, ctx);
        if (reply.trim()) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: reply, timestamp: nowStamp() },
          ]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${err instanceof Error ? err.message : 'Assistant failed'}`,
            timestamp: nowStamp(),
          },
        ]);
      } finally {
        setIsReplying(false);
      }
      return;
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: autoReplyText, timestamp: nowStamp() },
      ]);
    }, 1000);
  };

  if (collapsed) {
    return (
      <div className="w-12 h-full flex-shrink-0 bg-white border-l border-gray-200 shadow-xl z-10 flex flex-col items-center py-3 transition-[width] duration-200">
        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Open assistant"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <div
          style={{ writingMode: 'vertical-rl' }}
          className="mt-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider select-none"
        >
          {title}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-full flex-shrink-0 flex flex-col bg-white border-l border-gray-200 shadow-xl z-10 transition-[width] duration-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100" title="Copy conversation">
            <Copy className="w-4 h-4" />
          </button>
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              title="Collapse assistant"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="w-full flex items-center justify-between p-3 text-xs font-medium text-gray-500 hover:bg-gray-50"
        >
          <span>Active Reasoning</span>
          {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {showReasoning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 text-sm text-gray-600 leading-relaxed bg-gray-50/30">
                {reasoningContent}
                <div className="flex gap-2 mt-3">
                  <button className="p-1 hover:bg-gray-200 rounded"><ThumbsUp className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button className="p-1 hover:bg-gray-200 rounded"><ThumbsDown className="w-3.5 h-3.5 text-gray-400" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
        {messages.map((msg, idx) => {
          if (msg.role === 'status') {
            return (
              <div key={idx} className="px-2 text-[11px] text-gray-500 italic leading-relaxed">
                {msg.content}
              </div>
            );
          }
          return (
            <div key={idx} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs',
                  msg.role === 'assistant' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
                )}
              >
                {msg.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : 'JD'}
              </div>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl p-3 text-sm shadow-sm',
                  msg.role === 'assistant' ? 'bg-white border border-gray-100 text-gray-800' : 'bg-indigo-600 text-white'
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={cn(
                    'text-[10px] mt-1.5 opacity-70',
                    msg.role === 'assistant' ? 'text-gray-400' : 'text-indigo-200'
                  )}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        {isReplying && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs bg-indigo-100 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="rounded-2xl p-3 text-sm shadow-sm bg-white border border-gray-100 text-gray-500">
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: '120ms' }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: '240ms' }}>•</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors border border-gray-200"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask to refine results..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none text-sm min-h-[50px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isReplying}
            className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
