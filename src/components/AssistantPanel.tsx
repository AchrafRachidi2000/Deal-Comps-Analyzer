import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ThumbsUp, ThumbsDown, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { CHAT_HISTORY } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function AssistantPanel() {
  const [messages, setMessages] = useState(CHAT_HISTORY);
  const [input, setInput] = useState('');
  const [showReasoning, setShowReasoning] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setInput('');

    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I've updated the filters based on your request. Is there anything else you'd like to analyze regarding these transactions?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Deal Assistant</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reasoning Section (Collapsible) */}
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
                <p className="mb-2">
                  You're in <span className="font-medium text-gray-900">Similar companies</span> mode with <span className="font-medium text-indigo-600">@Medtronic</span> and <span className="font-medium text-indigo-600">@Philips</span> as the main references.
                </p>
                <p>
                  These suggestions are closest on: <span className="italic">Products & Services</span>, <span className="italic">Technology focus</span>, and <span className="italic">Industries served</span>, within your Medtech respiratory monitoring criteria and geo / size guardrails.
                </p>
                <div className="flex gap-2 mt-3">
                  <button className="p-1 hover:bg-gray-200 rounded"><ThumbsUp className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button className="p-1 hover:bg-gray-200 rounded"><ThumbsDown className="w-3.5 h-3.5 text-gray-400" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs",
              msg.role === 'assistant' ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-600"
            )}>
              {msg.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : "JD"}
            </div>
            <div className={cn(
              "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
              msg.role === 'assistant' ? "bg-white border border-gray-100 text-gray-800" : "bg-indigo-600 text-white"
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={cn(
                "text-[10px] mt-1.5 opacity-70",
                msg.role === 'assistant' ? "text-gray-400" : "text-indigo-200"
              )}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="p-3 bg-white border-t border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors border border-gray-200">
            Suggested action
          </button>
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors border border-gray-200">
            Filter by EV &gt; $500M
          </button>
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors border border-gray-200">
            Exclude financial buyers
          </button>
        </div>
      </div>

      {/* Input Area */}
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
            disabled={!input.trim()}
            className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
