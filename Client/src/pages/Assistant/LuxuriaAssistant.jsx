import React, { useState, useRef, useEffect } from 'react';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import BotIcon from '@mui/icons-material/SmartToy';
import UserIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import BedIcon from '@mui/icons-material/Bed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/WarningAmber';

const initialMessages = [
  {
    id: 1,
    sender: 'ai',
    text: 'Hello! I am Luxuria AI, your intelligent hotel management assistant. How can I assist you with reservations, analytics, or front-desk operations today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'text'
  }
];

const suggestedInquiries = [
  { id: 'rooms', label: 'Room Occupancy Forecast', icon: <BedIcon sx={{ fontSize: 16 }} /> },
  { id: 'menu', label: 'VIP Arrivals & Front Desk', icon: <UserIcon sx={{ fontSize: 16 }} /> },
  { id: 'revenue', label: 'Revenue & RevPAR Trends', icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
  { id: 'maintenance', label: 'Maintenance Triage Alerts', icon: <WarningIcon sx={{ fontSize: 16 }} /> },
];

// Helper to simulate typing delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function LuxuriaAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIResponse = async (userText) => {
    const text = userText.toLowerCase();
    let responseText = "I'm sorry, I couldn't quite catch that. Could you please rephrase? You can ask me about room availability, our food menu, pricing, discounts, or general front-desk operations.";

    // Keywords matching
    if (text.includes('room') || text.includes('available') || text.includes('occupancy')) {
      if (text.includes('dirty') || text.includes('clean')) {
        responseText = "Currently, we have 45 clean and available rooms. 12 rooms are marked as 'dirty' and are currently being serviced by housekeeping. 5 rooms are undergoing maintenance.";
      } else {
        responseText = "Based on today's room inventory across both wings, occupancy is at 88% with 55 rooms currently available. Deluxe suites and Sea-view villas are running at 94% capacity for the upcoming weekend.";
      }
    } 
    else if (text.includes('menu') || text.includes('food')) {
      responseText = "Our restaurant offers a diverse menu, including Continental, Asian, and Mediterranean cuisines. Popular items include our Signature Wagyu Steak ($45), Truffle Pasta ($28), and a variety of freshly caught seafood ($30-$60). Would you like me to place a room service order?";
    } 
    else if (text.includes('price') || text.includes('cost')) {
      responseText = "Standard rooms start at $150/night, Deluxe rooms at $250/night, and our premium suites begin at $450/night. Dining and spa services are billed separately. Are you looking for pricing on a specific service?";
    } 
    else if (text.includes('discount') || text.includes('offer') || text.includes('promo')) {
      responseText = "Yes, we currently have a 'Stay 3, Pay 2' promotion for our Deluxe suites. We also offer a 15% corporate discount and a 10% discount for early bird bookings made 30 days in advance.";
    } 
    else if (text.includes('vip') || text.includes('arrival') || text.includes('check-in')) {
      responseText = "Today we have 42 expected arrivals and 38 departures. Peak check-in window is anticipated between 2:00 PM and 5:30 PM. 3 VIP arrivals have requested early check-in and complimentary champagne.";
    }
    else if (text.includes('help') || text.includes('assist')) {
      responseText = "I can assist you with real-time room availability, housekeeping statuses, dining menus, promotional discounts, and tracking VIP arrivals. Just ask!";
    }

    // Simulate typing
    setIsTyping(true);
    await sleep(1500); // 1.5 second delay
    setIsTyping(false);

    const newAiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, newAiMessage]);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    
    // Add User Message
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');

    // Trigger AI response
    await generateAIResponse(userText);
  };

  const handleSuggestionClick = (suggestionText) => {
    let query = '';
    if(suggestionText === 'rooms') query = 'What is our current room inventory and occupancy forecast for this week?';
    if(suggestionText === 'menu') query = 'Summarize VIP arrivals, special amenities requested, and peak check-in times today.';
    if(suggestionText === 'revenue') query = 'Show me the revenue trends and pricing information.';
    if(suggestionText === 'maintenance') query = 'Are there any rooms dirty or under maintenance?';
    
    setInputValue(query);
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <SparklesIcon sx={{ fontSize: 22 }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              Luxuria Executive Assistant
            </h2>
            <p className="text-xs text-gray-500 font-medium">Operational intelligence, room inventory queries, and staff triage assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-wider rounded-full">
            Demo Mode
          </span>
          <button 
            onClick={handleClearChat}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <DeleteIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      {/* Suggested Chips Area */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-2 shrink-0 overflow-x-auto hide-scrollbar">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Suggested Inquiries:</span>
        {suggestedInquiries.map((chip) => (
          <button
            key={chip.id}
            onClick={() => handleSuggestionClick(chip.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 text-xs font-medium rounded-full transition-all whitespace-nowrap cursor-pointer shadow-sm"
          >
            {chip.icon && <span className="text-indigo-400">{chip.icon}</span>}
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-3 max-w-[80%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                  isAi ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isAi ? <BotIcon sx={{ fontSize: 18 }} /> : <UserIcon sx={{ fontSize: 18 }} />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[14.5px] leading-relaxed ${
                    isAi 
                      ? 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm' 
                      : 'bg-indigo-600 text-white rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Footer (Time & Status) */}
                  <div className={`flex items-center gap-2 mt-1.5 px-1 ${isAi ? 'justify-start' : 'justify-end'}`}>
                    <span className="text-[11px] text-gray-400 font-medium">{msg.timestamp}</span>
                    {isAi && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                        Simulated Demo
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
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <BotIcon sx={{ fontSize: 18 }} />
              </div>
              <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <form 
          onSubmit={handleSend}
          className="max-w-5xl mx-auto flex items-center gap-3 bg-white border border-gray-300 rounded-full pl-6 pr-2 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all"
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about bookings, revenue, guests, or maintenance..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
