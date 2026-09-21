import React, { useState, useRef, useEffect } from'react';
import BedIcon from'@mui/icons-material/Bed';
import UserIcon from'@mui/icons-material/Person';
import TrendingUpIcon from'@mui/icons-material/TrendingUp';
import WarningIcon from'@mui/icons-material/Warning';
import SparklesIcon from'@mui/icons-material/AutoAwesome';
import DeleteIcon from'@mui/icons-material/Delete';
import BotIcon from'@mui/icons-material/SmartToy';
import SendIcon from'@mui/icons-material/Send';
import { getRooms as getRoomInventory } from'../../rooms/state/roomStore';
import { getReservations } from'../../reservations/state/reservationStore';
import { getGuests } from'../../guests/state/guestStore';
import { getStaff, getRooms as getHousekeepingRooms } from'../../housekeeping/pages/hkStore';
import { getInventoryItems } from'../../inventory/pages/inventoryStore';
import { getMenuItems } from'../../restaurant/pages/restaurantStore';
const initialMessages = [
 {
 id: 1,
 sender:'ai',
 text:'Hello! I am Luxuria AI, your intelligent hotel management assistant. How can I assist you with reservations, analytics, or front-desk operations today?',
 timestamp: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
 type:'text'
 }
];

const suggestedInquiries = [
 { id:'rooms', label:'Room Occupancy Forecast', icon: <BedIcon sx={{ fontSize: 16 }} /> },
 { id:'menu', label:'VIP Arrivals & Front Desk', icon: <UserIcon sx={{ fontSize: 16 }} /> },
 { id:'revenue', label:'Revenue & RevPAR Trends', icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
 { id:'maintenance', label:'Maintenance Triage Alerts', icon: <WarningIcon sx={{ fontSize: 16 }} /> },
];

// Helper to simulate typing delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function LuxuriaAssistant() {
 const [messages, setMessages] = useState(initialMessages);
 const [inputValue, setInputValue] = useState('');
 const [isTyping, setIsTyping] = useState(false);
 const messagesEndRef = useRef(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, isTyping]);

 const generateAIResponse = async (userText) => {
 const text = userText.toLowerCase();
 const romanUrdu = /\b(kya|kitne|kitni|hai|hain|batao|dikhao|chahiye|kamra|kamray|mehmaan|mehman|staff|safai|khana|qeemat|madad|kaise|kaisa|aaj|abhi|karo|karna|maujood)\b/.test(text);
 const rooms = getRoomInventory();
 const reservations = getReservations();
 const guests = getGuests();
 const staff = getStaff();
 const housekeepingRooms = getHousekeepingRooms();
 const inventoryItems = getInventoryItems();
 const menuItems = getMenuItems();
 const availableRooms = rooms.filter(room => room.status === 'Open');
 const bookedRooms = rooms.filter(room => room.status === 'Booked');
 const maintenanceRooms = rooms.filter(room => ['Inactive', 'Maintenance', 'Out of Order'].includes(room.status));
 const cleanRooms = housekeepingRooms.filter(room => room.status === 'Clean / Ready');
 const dirtyRooms = housekeepingRooms.filter(room => ['Dirty', 'Cleaning', 'Inspection Required'].includes(room.status));
 let responseText;

 if (text.includes('room') || text.includes('kamra') || text.includes('available') || text.includes('occupancy') || text.includes('availability')) {
	 responseText = romanUrdu
		 ? `Abhi ${availableRooms.length} rooms available hain, ${bookedRooms.length} booked hain aur ${maintenanceRooms.length} rooms inactive ya maintenance mein hain. Housekeeping ke mutabiq ${cleanRooms.length} rooms clean/ready aur ${dirtyRooms.length} rooms cleaning ya inspection mein hain.`
		 : `Current room inventory: ${availableRooms.length} rooms are available, ${bookedRooms.length} are booked, and ${maintenanceRooms.length} are inactive or under maintenance. Housekeeping shows ${cleanRooms.length} rooms clean/ready and ${dirtyRooms.length} rooms in cleaning or inspection.`;
 } else if (text.includes('reservation') || text.includes('booking') || text.includes('book')) {
	 const booked = reservations.filter(reservation => ['Booked', 'CheckIn'].includes(reservation.status));
	 responseText = romanUrdu
		 ? `System mein ${reservations.length} reservations hain. In mein se ${booked.length} active/booked hain. Kisi reservation ko dekhne ke liye Reservation tab khol sakte hain.`
		 : `There are ${reservations.length} reservations in the system, including ${booked.length} active or booked reservations. Open the Reservations tab to review or manage them.`;
 } else if (text.includes('guest') || text.includes('mehmaan')) {
	 responseText = romanUrdu
		 ? `Guest register mein ${guests.length} guests hain. Naye reservation ke baad guest record automatically yahan sync hota hai.`
		 : `The guest register currently contains ${guests.length} guests. New guests from reservations are synchronized automatically.`;
 } else if (text.includes('staff') || text.includes('employee') || text.includes('housekeep') || text.includes('safai')) {
	 const activeStaff = staff.filter(member => member.status === 'Active');
	 responseText = romanUrdu
		 ? `Housekeeping staff mein ${staff.length} members hain, jin mein ${activeStaff.length} active hain. ${dirtyRooms.length} rooms cleaning ya inspection ke liye pending hain.`
		 : `Housekeeping has ${staff.length} staff members, including ${activeStaff.length} active members. ${dirtyRooms.length} rooms are currently pending cleaning or inspection.`;
 } else if (text.includes('menu') || text.includes('food') || text.includes('khana')) {
	 const availableItems = menuItems.filter(item => item.availability === 'Available');
	 responseText = romanUrdu
		 ? `Restaurant menu mein ${menuItems.length} items hain aur ${availableItems.length} available hain. Aap Restaurant tab mein item details aur prices dekh sakte hain.`
		 : `The restaurant menu contains ${menuItems.length} items, with ${availableItems.length} currently available. Open the Restaurant tab to view item details and prices.`;
 } else if (text.includes('inventory') || text.includes('stock') || text.includes('item')) {
	 const lowStock = inventoryItems.filter(item => Number(item.quantity) <= Number(item.minimumStock || 0));
	 responseText = romanUrdu
		 ? `Inventory mein ${inventoryItems.length} items hain. ${lowStock.length} items minimum stock level par ya us se neeche hain.`
		 : `Inventory contains ${inventoryItems.length} items. ${lowStock.length} items are at or below their minimum stock level.`;
 } else if (text.includes('help') || text.includes('assist') || text.includes('madad')) {
	 responseText = romanUrdu
		 ? 'Main rooms, reservations, guests, staff, housekeeping, inventory aur restaurant menu ke live data ke bare mein bata sakta hoon.'
		 : 'I can answer questions about live rooms, reservations, guests, staff, housekeeping, inventory, and restaurant menu data.';
 } else {
	 responseText = romanUrdu
		 ? 'Mujhe is sawal ka relevant data nahi mila. Aap rooms, reservations, guests, staff, inventory ya menu ke bare mein sawal pooch sakte hain.'
		 : 'I could not find matching hotel data for that question. You can ask about rooms, reservations, guests, staff, inventory, or the menu.';
 }

 // Simulate typing
 setIsTyping(true);
 await sleep(1500); // 1.5 second delay
 setIsTyping(false);

 const newAiMessage = {
 id: Date.now() + 1,
 sender:'ai',
 text: responseText,
 timestamp: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
 type:'text'
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
 sender:'user',
 text: userText,
 timestamp: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
 type:'text'
 };

 setMessages(prev => [...prev, newUserMessage]);
 setInputValue('');

 // Trigger AI response
 await generateAIResponse(userText);
 };

 const handleSuggestionClick = (suggestionText) => {
 let query ='';
 if(suggestionText ==='rooms') query ='What is our current room inventory and occupancy forecast for this week?';
 if(suggestionText ==='menu') query ='Summarize VIP arrivals, special amenities requested, and peak check-in times today.';
 if(suggestionText ==='revenue') query ='Show me the revenue trends and pricing information.';
 if(suggestionText ==='maintenance') query ='Are there any rooms dirty or under maintenance?';
 
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
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary-dark)] flex items-center justify-center text-white shadow-md">
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
 <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-2 shrink-0 hide-scrollbar">
 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Suggested Inquiries:</span>
 {suggestedInquiries.map((chip) => (
 <button
 key={chip.id}
 onClick={() => handleSuggestionClick(chip.id)}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-[var(--primary-light)] hover:bg-[#e5f4eb] text-gray-600 hover:text-[var(--primary-dark)] text-xs font-medium rounded-full transition-all cursor-pointer shadow-sm"
 >
 {chip.icon && <span className="text-[var(--primary-light)]">{chip.icon}</span>}
 {chip.label}
 </button>
 ))}
 </div>

 {/* Chat Messages Area */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6">
 {messages.map((msg) => {
 const isAi = msg.sender ==='ai';
 return (
 <div key={msg.id} className={`flex ${isAi ?'justify-start' :'justify-end'}`}>
 <div className={`flex gap-3 max-w-[80%] ${isAi ?'flex-row' :'flex-row-reverse'}`}>
 
 {/* Avatar */}
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
 isAi ?'bg-[#e5f4eb] text-[var(--primary-main)]' :'bg-gray-200 text-gray-600'
 }`}>
 {isAi ? <BotIcon sx={{ fontSize: 18 }} /> : <UserIcon sx={{ fontSize: 18 }} />}
 </div>

 {/* Message Bubble */}
 <div className="flex flex-col">
 <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[14.5px] leading-relaxed ${
 isAi 
 ?'bg-white text-gray-700 border border-gray-100 rounded-tl-sm' 
 :'bg-[var(--primary-main)] text-white rounded-tr-sm'
 }`}>
 {msg.text}
 </div>
 
 {/* Footer (Time & Status) */}
 <div className={`flex items-center gap-2 mt-1.5 px-1 ${isAi ?'justify-start' :'justify-end'}`}>
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
 <div className="w-8 h-8 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0 mt-1 shadow-sm">
 <BotIcon sx={{ fontSize: 18 }} />
 </div>
 <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
 <div className="w-2 h-2 bg-[var(--primary-light)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
 <div className="w-2 h-2 bg-[var(--primary-light)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
 <div className="w-2 h-2 bg-[var(--primary-light)] rounded-full animate-bounce"></div>
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
 className="max-w-5xl mx-auto flex items-center gap-3 bg-white border border-gray-300 rounded-full pl-6 pr-2 py-2 shadow-sm focus-within:border-[var(--primary-main)] focus-within:ring-2 focus-within:ring-[#dcefe5] transition-all"
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
 className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
 >
 <SendIcon sx={{ fontSize: 18 }} />
 </button>
 </form>
 </div>
 </div>
 );
}
