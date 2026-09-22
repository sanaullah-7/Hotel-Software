import { useState, useEffect } from'react';
import {
 Search, Clear, Add, Edit, Delete,
 CheckCircle, Cancel, Sell, Hotel, Restaurant,
 Shield, CurrencyExchange, ChevronLeft, ChevronRight,
 Refresh
} from'@mui/icons-material';
import {
 IconButton, Snackbar, Alert, Tooltip
} from'@mui/material';
import ActionModal from'../../../components/common/ActionModal';
import RatePlanModal from'./components/RatePlanModal';
import {
 getRatePlans, addRatePlan, updateRatePlan,
 deleteRatePlan, toggleRatePlanStatus, resetRatesPricingStore
} from'./ratesPricingStore';

export default function RatePlans() {
 const [ratePlans, setRatePlans] = useState([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [activeStatusTab, setActiveStatusTab] = useState('All');
 const [selectedRoomType, setSelectedRoomType] = useState('All');
 const [selectedMealPlan, setSelectedMealPlan] = useState('All');

 // Modal and action states
 const [modalOpen, setModalOpen] = useState(false);
 const [editingPlan, setEditingPlan] = useState(null);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [planToDelete, setPlanToDelete] = useState(null);

 // Feedback Snackbar
 const [snackbar, setSnackbar] = useState({ open: false, message:'', severity:'success' });

 // Pagination
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 // Load plans from local store
 const refreshPlans = () => {
 setRatePlans(getRatePlans());
 };

 useEffect(() => {
 refreshPlans();
 }, []);

 const handleOpenAddModal = () => {
 setEditingPlan(null);
 setModalOpen(true);
 };

 const handleOpenEditModal = (plan) => {
 setEditingPlan(plan);
 setModalOpen(true);
 };

 const handleSavePlan = (planData, planId) => {
 if (planId) {
 updateRatePlan(planId, planData);
 setSnackbar({ open: true, message:`Rate Plan"${planData.name}" updated successfully!`, severity:'success' });
 } else {
 addRatePlan(planData);
 setSnackbar({ open: true, message:`Rate Plan"${planData.name}" created successfully!`, severity:'success' });
 }
 setModalOpen(false);
 refreshPlans();
 };

 const handlePromptDelete = (plan) => {
 setPlanToDelete(plan);
 setDeleteModalOpen(true);
 };

 const handleConfirmDelete = () => {
 if (planToDelete) {
 deleteRatePlan(planToDelete.id);
 setSnackbar({ open: true, message:`Rate Plan"${planToDelete.name}" deleted.`, severity:'info' });
 setDeleteModalOpen(false);
 setPlanToDelete(null);
 refreshPlans();
 }
 };

 const handleToggleStatus = (plan) => {
 toggleRatePlanStatus(plan.id);
 const nextStatus = plan.status ==='Active' ?'Inactive' :'Active';
 setSnackbar({ open: true, message:`Rate Plan"${plan.name}" marked as ${nextStatus}.`, severity:'success' });
 refreshPlans();
 };

 const handleResetDefaults = () => {
 if (window.confirm('Reset all Rate Plans & Pricing to initial default sample data?')) {
 resetRatesPricingStore();
 refreshPlans();
 setSnackbar({ open: true, message:'Rates & Pricing data reset to default demo records.', severity:'info' });
 }
 };

 // Filter calculations
 const filteredPlans = ratePlans.filter(plan => {
 const matchesSearch = 
 plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 plan.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
 plan.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
 plan.mealPlan.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesStatus = activeStatusTab ==='All' || plan.status === activeStatusTab;
 const matchesRoom = selectedRoomType ==='All' || plan.roomType === selectedRoomType;
 const matchesMeal = selectedMealPlan ==='All' || plan.mealPlan === selectedMealPlan;

 return matchesSearch && matchesStatus && matchesRoom && matchesMeal;
 });

 const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
 const paginatedPlans = filteredPlans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

 // Summary Metrics
 const totalPlansCount = ratePlans.length;
 const activePlansCount = ratePlans.filter(p => p.status ==='Active').length;
 const flexiblePoliciesCount = ratePlans.filter(p => p.cancellationPolicy ==='Flexible').length;
 const nonRefundableCount = ratePlans.filter(p => p.cancellationPolicy ==='Non-Refundable').length;
 const avgBaseRate = ratePlans.length > 0 
 ? Math.round(ratePlans.reduce((sum, p) => sum + (Number(p.baseRate) || 0), 0) / ratePlans.length) 
 : 0;

 return (
 <div className="space-y-2 max-w-[1600px] mx-auto pb-2 animate-fade-in">
 {/* Top Action Bar (Heading Removed) */}
 <div className="flex items-center justify-end gap-1.5 flex-wrap">
 <button
 onClick={handleResetDefaults}
 title="Reset to default mock data"
 className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded text-xs font-medium transition cursor-pointer shadow-xs"
 >
 Reset Demo
 </button>

 <button
 onClick={handleOpenAddModal}
 className="px-3 py-1 bg-[#1b7f43] hover:bg-[#156736] text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
 >
 + Add Rate Plan
 </button>
 </div>

 {/* 5 Stats Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
 {/* Total Plans */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Total Plans</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-lg font-bold text-gray-900">{totalPlansCount}</span>
 <span className="text-[10px] text-gray-400 font-medium">Configured</span>
 </div>
 </div>

 {/* Active Plans */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Active Plans</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-lg font-bold text-emerald-700">{activePlansCount}</span>
 <span className="text-[10px] text-emerald-600 font-semibold">Live in Engine</span>
 </div>
 </div>

 {/* Flexible Policy */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Flexible Policy</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-lg font-bold text-gray-900">{flexiblePoliciesCount}</span>
 <span className="text-[10px] text-blue-600 font-medium">Free Cancel</span>
 </div>
 </div>

 {/* Non-Refundable */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Non-Refundable</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-lg font-bold text-gray-900">{nonRefundableCount}</span>
 <span className="text-[10px] text-amber-600 font-medium">Advance Saver</span>
 </div>
 </div>

 {/* Avg Base Rate */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Avg Base Rate</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-base font-bold text-gray-900">PKR {avgBaseRate.toLocaleString()}</span>
 <span className="text-[10px] text-gray-400 font-medium">/ night</span>
 </div>
 </div>
 </div>

 {/* Main Table Container */}
 <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
 
 {/* Table Controls Header */}
 <div className="p-3 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
 
 {/* Left Controls: Search & Segmented Filter */}
 <div className="flex flex-col sm:flex-row sm:items-center gap-3">
 {/* Search Input */}
 <div className="relative w-full sm:w-64 shrink-0">
 <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
 <input
 type="text"
 placeholder="Search code, name, room, meal..."
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
 />
 {searchQuery && (
 <button
 onClick={() => {
 setSearchQuery('');
 setCurrentPage(1);
 }}
 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
 >
 <Clear sx={{ fontSize: 14 }} />
 </button>
 )}
 </div>

 {/* Status Segmented Buttons */}
 <div className="flex bg-gray-50 p-0.5 border border-gray-200 rounded-xl hide-scrollbar shrink-0">
 {['All','Active','Inactive'].map(tab => (
 <button
 key={tab}
 onClick={() => {
 setActiveStatusTab(tab);
 setCurrentPage(1);
 }}
 className={`px-3 py-1 text-[11px] font-semibold transition-all rounded-lg cursor-pointer ${
 activeStatusTab === tab
 ?'bg-white text-[#1b7f43] shadow-xs font-bold'
 :'text-gray-500 hover:text-gray-800'
 }`}
 >
 {tab}
 </button>
 ))}
 </div>
 </div>

 {/* Right Controls: Room Type Filter & Meal Plan Filter */}
 <div className="flex flex-wrap items-center gap-2">
 {/* Room Type Selector */}
 <select
 value={selectedRoomType}
 onChange={(e) => {
 setSelectedRoomType(e.target.value);
 setCurrentPage(1);
 }}
 className="py-1.5 px-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
 >
 <option value="All">All Room Types</option>
 <option value="Standard Room">Standard Room</option>
 <option value="Deluxe Room">Deluxe Room</option>
 <option value="Executive Suite">Executive Suite</option>
 <option value="Presidential Suite">Presidential Suite</option>
 </select>

 {/* Meal Plan Selector */}
 <select
 value={selectedMealPlan}
 onChange={(e) => {
 setSelectedMealPlan(e.target.value);
 setCurrentPage(1);
 }}
 className="py-1.5 px-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
 >
 <option value="All">All Meal Plans</option>
 <option value="Room Only">Room Only</option>
 <option value="Breakfast Included">Breakfast Included</option>
 <option value="Breakfast + Dinner">Breakfast + Dinner</option>
 <option value="All Meals Included">All Meals Included</option>
 </select>
 </div>

 </div>

 {/* Data Table - Strictly 100% width with NO horizontal scroll */}
 <div className="w-full">
 <table className="w-full table-fixed text-left border-collapse">
 <colgroup>
 <col style={{ width:'11%' }} />
 <col style={{ width:'24%' }} />
 <col style={{ width:'14%' }} />
 <col style={{ width:'15%' }} />
 <col style={{ width:'13%' }} />
 <col style={{ width:'10%' }} />
 <col style={{ width:'8%' }} />
 <col style={{ width:'5%' }} />
 </colgroup>
 <thead>
 <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
 <th className="py-2.5 px-2">Rate Code</th>
 <th className="py-2.5 px-2">Rate Plan Name</th>
 <th className="py-2.5 px-2">Room Type</th>
 <th className="py-2.5 px-2">Meal Plan</th>
 <th className="py-2.5 px-2">Base Rate</th>
 <th className="py-2.5 px-2">Cancellation</th>
 <th className="py-2.5 px-1 text-center">Status</th>
 <th className="py-2.5 px-1 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-xs">
 {paginatedPlans.map((plan) => (
 <tr key={plan.id} className="hover:bg-gray-50/60 transition-colors">
 
 {/* Rate Code */}
 <td className="py-2 px-2">
 <span className="font-mono font-bold text-[10.5px] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 truncate inline-block max-w-full">
 {plan.code}
 </span>
 </td>

 {/* Plan Name & Inclusions */}
 <td className="py-2 px-2">
 <div className="min-w-0">
 <span className="font-bold text-gray-900 block text-xs leading-tight break-words">{plan.name}</span>
 {plan.description && (
 <p className="text-[10px] text-gray-500 truncate mt-0.5" title={plan.description}>
 {plan.description}
 </p>
 )}
 </div>
 </td>

 {/* Room Type */}
 <td className="py-2 px-2">
 <div className="flex items-center gap-1 text-gray-700 font-medium">
 <Hotel sx={{ fontSize: 13, color:'#6b7280', flexShrink: 0 }} />
 <span className="truncate text-xs">{plan.roomType}</span>
 </div>
 </td>

 {/* Meal Plan */}
 <td className="py-2 px-2">
 <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#1b7f43] border border-emerald-200/60 max-w-full">
 <Restaurant sx={{ fontSize: 11, flexShrink: 0 }} />
 <span className="truncate">{plan.mealPlan}</span>
 </span>
 </td>

 {/* Base Rate & Currency */}
 <td className="py-2 px-2">
 <div>
 <span className="font-extrabold text-xs text-gray-900 font-mono block">
 PKR {Number(plan.baseRate).toLocaleString()}
 </span>
 <span className="text-[9px] text-gray-400 block leading-none">/ night</span>
 </div>
 </td>

 {/* Cancellation Policy */}
 <td className="py-2 px-2">
 <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold max-w-full truncate ${
 plan.cancellationPolicy ==='Flexible'
 ?'bg-blue-50 text-blue-700 border border-blue-200'
 : plan.cancellationPolicy ==='Moderate'
 ?'bg-amber-50 text-amber-700 border border-amber-200'
 :'bg-red-50 text-red-700 border border-red-200'
 }`}>
 <span className="truncate">{plan.cancellationPolicy}</span>
 </span>
 </td>

 {/* Status Badge */}
 <td className="py-2 px-1 text-center">
 <button
 onClick={() => handleToggleStatus(plan)}
 title="Click to toggle status"
 className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold cursor-pointer transition-all ${
 plan.status ==='Active'
 ?'bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d0ebd8] border border-[#1b7f43]/20'
 :'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
 }`}
 >
 <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${plan.status ==='Active' ?'bg-[#1b7f43]' :'bg-gray-400'}`}></span>
 <span>{plan.status}</span>
 </button>
 </td>

 {/* Action Buttons */}
 <td className="py-2 px-1 text-right">
 <div className="flex items-center justify-end gap-0.5">
 <Tooltip title="Edit Rate Plan">
 <IconButton
 size="small"
 onClick={() => handleOpenEditModal(plan)}
 sx={{ padding:'2px', color:'#3b82f6','&:hover': { backgroundColor:'#eff6ff' } }}
 >
 <Edit sx={{ fontSize: 15 }} />
 </IconButton>
 </Tooltip>

 <Tooltip title="Delete Rate Plan">
 <IconButton
 size="small"
 onClick={() => handlePromptDelete(plan)}
 sx={{ padding:'2px', color:'#ef4444','&:hover': { backgroundColor:'#fef2f2' } }}
 >
 <Delete sx={{ fontSize: 15 }} />
 </IconButton>
 </Tooltip>
 </div>
 </td>

 </tr>
 ))}

 {paginatedPlans.length === 0 && (
 <tr>
 <td colSpan="8" className="py-10 text-center text-gray-500">
 <div className="flex flex-col items-center justify-center gap-2">
 <Sell sx={{ fontSize: 36, color:'#d1d5db' }} />
 <p className="text-sm font-semibold text-gray-600">No rate plans match your search or filter criteria.</p>
 <button
 onClick={() => { setSearchQuery(''); setActiveStatusTab('All'); setSelectedRoomType('All'); setSelectedMealPlan('All'); setCurrentPage(1); }}
 className="text-xs text-[#1b7f43] font-bold hover:underline"
 >
 Clear Filters
 </button>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination Controls */}
 {totalPages > 0 && (
 <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <span className="text-xs text-gray-500">
 Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{''}
 <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredPlans.length)}</span> of{''}
 <span className="font-semibold text-gray-700">{filteredPlans.length}</span> plans
 </span>

 <div className="flex items-center space-x-1 self-end sm:self-auto">
 <button
 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
 disabled={currentPage === 1}
 className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
 >
 <ChevronLeft fontSize="small" />
 </button>

 {[...Array(totalPages)].map((_, i) => (
 <button
 key={i}
 onClick={() => setCurrentPage(i + 1)}
 className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
 currentPage === i + 1
 ?'bg-[#1b7f43] text-white shadow-xs'
 :'text-gray-600 hover:bg-gray-100'
 }`}
 >
 {i + 1}
 </button>
 ))}

 <button
 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
 disabled={currentPage === totalPages}
 className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
 >
 <ChevronRight fontSize="small" />
 </button>
 </div>
 </div>
 )}

 </div>

 {/* Add / Edit Rate Plan Modal */}
 <RatePlanModal
 open={modalOpen}
 onClose={() => setModalOpen(false)}
 plan={editingPlan}
 onSave={handleSavePlan}
 />

 {/* Confirmation Modal for Delete */}
 <ActionModal
 open={deleteModalOpen}
 title="Delete Rate Plan?"
 description={
 planToDelete
 ?`Are you sure you want to permanently delete the rate plan"${planToDelete.name}" (${planToDelete.code})? Existing reservations linked to this rate plan will retain their historic values.`
 :''
 }
 onClose={() => setDeleteModalOpen(false)}
 onConfirm={handleConfirmDelete}
 confirmText="Delete Plan"
 cancelText="Keep Plan"
 confirmColor="error"
 />

 {/* Feedback Toast */}
 <Snackbar
 open={snackbar.open}
 autoHideDuration={4000}
 onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 >
 <Alert
 onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
 severity={snackbar.severity}
 variant="filled"
 sx={{ borderRadius:'12px', fontSize:'13px' }}
 >
 {snackbar.message}
 </Alert>
 </Snackbar>

 </div>
 );
}
