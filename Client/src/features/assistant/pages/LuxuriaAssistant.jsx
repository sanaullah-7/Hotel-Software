import React, { useState, useRef, useEffect, useCallback } from 'react';
import BedIcon from '@mui/icons-material/Bed';
import UserIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from '@mui/icons-material/Delete';
import BotIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import InventoryIcon from '@mui/icons-material/Inventory2';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { assistantService } from '../../../services/assistantService';

const defaultSuggestedInquiries = [
  { id: 'rooms', label: 'Room Occupancy Forecast', query: 'What is our current room inventory and occupancy forecast?' },
  { id: 'arrivals', label: 'VIP Arrivals & Front Desk', query: 'Summarize VIP arrivals, check-ins, and active reservations today.' },
  { id: 'revenue', label: 'Revenue & Financials', query: 'Show me the revenue trends, invoices, and expense information.' },
  { id: 'maintenance', label: 'Housekeeping & Maintenance', query: 'Are there any rooms dirty, in cleaning, or under maintenance?' },
  { id: 'inventory', label: 'Low Stock Inventory', query: 'Show inventory items that are running low on stock.' },
];

export default function LuxuriaAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am Luxuria AI, your intelligent hotel management assistant. I am connected live to your hotel database. How can I assist you with rooms, reservations, revenue, housekeeping, staff, inventory, or restaurant operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isLive: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedInquiries, setSuggestedInquiries] = useState(defaultSuggestedInquiries);
  const [liveSummary, setLiveSummary] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load dynamic suggestion chips and executive summary from live backend
  useEffect(() => {
    let isMounted = true;

    const loadAssistantMetadata = async () => {
      try {
        const [suggestionsRes, summaryRes] = await Promise.allSettled([
          assistantService.getAssistantSuggestions(),
          assistantService.getAssistantSummary(),
        ]);

        if (isMounted) {
          if (suggestionsRes.status === 'fulfilled' && suggestionsRes.value?.data) {
            const dynamicList = suggestionsRes.value.data;
            if (Array.isArray(dynamicList) && dynamicList.length > 0) {
              setSuggestedInquiries(dynamicList);
            }
          }
          if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
            setLiveSummary(summaryRes.value.data);
          }
        }
      } catch (err) {
        // Fallback to default chips silently
      }
    };

    loadAssistantMetadata();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const formInput = e?.target?.querySelector ? e.target.querySelector('input') : null;
    const userText = (inputValue || formInput?.value || '').trim();
    if (!userText || isTyping) return;

    // Add User Message
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send message to real backend AI assistant endpoint
      const historyContext = messages.slice(-8).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await assistantService.askAssistant({
        message: userText,
        history: historyContext,
      });

      const data = res?.data || res;
      const aiResponseText = data?.reply || 'I processed your request, but received an empty response from the database.';

      const newAiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        domain: data?.domain || 'general',
        isLive: data?.isLive ?? true,
      };

      setMessages((prev) => [...prev, newAiMessage]);
    } catch (err) {
      console.error('AI assistant error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'I encountered an error communicating with the hotel database. Please ensure the backend server is running and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isLive: false,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (query) => {
    setInputValue(query);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: 'Chat history cleared. How can I assist you with hotel operations right now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isLive: true,
      },
    ]);
  };

  const getChipIcon = (id) => {
    if (id === 'rooms') return <BedIcon sx={{ fontSize: 16 }} />;
    if (id === 'arrivals') return <UserIcon sx={{ fontSize: 16 }} />;
    if (id === 'revenue') return <TrendingUpIcon sx={{ fontSize: 16 }} />;
    if (id === 'housekeeping') return <CleaningServicesIcon sx={{ fontSize: 16 }} />;
    if (id === 'inventory') return <InventoryIcon sx={{ fontSize: 16 }} />;
    return <WarningIcon sx={{ fontSize: 16 }} />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1b7f43] to-[#0f5132] flex items-center justify-center text-white shadow-xs">
            <SparklesIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
              Luxuria Executive Assistant
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">
              Real-time operational intelligence, multi-domain queries, and staff triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-semibold rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live DB Connected</span>
          </div>

          <button
            onClick={handleClearChat}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Suggested Chips Area */}
      <div className="px-4 py-2 bg-white border-b border-gray-100 flex items-center gap-1.5 shrink-0 overflow-x-auto min-w-0 hide-scrollbar">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mr-1.5 shrink-0">
          Suggested:
        </span>
        {suggestedInquiries.map((chip) => (
          <button
            key={chip.id}
            onClick={() => handleSuggestionClick(chip.query || chip.label)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 hover:border-[#1b7f43] hover:bg-[#e5f4eb] text-gray-600 hover:text-[#0f5132] text-[11px] font-medium rounded-full transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span className="text-[#1b7f43]">{getChipIcon(chip.id)}</span>
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                    isAi ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isAi ? <BotIcon sx={{ fontSize: 16 }} /> : <UserIcon sx={{ fontSize: 16 }} />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div
                    className={`px-3.5 py-2.5 rounded-xl shadow-xs text-[12.5px] leading-relaxed whitespace-pre-wrap ${
                      isAi
                        ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-xs'
                        : 'bg-[#1b7f43] text-white rounded-tr-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Footer (Time & Status) */}
                  <div className={`flex items-center gap-1.5 mt-1 px-1 ${isAi ? 'justify-start' : 'justify-end'}`}>
                    <span className="text-[10px] text-gray-400 font-medium">{msg.timestamp}</span>
                    {isAi && msg.isLive && (
                      <span className="text-[9.5px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded font-medium">
                        Live DB
                      </span>
                    )}
                    {isAi && msg.domain === 'out_of_domain' && (
                      <span className="text-[9.5px] bg-amber-50 text-amber-700 border border-amber-200 px-1 py-0.2 rounded font-medium">
                        Domain Guardrail
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-[#e5f4eb] text-[#1b7f43] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <BotIcon sx={{ fontSize: 16 }} />
              </div>
              <div className="bg-white border border-gray-100 px-3.5 py-2 rounded-xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#1b7f43] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-[#1b7f43] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-[#1b7f43] rounded-full animate-bounce"></div>
                <span className="text-[11px] text-gray-400 ml-1">Consulting live database...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2.5 bg-white border-t border-gray-100 shrink-0">
        <form
          onSubmit={handleSend}
          className="max-w-5xl mx-auto flex items-center gap-2 bg-white border border-gray-300 rounded-full pl-4 pr-1 py-1 shadow-xs focus-within:border-[#1b7f43] focus-within:ring-1 focus-within:ring-[#dcefe5] transition-all"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about rooms, bookings, revenue, housekeeping, staff, inventory..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-gray-700 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-[#1b7f43] hover:bg-[#0f5132] text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <SendIcon sx={{ fontSize: 14 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
