import { useState, useEffect } from 'react';
import {
  Search, Clear, Add, Edit, Delete,
  CheckCircle, LocalOffer, Percent,
  DateRange, ChevronLeft, ChevronRight
} from '@mui/icons-material';
import {
  IconButton, Snackbar, Alert, Tooltip
} from '@mui/material';
import ActionModal from '../../../components/common/ActionModal';
import DiscountModal from './components/DiscountModal';
import {
  getDiscounts, fetchDiscounts, addDiscount, updateDiscount,
  deleteDiscount, toggleDiscountStatus, DISCOUNTS_UPDATED_EVENT
} from './ratesPricingStore';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const refreshDiscounts = async () => {
    setLoading(true);
    try {
      const list = await fetchDiscounts();
      setDiscounts(list);
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Failed to load discounts', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDiscounts();
    const handleUpdate = () => setDiscounts(getDiscounts());
    window.addEventListener(DISCOUNTS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(DISCOUNTS_UPDATED_EVENT, handleUpdate);
  }, []);

  const handleOpenAddModal = () => {
    setEditingDiscount(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (discount) => {
    setEditingDiscount(discount);
    setModalOpen(true);
  };

  const handleSaveDiscount = async (discountData, discountId) => {
    try {
      if (discountId) {
        await updateDiscount(discountId, discountData);
        setSnackbar({ open: true, message: `Discount "${discountData.name}" updated successfully!`, severity: 'success' });
      } else {
        await addDiscount(discountData);
        setSnackbar({ open: true, message: `Discount "${discountData.name}" (${discountData.code}) created successfully!`, severity: 'success' });
      }
      setModalOpen(false);
      await refreshDiscounts();
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Failed to save discount', severity: 'error' });
    }
  };

  const handlePromptDelete = (discount) => {
    setDiscountToDelete(discount);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (discountToDelete) {
      try {
        await deleteDiscount(discountToDelete.id);
        setSnackbar({ open: true, message: `Discount "${discountToDelete.name}" deleted.`, severity: 'info' });
        setDeleteModalOpen(false);
        setDiscountToDelete(null);
        await refreshDiscounts();
      } catch (err) {
        setSnackbar({ open: true, message: err?.message || 'Failed to delete discount', severity: 'error' });
      }
    }
  };

  const handleToggleStatus = async (discount) => {
    try {
      await toggleDiscountStatus(discount.id);
      const nextStatus = discount.status === 'Active' ? 'Inactive' : 'Active';
      setSnackbar({ open: true, message: `Discount "${discount.name}" is now ${nextStatus}.`, severity: 'success' });
      await refreshDiscounts();
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Failed to toggle status', severity: 'error' });
    }
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
    <div className="space-y-2 max-w-[1600px] mx-auto pb-2 animate-fade-in pt-1">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-1">
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{totalDiscountsCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Total Vouchers</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <LocalOffer sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-emerald-700 leading-none mb-1">{activeDiscountsCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Active Offers</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{percentageDiscountsCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Percentage Off</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
            <Percent sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{fixedDiscountsCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Fixed Amount</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
            <LocalOffer sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{totalRedemptions}</div>
            <div className="text-[11px] text-gray-500 font-medium">Total Redemptions</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 shrink-0">
            <DateRange sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        
        {/* Table Controls Header */}
        <div className="p-2.5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 15 }} />
              <input
                type="text"
                placeholder="Search discount name, code, rate plan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-7 pr-7 py-1 bg-white border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Clear sx={{ fontSize: 13 }} />
                </button>
              )}
            </div>

            {/* Status Segmented Buttons */}
            <div className="flex bg-gray-50 p-0.5 border border-gray-200 rounded-lg hide-scrollbar shrink-0">
              {['All', 'Active', 'Inactive', 'Expired'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveStatusTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-0.5 text-[10.5px] font-semibold transition-all rounded-md cursor-pointer ${
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

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Type Selector */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => {
                setSelectedTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 px-2 border border-gray-200 rounded-lg text-[10.5px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
            >
              <option value="All">All Types</option>
              <option value="Percentage">Percentage (%)</option>
              <option value="Fixed Amount">Fixed Amount (PKR)</option>
            </select>

            {/* Rate Plan Selector */}
            <select
              value={selectedRatePlanFilter}
              onChange={(e) => {
                setSelectedRatePlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 px-2 border border-gray-200 rounded-lg text-[10.5px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
            >
              <option value="All">All Rate Plans</option>
              <option value="All Rate Plans">Global (All Plans)</option>
              <option value="Best Available Rate">Best Available Rate</option>
              <option value="Bed & Breakfast Package">Bed & Breakfast Package</option>
              <option value="Corporate Executive Rate">Corporate Executive Rate</option>
              <option value="Breakfast & Dinner Special">Breakfast & Dinner Special</option>
              <option value="Presidential All-Inclusive VIP">Presidential All-Inclusive VIP</option>
            </select>

            <button
              onClick={handleOpenAddModal}
              className="px-2.5 py-1 bg-[#1b7f43] hover:bg-[#156736] text-white rounded text-[11px] font-semibold shadow-xs transition cursor-pointer"
            >
              + Add Discount
            </button>
          </div>

        </div>

        {/* Data Table - Strictly 100% width with NO horizontal scroll */}
        <div className="w-full">
          <table className="w-full table-fixed text-left border-collapse">
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                <th className="py-2 px-2.5">Discount Name</th>
                <th className="py-2 px-2">Discount Code</th>
                <th className="py-2 px-1.5">Type</th>
                <th className="py-2 px-1.5">Value</th>
                <th className="py-2 px-2">Applicable Rate Plan</th>
                <th className="py-2 px-2">Validity Period</th>
                <th className="py-2 px-1 text-center">Status</th>
                <th className="py-2 px-1 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedDiscounts.map((disc) => (
                <tr key={disc.id} className="hover:bg-gray-50/60 transition-colors">
                  
                  {/* Name & description */}
                  <td className="py-1.5 px-2.5">
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 block text-[11px] leading-tight break-words">{disc.name}</span>
                      {disc.description && (
                        <p className="text-[9.5px] text-gray-500 truncate mt-0.5" title={disc.description}>
                          {disc.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Code Badge */}
                  <td className="py-1.5 px-2">
                    <span className="font-mono font-bold text-[10px] bg-emerald-50 text-[#1b7f43] px-1.5 py-0.5 rounded border border-[#1b7f43]/20 tracking-wider truncate inline-block max-w-full">
                      {disc.code}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-1.5 px-1.5">
                    <span className="text-gray-700 font-semibold text-[10.5px] truncate block">
                      {disc.discountType}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="py-1.5 px-1.5">
                    <span className="font-extrabold text-[11px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono truncate inline-block max-w-full">
                      {disc.discountType === 'Percentage' ? `${disc.discountValue}% Off` : `PKR ${Number(disc.discountValue).toLocaleString()}`}
                    </span>
                  </td>

                  {/* Applicable Rate Plan */}
                  <td className="py-1.5 px-2">
                    <div className="text-gray-800 font-medium min-w-0">
                      <span className="text-[11px] block leading-tight break-words">{disc.applicableRatePlan}</span>
                      <span className="text-[9px] text-gray-400 block truncate">{disc.applicableRoomType}</span>
                    </div>
                  </td>

                  {/* Validity Date Range */}
                  <td className="py-1.5 px-2">
                    <div className="text-gray-700 text-[9.5px] font-mono leading-tight">
                      <span className="font-medium block truncate">{disc.startDate}</span>
                      <span className="text-gray-400 block text-[8.5px]">to {disc.endDate}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-1.5 px-1 text-center">
                    <button
                      onClick={() => handleToggleStatus(disc)}
                      title="Click to toggle active status"
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-all ${
                        disc.status === 'Active'
                          ? 'bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d0ebd8] border border-[#1b7f43]/20'
                          : disc.status === 'Expired'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        disc.status === 'Active' ? 'bg-[#1b7f43]' : disc.status === 'Expired' ? 'bg-amber-500' : 'bg-gray-400'
                      }`}></span>
                      <span>{disc.status}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-1.5 px-1 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Tooltip title="Edit Discount">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditModal(disc)}
                          sx={{ padding: '2px', color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                        >
                          <Edit sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Discount">
                        <IconButton
                          size="small"
                          onClick={() => handlePromptDelete(disc)}
                          sx={{ padding: '2px', color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                        >
                          <Delete sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>

                </tr>
              ))}

              {paginatedDiscounts.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <LocalOffer sx={{ fontSize: 30, color: '#d1d5db' }} />
                      <p className="text-[12px] font-semibold text-gray-600">No discounts found matching your criteria.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setActiveStatusTab('All'); setSelectedTypeFilter('All'); setSelectedRatePlanFilter('All'); setCurrentPage(1); }}
                        className="text-[11px] text-[#1b7f43] font-bold hover:underline"
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
          <div className="p-2.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-gray-500">
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
                  className={`w-6 h-6 rounded-md text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
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
          sx={{ borderRadius: '10px', fontSize: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </div>
  );
}
