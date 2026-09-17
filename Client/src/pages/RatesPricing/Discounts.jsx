import { useState, useEffect } from 'react';
import {
  Search, Clear, Add, Edit, Delete,
  CheckCircle, LocalOffer, Percent,
  DateRange, ChevronLeft, ChevronRight
} from '@mui/icons-material';
import {
  IconButton, Snackbar, Alert, Tooltip
} from '@mui/material';
import ActionModal from '../../components/common/ActionModal';
import DiscountModal from './components/DiscountModal';
import {
  getDiscounts, addDiscount, updateDiscount,
  deleteDiscount, toggleDiscountStatus
} from './ratesPricingStore';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [selectedRatePlanFilter, setSelectedRatePlanFilter] = useState('All');

  // Modal and action states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const refreshDiscounts = () => {
    setDiscounts(getDiscounts());
  };

  useEffect(() => {
    refreshDiscounts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDiscount(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (discount) => {
    setEditingDiscount(discount);
    setModalOpen(true);
  };

  const handleSaveDiscount = (discountData, discountId) => {
    if (discountId) {
      updateDiscount(discountId, discountData);
      setSnackbar({ open: true, message: `Discount "${discountData.name}" updated successfully!`, severity: 'success' });
    } else {
      addDiscount(discountData);
      setSnackbar({ open: true, message: `Discount "${discountData.name}" (${discountData.code}) created successfully!`, severity: 'success' });
    }
    setModalOpen(false);
    refreshDiscounts();
  };

  const handlePromptDelete = (discount) => {
    setDiscountToDelete(discount);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (discountToDelete) {
      deleteDiscount(discountToDelete.id);
      setSnackbar({ open: true, message: `Discount "${discountToDelete.name}" deleted.`, severity: 'info' });
      setDeleteModalOpen(false);
      setDiscountToDelete(null);
      refreshDiscounts();
    }
  };

  const handleToggleStatus = (discount) => {
    toggleDiscountStatus(discount.id);
    const nextStatus = discount.status === 'Active' ? 'Inactive' : 'Active';
    setSnackbar({ open: true, message: `Discount "${discount.name}" is now ${nextStatus}.`, severity: 'success' });
    refreshDiscounts();
  };

  // Filter calculations
  const filteredDiscounts = discounts.filter(disc => {
    const matchesSearch =
      disc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disc.applicableRatePlan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (disc.description && disc.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = activeStatusTab === 'All' || disc.status === activeStatusTab;
    const matchesType = selectedTypeFilter === 'All' || disc.discountType === selectedTypeFilter;
    const matchesRatePlan = selectedRatePlanFilter === 'All' || disc.applicableRatePlan === selectedRatePlanFilter;

    return matchesSearch && matchesStatus && matchesType && matchesRatePlan;
  });

  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
  const paginatedDiscounts = filteredDiscounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Metrics
  const totalDiscountsCount = discounts.length;
  const activeDiscountsCount = discounts.filter(d => d.status === 'Active').length;
  const percentageDiscountsCount = discounts.filter(d => d.discountType === 'Percentage').length;
  const fixedDiscountsCount = discounts.filter(d => d.discountType === 'Fixed Amount').length;
  const totalRedemptions = discounts.reduce((sum, d) => sum + (Number(d.currentRedemptions) || 0), 0);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8 animate-fade-in">
      <div className="h-1"></div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Discounts & Promotions</h1>
            <span className="bg-[#e5f4eb] text-[#1b7f43] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {discounts.length} Deals Configured
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure promotional coupon codes, seasonal percentage markdowns, and fixed cash voucher rules.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1b7f43] hover:bg-[#156736] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Add sx={{ fontSize: 17 }} />
            <span>Add Discount</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Vouchers</span>
            <LocalOffer className="text-indigo-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{totalDiscountsCount}</span>
            <span className="text-[10px] text-gray-400 font-medium">Configured</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Active Offers</span>
            <CheckCircle className="text-emerald-600 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700">{activeDiscountsCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Redeemable</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Percentage Off</span>
            <Percent className="text-purple-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{percentageDiscountsCount}</span>
            <span className="text-[10px] text-purple-600 font-medium">% Deals</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Fixed Amount Off</span>
            <LocalOffer className="text-amber-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{fixedDiscountsCount}</span>
            <span className="text-[10px] text-amber-600 font-medium">PKR Vouchers</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Redemptions</span>
            <DateRange className="text-[#1b7f43] shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{totalRedemptions}</span>
            <span className="text-[10px] text-gray-400 font-medium">Used to date</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        
        {/* Table Controls Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search name, code, rate plan..."
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
            <div className="flex bg-gray-50 p-0.5 border border-gray-200 rounded-xl overflow-x-auto hide-scrollbar shrink-0">
              {['All', 'Active', 'Inactive', 'Expired'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveStatusTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-[11px] font-semibold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                    activeStatusTab === tab
                      ? 'bg-white text-[#1b7f43] shadow-xs font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Type & Rate Plan Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTypeFilter}
              onChange={(e) => {
                setSelectedTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
            >
              <option value="All">All Discount Types</option>
              <option value="Percentage">Percentage Only</option>
              <option value="Fixed Amount">Fixed Amount Only</option>
            </select>

            <select
              value={selectedRatePlanFilter}
              onChange={(e) => {
                setSelectedRatePlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
            >
              <option value="All">All Rate Plans</option>
              <option value="All Rate Plans">Global (All Plans)</option>
              <option value="Best Available Rate">Best Available Rate</option>
              <option value="Bed & Breakfast Package">Bed & Breakfast Package</option>
              <option value="Corporate Executive Rate">Corporate Executive Rate</option>
              <option value="Breakfast & Dinner Special">Breakfast & Dinner Special</option>
              <option value="Presidential All-Inclusive VIP">Presidential All-Inclusive VIP</option>
            </select>
          </div>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Discount Name</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Discount Code</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Type</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Value</th>
                <th className="py-2.5 px-2.5">Applicable Rate Plan</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Validity Period</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap text-center">Status</th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedDiscounts.map((disc) => (
                <tr key={disc.id} className="hover:bg-gray-50/60 transition-colors">
                  
                  {/* Name & description */}
                  <td className="py-2 px-3">
                    <div>
                      <span className="font-bold text-gray-900 block text-xs leading-tight">{disc.name}</span>
                      {disc.description && (
                        <p className="text-[10.5px] text-gray-500 truncate max-w-[180px] mt-0.5">
                          {disc.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Code Badge */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className="font-mono font-bold text-[11px] bg-emerald-50 text-[#1b7f43] px-2 py-0.5 rounded-md border border-[#1b7f43]/20 tracking-wider whitespace-nowrap">
                      {disc.code}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className="text-gray-700 font-semibold text-[11px]">
                      {disc.discountType}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className="font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
                      {disc.discountType === 'Percentage' ? `${disc.discountValue}% Off` : `PKR ${Number(disc.discountValue).toLocaleString()}`}
                    </span>
                  </td>

                  {/* Applicable Rate Plan */}
                  <td className="py-2 px-2.5">
                    <div className="text-gray-800 font-medium">
                      <span className="text-xs block leading-tight">{disc.applicableRatePlan}</span>
                      <span className="text-[10px] text-gray-400 block">{disc.applicableRoomType}</span>
                    </div>
                  </td>

                  {/* Validity Date Range */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <div className="text-gray-700 text-[10.5px] font-mono whitespace-nowrap">
                      <span className="font-medium">{disc.startDate}</span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span className="font-medium">{disc.endDate}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-2.5 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleStatus(disc)}
                      title="Click to toggle active status"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                        disc.status === 'Active'
                          ? 'bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d0ebd8] border border-[#1b7f43]/20'
                          : disc.status === 'Expired'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        disc.status === 'Active' ? 'bg-[#1b7f43]' : disc.status === 'Expired' ? 'bg-amber-500' : 'bg-gray-400'
                      }`}></span>
                      <span className="whitespace-nowrap">{disc.status}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Tooltip title="Edit Discount">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditModal(disc)}
                          sx={{ padding: '2px', color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                        >
                          <Edit sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Discount">
                        <IconButton
                          size="small"
                          onClick={() => handlePromptDelete(disc)}
                          sx={{ padding: '2px', color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                        >
                          <Delete sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>

                </tr>
              ))}

              {paginatedDiscounts.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <LocalOffer sx={{ fontSize: 36, color: '#d1d5db' }} />
                      <p className="text-sm font-semibold text-gray-600">No discounts found matching your criteria.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setActiveStatusTab('All'); setSelectedTypeFilter('All'); setSelectedRatePlanFilter('All'); setCurrentPage(1); }}
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
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredDiscounts.length)}</span> of{' '}
              <span className="font-semibold text-gray-700">{filteredDiscounts.length}</span> discounts
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
                      ? 'bg-[#1b7f43] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
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

      {/* Add / Edit Discount Modal */}
      <DiscountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        discount={editingDiscount}
        onSave={handleSaveDiscount}
      />

      {/* Delete Confirmation */}
      <ActionModal
        open={deleteModalOpen}
        title="Delete Discount Voucher?"
        description={
          discountToDelete
            ? `Are you sure you want to delete discount voucher "${discountToDelete.name}" (${discountToDelete.code})? This promotional coupon will immediately become inactive for future bookings.`
            : ''
        }
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmText="Delete Voucher"
        cancelText="Keep Voucher"
        confirmColor="error"
      />

      {/* Feedback Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '12px', fontSize: '13px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </div>
  );
}
