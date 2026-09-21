import React, { useState } from'react';
import {
 HomeOutlined as HomeIcon,
 Gavel as GavelIcon,
 CancelOutlined as CancelIcon,
 CalendarToday as CalendarIcon,
 MoneyOff as MoneyOffIcon,
 AccessTime as TimerIcon,
 Home as PropertyIcon,
 Pets as PetsIcon,
 SmokeFree as SmokeFreeIcon,
 ChildCare as ChildIcon,
 AssignmentInd as IdIcon,
 Fingerprint as FingerprintIcon,
 Person as PersonIcon,
 Security as SecurityIcon,
 WarningAmber as WarningIcon,
 AttachMoney as DollarIcon,
 Build as ToolsIcon,
 InfoOutlined as InfoIcon,
 CheckCircle as CheckIcon,
 Add as AddIcon,
 KeyboardArrowUp as ArrowUpIcon,
 KeyboardArrowDown as ArrowDownIcon,
 Close as CloseIcon
} from'@mui/icons-material';

// Custom toggle switch matching Luxuria's UI with checkmark thumb
const ToggleSwitch = ({ checked, onChange }) => (
 <button
 type="button"
 onClick={onChange}
 className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
 checked ?'bg-[#4f46e5]' :'bg-[#cbd5e1]'
 }`}
 >
 <div
 className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
 checked ?'translate-x-6' :'translate-x-0'
 }`}
 >
 {checked && (
 <svg className="w-2.5 h-2.5 text-[#4f46e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
 </svg>
 )}
 </div>
 </button>
);

export default function Policies() {
 // Accordion open/close states
 const [openCancellation, setOpenCancellation] = useState(true);
 const [openProperty, setOpenProperty] = useState(true);
 const [openGuestId, setOpenGuestId] = useState(true);

 // Cancellation Policy Rules
 const [cancellationRules, setCancellationRules] = useState([
 {
 id:'standard',
 title:'Standard Cancellation',
 desc:'Free cancellation up to 24 hours before check-in.',
 active: true,
 icon: CalendarIcon,
 iconBg:'bg-[#eff6ff]',
 iconColor:'text-[#3b82f6]',
 },
 {
 id:'non-refundable',
 title:'Non-Refundable',
 desc:'100% charge for any cancellation or no-show.',
 active: false,
 icon: MoneyOffIcon,
 iconBg:'bg-[#f1f5f9]',
 iconColor:'text-[#64748b]',
 },
 {
 id:'early-bird',
 title:'Early Bird',
 desc:'Free cancellation up to 7 days before check-in.',
 active: true,
 icon: TimerIcon,
 iconBg:'bg-[#ede9fe]',
 iconColor:'text-[#7c3aed]',
 },
 ]);

 // Property Policies Rules
 const [propertyRules, setPropertyRules] = useState([
 {
 id:'pet',
 title:'Pet Friendly',
 desc:'Allow pets in specific room types with surcharge.',
 active: false,
 icon: PetsIcon,
 iconBg:'bg-[#f3f4f6]',
 iconColor:'text-[#6b7280]',
 },
 {
 id:'smoking',
 title:'Smoking Policy',
 desc:'Strict 100% non-smoking property.',
 active: true,
 icon: SmokeFreeIcon,
 iconBg:'bg-[#eff6ff]',
 iconColor:'text-[#3b82f6]',
 },
 {
 id:'child',
 title:'Child Policy',
 desc:'Children below 6 years stay free with existing bedding.',
 active: true,
 icon: ChildIcon,
 iconBg:'bg-[#eff6ff]',
 iconColor:'text-[#4f46e5]',
 },
 ]);

 // Guest Identification Rules
 const [guestIdRules, setGuestIdRules] = useState([
 {
 id:'id-required',
 title:'ID Required',
 desc:'Valid government ID required at check-in.',
 active: true,
 icon: FingerprintIcon,
 iconBg:'bg-[#eff6ff]',
 iconColor:'text-[#3b82f6]',
 },
 {
 id:'age',
 title:'Age Restriction',
 desc:'Minimum age of 18 years for primary guest.',
 active: true,
 icon: PersonIcon,
 iconBg:'bg-[#eff6ff]',
 iconColor:'text-[#3b82f6]',
 },
 ]);

 // Numeric fields
 const [securityDeposit, setSecurityDeposit] = useState('100');
 const [damageFee, setDamageFee] = useState('50');

 // Add rule modal state
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [modalCategory, setModalCategory] = useState('cancellation');
 const [newRuleTitle, setNewRuleTitle] = useState('');
 const [newRuleDesc, setNewRuleDesc] = useState('');

 // Toast notification
 const [toastMessage, setToMessage] = useState(null);

 const showToast = (message) => {
 setToMessage(message);
 setTimeout(() => {
 setToMessage(null);
 }, 3500);
 };

 const toggleCancellationRule = (id) => {
 setCancellationRules((prev) =>
 prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
 );
 };

 const togglePropertyRule = (id) => {
 setPropertyRules((prev) =>
 prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
 );
 };

 const toggleGuestIdRule = (id) => {
 setGuestIdRules((prev) =>
 prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
 );
 };

 const handleOpenAddModal = (category) => {
 setModalCategory(category);
 setNewRuleTitle('');
 setNewRuleDesc('');
 setIsModalOpen(true);
 };

 const handleAddRule = (e) => {
 e.preventDefault();
 if (!newRuleTitle.trim()) return;

 const newRule = {
 id:`rule-${Date.now()}`,
 title: newRuleTitle,
 desc: newRuleDesc ||'Custom configured property rule.',
 active: true,
 icon: CalendarIcon,
 iconBg:'bg-[#eff6ff]',
 iconColor:'text-[#3b82f6]',
 };

 if (modalCategory ==='cancellation') {
 setCancellationRules((prev) => [...prev, newRule]);
 } else if (modalCategory ==='property') {
 setPropertyRules((prev) => [...prev, newRule]);
 } else {
 setGuestIdRules((prev) => [...prev, newRule]);
 }

 setIsModalOpen(false);
 showToast(`New ${modalCategory} rule added successfully!`);
 };

 const handleApplyConfiguration = () => {
 showToast('Policy configuration applied successfully!');
 };

 const activeCancellationCount = cancellationRules.filter((r) => r.active).length;
 const activePropertyCount = propertyRules.filter((r) => r.active).length;
 const activeGuestIdCount = guestIdRules.filter((r) => r.active).length;

 return (
 <div className="w-full space-y-2 pb-1 font-sans">
 {/* Toast Notification */}
 {toastMessage && (
 <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-[#1e293b] text-white px-3 py-2 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
 <CheckIcon sx={{ fontSize: 20, color:'#10b981' }} />
 <span className="text-sm font-medium">{toastMessage}</span>
 </div>
 )}

 

 {/* 2. Main Card: Property & Stay Policies */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 space-y-3">
 {/* Card Header */}
 <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
 <div className="w-8 h-8 rounded-xl bg-[#e0edff] text-[#2563eb] flex items-center justify-center shrink-0">
 <GavelIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <h3 className="text-[15px] font-bold text-[#1e293b]">
 Property & Stay Policies
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Configure legal rules, cancellation guidelines, and operational conditions for guests
 </p>
 </div>
 </div>

 {/* Accordion 1: Cancellation Policy */}
 <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
 <div
 onClick={() => setOpenCancellation((prev) => !prev)}
 className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors select-none"
 >
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg bg-[#fee2e2] text-[#ef4444] flex items-center justify-center shrink-0">
 <CancelIcon sx={{ fontSize: 18 }} />
 </div>
 <span className="text-sm font-bold text-gray-900">
 Cancellation Policy
 </span>
 <span className="rounded-full px-2 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-[11px] font-semibold">
 {activeCancellationCount} Active active
 </span>
 </div>
 <div className="text-gray-400">
 {openCancellation ? <ArrowUpIcon /> : <ArrowDownIcon />}
 </div>
 </div>

 {openCancellation && (
 <div className="p-2.5 pt-0 space-y-2">
 {cancellationRules.map((rule) => {
 const IconComponent = rule.icon;
 return (
 <div
 key={rule.id}
 className="bg-[#f8fafc] hover:bg-[#f1f5f9]/70 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-3 transition-colors"
 >
 <div className="flex items-center gap-2.5">
 <div
 className={`w-8 h-8 rounded-lg ${rule.iconBg} ${rule.iconColor} flex items-center justify-center shrink-0`}
 >
 <IconComponent sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-bold text-gray-900">
 {rule.title}
 </span>
 <span
 className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
 rule.active
 ?'bg-[#e8f8f0] text-[#0abb75]'
 :'bg-[#f1f5f9] text-[#64748b]'
 }`}
 >
 {rule.active ?'Active' :'Disabled'}
 </span>
 </div>
 <p className="text-[11px] text-gray-500 mt-0.5">{rule.desc}</p>
 </div>
 </div>
 <ToggleSwitch
 checked={rule.active}
 onChange={() => toggleCancellationRule(rule.id)}
 />
 </div>
 );
 })}

 <button
 type="button"
 onClick={() => handleOpenAddModal('cancellation')}
 className="mt-1.5 px-3 py-1.5 border border-gray-300 text-[#4f46e5] text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer"
 >
 <AddIcon sx={{ fontSize: 16 }} />
 Add New Policy Rule
 </button>
 </div>
 )}
 </div>

 {/* Accordion 2: Property Policies */}
 <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
 <div
 onClick={() => setOpenProperty((prev) => !prev)}
 className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors select-none"
 >
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg bg-[#e0edff] text-[#2563eb] flex items-center justify-center shrink-0">
 <PropertyIcon sx={{ fontSize: 18 }} />
 </div>
 <span className="text-sm font-bold text-gray-900">
 Property Policies
 </span>
 <span className="rounded-full px-2 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-[11px] font-semibold">
 {activePropertyCount} Active active
 </span>
 </div>
 <div className="text-gray-400">
 {openProperty ? <ArrowUpIcon /> : <ArrowDownIcon />}
 </div>
 </div>

 {openProperty && (
 <div className="p-2.5 pt-0 space-y-2">
 {propertyRules.map((rule) => {
 const IconComponent = rule.icon;
 return (
 <div
 key={rule.id}
 className="bg-[#f8fafc] hover:bg-[#f1f5f9]/70 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-3 transition-colors"
 >
 <div className="flex items-center gap-2.5">
 <div
 className={`w-8 h-8 rounded-lg ${rule.iconBg} ${rule.iconColor} flex items-center justify-center shrink-0`}
 >
 <IconComponent sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-bold text-gray-900">
 {rule.title}
 </span>
 <span
 className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
 rule.active
 ?'bg-[#e8f8f0] text-[#0abb75]'
 :'bg-[#f1f5f9] text-[#64748b]'
 }`}
 >
 {rule.active ?'Active' :'Disabled'}
 </span>
 </div>
 <p className="text-[11px] text-gray-500 mt-0.5">{rule.desc}</p>
 </div>
 </div>
 <ToggleSwitch
 checked={rule.active}
 onChange={() => togglePropertyRule(rule.id)}
 />
 </div>
 );
 })}

 <button
 type="button"
 onClick={() => handleOpenAddModal('property')}
 className="mt-1.5 px-3 py-1.5 border border-gray-300 text-[#4f46e5] text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer"
 >
 <AddIcon sx={{ fontSize: 16 }} />
 Add New Policy Rule
 </button>
 </div>
 )}
 </div>

 {/* Accordion 3: Guest Identification */}
 <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
 <div
 onClick={() => setOpenGuestId((prev) => !prev)}
 className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors select-none"
 >
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center shrink-0">
 <IdIcon sx={{ fontSize: 18 }} />
 </div>
 <span className="text-sm font-bold text-gray-900">
 Guest Identification
 </span>
 <span className="rounded-full px-2 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-[11px] font-semibold">
 {activeGuestIdCount} Active active
 </span>
 </div>
 <div className="text-gray-400">
 {openGuestId ? <ArrowUpIcon /> : <ArrowDownIcon />}
 </div>
 </div>

 {openGuestId && (
 <div className="p-2.5 pt-0 space-y-2">
 {guestIdRules.map((rule) => {
 const IconComponent = rule.icon;
 return (
 <div
 key={rule.id}
 className="bg-[#f8fafc] hover:bg-[#f1f5f9]/70 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-3 transition-colors"
 >
 <div className="flex items-center gap-2.5">
 <div
 className={`w-8 h-8 rounded-lg ${rule.iconBg} ${rule.iconColor} flex items-center justify-center shrink-0`}
 >
 <IconComponent sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-bold text-gray-900">
 {rule.title}
 </span>
 <span
 className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
 rule.active
 ?'bg-[#e8f8f0] text-[#0abb75]'
 :'bg-[#f1f5f9] text-[#64748b]'
 }`}
 >
 {rule.active ?'Active' :'Disabled'}
 </span>
 </div>
 <p className="text-[11px] text-gray-500 mt-0.5">{rule.desc}</p>
 </div>
 </div>
 <ToggleSwitch
 checked={rule.active}
 onChange={() => toggleGuestIdRule(rule.id)}
 />
 </div>
 );
 })}

 <button
 type="button"
 onClick={() => handleOpenAddModal('guest ID')}
 className="mt-1.5 px-3 py-1.5 border border-gray-300 text-[#4f46e5] text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer"
 >
 <AddIcon sx={{ fontSize: 16 }} />
 Add New Policy Rule
 </button>
 </div>
 )}
 </div>
 </div>

 {/* 3. Card 2: Deposit Requirements */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 space-y-2.5">
 <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
 <div className="w-8 h-8 rounded-xl bg-[#e0edff] text-[#2563eb] flex items-center justify-center shrink-0">
 <SecurityIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <h3 className="text-[15px] font-bold text-[#1e293b]">
 Deposit Requirements
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Set mandatory guest deposit protocols
 </p>
 </div>
 </div>

 <div className="max-w-md">
 <fieldset className="border border-gray-300 focus-within:border-[#4f46e5] rounded-xl px-3 py-1 bg-white transition-colors">
 <legend className="px-1 text-[11px] font-semibold text-gray-500 focus-within:text-[#4f46e5] select-none">
 Security Deposit Amount ($)
 </legend>
 <div className="flex items-center gap-2 px-1 py-0.5">
 <DollarIcon sx={{ fontSize: 20 }} className="text-gray-800 shrink-0" />
 <input
 type="number"
 value={securityDeposit}
 onChange={(e) => setSecurityDeposit(e.target.value)}
 className="w-full bg-transparent border-none outline-none text-gray-800 text-sm font-semibold"
 />
 </div>
 </fieldset>
 <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500">
 <InfoIcon sx={{ fontSize: 14, color:'#3b82f6' }} />
 <span>Fully refundable security deposit held on guest credit card at check-in.</span>
 </div>
 </div>
 </div>

 {/* 4. Card 3: Damage & Incidentals Policy */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 space-y-2.5">
 <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
 <div className="w-8 h-8 rounded-xl bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center shrink-0">
 <WarningIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <h3 className="text-[15px] font-bold text-[#1e293b]">
 Damage & Incidentals Policy
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Define recovery fees for room damages
 </p>
 </div>
 </div>

 <div className="max-w-md">
 <fieldset className="border border-gray-300 focus-within:border-[#4f46e5] rounded-xl px-3 py-1 bg-white transition-colors">
 <legend className="px-1 text-[11px] font-semibold text-gray-500 focus-within:text-[#4f46e5] select-none">
 Standard Damage Fee ($)
 </legend>
 <div className="flex items-center gap-2 px-1 py-0.5">
 <ToolsIcon sx={{ fontSize: 18 }} className="text-gray-800 shrink-0" />
 <input
 type="number"
 value={damageFee}
 onChange={(e) => setDamageFee(e.target.value)}
 className="w-full bg-transparent border-none outline-none text-gray-800 text-sm font-semibold"
 />
 </div>
 </fieldset>
 <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500">
 <InfoIcon sx={{ fontSize: 14, color:'#3b82f6' }} />
 <span>Baseline recovery assessment applied for minor non-structural property damages.</span>
 </div>
 </div>
 </div>

 {/* 5. Primary Apply Button */}
 <div className="pt-1">
 <button
 type="button"
 onClick={handleApplyConfiguration}
 className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
 >
 <CheckIcon sx={{ fontSize: 16 }} />
 Apply Policy Configuration
 </button>
 </div>

 

 {/* Modal: Add New Policy Rule */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
 <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-200">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100">
 <h4 className="font-bold text-gray-900 text-base">
 Add New {modalCategory} Rule
 </h4>
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
 >
 <CloseIcon sx={{ fontSize: 20 }} />
 </button>
 </div>

 <form onSubmit={handleAddRule} className="space-y-4 mt-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
 Rule Title*
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Free 48-Hour Cancellation"
 value={newRuleTitle}
 onChange={(e) => setNewRuleTitle(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5]"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
 Description
 </label>
 <textarea
 rows={3}
 placeholder="Describe conditions, limits, or fees..."
 value={newRuleDesc}
 onChange={(e) => setNewRuleDesc(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5] resize-y"
 />
 </div>

 <div className="pt-2 flex justify-end gap-2">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-semibold rounded-xl hover:bg-[#4338ca] transition"
 >
 Add Rule
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
