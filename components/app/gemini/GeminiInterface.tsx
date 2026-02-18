"use client";

import React, { useState } from 'react';
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  HelpCircle, 
  History, 
  Settings, 
  ChevronDown, 
  Compass, 
  Lightbulb, 
  Code, 
  Image as ImageIcon, 
  Mic, 
  SendHorizontal, 
  ThumbsUp, 
  ThumbsDown, 
  Share,
  Sparkles
} from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Suggestion = {
  text: string;
  icon: React.ReactNode;
};

const SUGGESTIONS: Suggestion[] = [
  {
    text: "Suggest beautiful places to see on an upcoming road trip",
    icon: <Compass className="w-5 h-5" />
  },
  {
    text: "Briefly summarize this concept: urban planning",
    icon: <Lightbulb className="w-5 h-5" />
  },
  {
    text: "Brainstorm team bonding activities for our work retreat",
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    text: "Improve the readability of the following code",
    icon: <Code className="w-5 h-5" />
  }
];

function buildAssistantResponse(prompt: string): string {
  return `Here is a simple explanation: "${prompt}" can be broken into smaller ideas, then solved one step at a time. If you want, I can give a short summary, a detailed version, or concrete examples.`;
}

export default function GeminiInterface() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue("");
  };

  const handleSend = (value?: string) => {
    const prompt = (value ?? inputValue).trim();
    if (!prompt) return;

    const now = Date.now();
    const userMessage: Message = {
      id: `user-${now}`,
      role: 'user',
      content: prompt
    };
    const assistantMessage: Message = {
      id: `assistant-${now}`,
      role: 'assistant',
      content: buildAssistantResponse(prompt)
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showWelcome = messages.length === 0;
  const recentPrompts = messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .slice(-6)
    .reverse();

  return (
    <div className="flex h-screen overflow-hidden bg-[#131314] text-[#e3e3e3] font-sans">
      <aside 
        className={`flex flex-col p-4 h-full relative z-20 bg-[#1e1f20] transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-[280px]' : 'w-[68px]'
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-[#333537] rounded-full text-gray-400 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={handleNewChat}
          className={`flex items-center gap-3 bg-[#1a1a1c] hover:bg-[#282a2c] p-3 rounded-full mb-6 text-sm text-gray-500 w-fit transition-all duration-300 ${
            isExpanded ? 'px-4' : 'px-3'
          }`}
        >
          <Plus className="w-5 h-5 text-gray-400" />
          <span 
            className={`opacity-100 transition-opacity duration-300 whitespace-nowrap ${
              isExpanded ? 'block' : 'hidden'
            }`}
          >
            New chat
          </span>
        </button>

        <div className="flex-1 overflow-y-auto px-2 scrollbar-thin">
          {isExpanded && (
            <p className="text-xs font-medium text-gray-400 mb-4 px-2 fade-in">Recent</p>
          )}
          <div className="space-y-1">
            {(recentPrompts.length > 0 ? recentPrompts : [
              "How to learn React",
              "UI Design patterns 2024"
            ]).map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-3 p-2 hover:bg-[#333537] rounded-full cursor-pointer text-sm truncate group"
                onClick={() => setInputValue(item)}
              >
                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                {isExpanded && <span className="truncate">{item}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-1 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-2 hover:bg-[#333537] rounded-full cursor-pointer text-sm" title="Help">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            {isExpanded && <span>Help</span>}
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-[#333537] rounded-full cursor-pointer text-sm" title="Activity">
            <History className="w-5 h-5 text-gray-400" />
            {isExpanded && <span>Activity</span>}
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-[#333537] rounded-full cursor-pointer text-sm" title="Settings">
            <Settings className="w-5 h-5 text-gray-400" />
            {isExpanded && <span>Settings</span>}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header className="flex items-center justify-between p-4 sticky top-0 bg-[#131314] z-10">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-[#1e1f20] px-2 py-1 rounded-lg">
            <span className="text-xl font-medium">Gemini</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">

            <button className="bg-[#1e1f20] px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-700 hover:bg-[#282a2c] transition-colors">
              Try Gemini Advanced
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-gray-600">
              U
            </div>
          </div>
        </header>

        <div className="max-w-4xl w-full mx-auto flex-1 px-4 py-8 flex flex-col">
          {showWelcome ? (
            <div className="mt-12 space-y-8 animate-in fade-in duration-700">
              <h1 className="text-5xl font-medium tracking-tight">
                <span className="gemini-gradient">Hello, User</span><br />
                <span className="text-[#444746] dark:text-[#444746] text-opacity-100" style={{ color: '#444746' }}>How can I help you today?</span>
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                {SUGGESTIONS.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.text}
                    text={suggestion.text}
                    icon={suggestion.icon}
                    onClick={() => handleSend(suggestion.text)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {messages.map((message) =>
                message.role === 'user' ? (
                  <div key={message.id} className="flex gap-4 items-start max-w-3xl ml-auto justify-end">
                    <div className="bg-[#282a2c] p-3 rounded-2xl rounded-tr-none text-sm leading-relaxed max-w-[80%]">
                      <p>{message.content}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full shrink-0 flex items-center justify-center text-xs text-white font-bold">U</div>
                  </div>
                ) : (
                  <div key={message.id} className="flex gap-4 items-start max-w-3xl">
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#8ab4f8]" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="text-sm leading-7 text-[#e3e3e3]">
                        <p>{message.content}</p>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <ThumbsUp className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
                        <ThumbsDown className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
                        <Share className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#131314] p-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1e1f20] rounded-full px-6 py-3 flex items-center gap-4 border border-transparent focus-within:border-[#444] focus-within:bg-[#282a2c] transition-all duration-200">
              <input 
                type="text" 
                placeholder="Enter a prompt here" 
                className="bg-transparent flex-1 outline-none text-base placeholder-gray-500 text-white"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-3 text-gray-400">
                <button className="hover:text-white transition-colors p-1"><ImageIcon className="w-5 h-5" /></button>
                <button className="hover:text-white transition-colors p-1"><Mic className="w-5 h-5" /></button>
                <button 
                  onClick={handleSend}
                  className={`transition-all p-1 ${inputValue.trim() ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                >
                  <SendHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 text-center mt-3 px-4">
              Gemini may display inaccurate info, including about people, so double-check its responses. 
              <a href="#" className="underline ml-1 hover:text-gray-400">Your privacy & Gemini Apps</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function SuggestionCard({
  text,
  icon,
  onClick
}: {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#1e1f20] p-4 rounded-2xl cursor-pointer min-h-[160px] flex flex-col justify-between hover:bg-[#333537] transition-colors group text-left"
    >
      <p className="text-sm font-normal text-gray-300 group-hover:text-white">{text}</p>
      <div className="self-end bg-[#131314] p-2 rounded-full text-gray-400 group-hover:text-white transition-colors border border-transparent group-hover:border-gray-700">
        {icon}
      </div>
    </button>
  );
}
