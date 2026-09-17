import { useState, useEffect } from 'react';
import {
  Search, Clear, Add, Edit, Delete, AccountBalance,
  ReceiptLong, CheckCircle, Percent, ChevronLeft,
  ChevronRight, MonetizationOn
} from '@mui/icons-material';
import {
  IconButton, Snackbar, Alert, Tooltip
} from '@mui/material';
import ActionModal from '../../components/common/ActionModal';
import TaxModal from './components/TaxModal';
import FeeModal from './components/FeeModal';
import {
  getTaxes, addTax, updateTax, deleteTax, toggleTaxStatus,
  getFees, addFee, updateFee, deleteFee, toggleFeeStatus
} from './ratesPricingStore';

export default function TaxesFees() {
  const [activeMainTab, setActiveMainTab] = useState('taxes'); // 'taxes' or 'fees'

  // Data State
  const [taxes, setTaxes] = useState([]);
  const [fees, setFees] = useState([]);

  // Search & Filters
  const [taxSearch, setTaxSearch] = useState('');
  const [taxStatusFilter, setTaxStatusFilter] = useState('All');
  const [taxCalcFilter, setTaxCalcFilter] = useState('All');

  const [feeSearch, setFeeSearch] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('All');
  const [feeCalcFilter, setFeeCalcFilter] = useState('All');

  // Modals
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [deleteTaxModalOpen, setDeleteTaxModalOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState(null);

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [deleteFeeModalOpen, setDeleteFeeModalOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pagination
  const [taxPage, setTaxPage] = useState(1);
  const [feePage, setFeePage] = useState(1);
  const itemsPerPage = 8;

  const refreshData = () => {
    setTaxes(getTaxes());
    setFees(getFees());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- TAX HANDLERS ---
  const handleOpenAddTax = () => {
    setEditingTax(null);
    setTaxModalOpen(true);
  };

  const handleOpenEditTax = (tax) => {
    setEditingTax(tax);
    setTaxModalOpen(true);
  };

  const handleSaveTax = (taxData, taxId) => {
    if (taxId) {
      updateTax(taxId, taxData);
      setSnackbar({ open: true, message: `Tax "${taxData.name}" updated successfully!`, severity: 'success' });
    } else {
      addTax(taxData);
      setSnackbar({ open: true, message: `Tax "${taxData.name}" created successfully!`, severity: 'success' });
    }
    setTaxModalOpen(false);
    refreshData();
  };

  const handlePromptDeleteTax = (tax) => {
    setTaxToDelete(tax);
    setDeleteTaxModalOpen(true);
  };

  const handleConfirmDeleteTax = () => {
    if (taxToDelete) {
      deleteTax(taxToDelete.id);
      setSnackbar({ open: true, message: `Tax "${taxToDelete.name}" removed.`, severity: 'info' });
      setDeleteTaxModalOpen(false);
      setTaxToDelete(null);
      refreshData();
    }
  };

  const handleToggleTaxStatus = (tax) => {
    toggleTaxStatus(tax.id);
    const nextStatus = tax.status === 'Active' ? 'Inactive' : 'Active';
    setSnackbar({ open: true, message: `Tax "${tax.name}" is now ${nextStatus}.`, severity: 'success' });
    refreshData();
  };

  // --- FEE HANDLERS ---
  const handleOpenAddFee = () => {
    setEditingFee(null);
    setFeeModalOpen(true);
  };

  const handleOpenEditFee = (fee) => {
    setEditingFee(fee);
    setFeeModalOpen(true);
  };

  const handleSaveFee = (feeData, feeId) => {
    if (feeId) {
      updateFee(feeId, feeData);
      setSnackbar({ open: true, message: `Fee "${feeData.name}" updated successfully!`, severity: 'success' });
    } else {
      addFee(feeData);
      setSnackbar({ open: true, message: `Fee "${feeData.name}" created successfully!`, severity: 'success' });
    }
    setFeeModalOpen(false);
    refreshData();
  };

  const handlePromptDeleteFee = (fee) => {
    setFeeToDelete(fee);
    setDeleteFeeModalOpen(true);
  };

  const handleConfirmDeleteFee = () => {
    if (feeToDelete) {
      deleteFee(feeToDelete.id);
      setSnackbar({ open: true, message: `Fee "${feeToDelete.name}" removed.`, severity: 'info' });
      setDeleteFeeModalOpen(false);
      setFeeToDelete(null);
      refreshData();
    }
  };

  const handleToggleFeeStatus = (fee) => {
    toggleFeeStatus(fee.id);
    const nextStatus = fee.status === 'Active' ? 'Inactive' : 'Active';
    setSnackbar({ open: true, message: `Fee "${fee.name}" is now ${nextStatus}.`, severity: 'success' });
    refreshData();
  };

  // Filtered Taxes
  const filteredTaxes = taxes.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(taxSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(taxSearch.toLowerCase()) ||
      t.appliesTo.toLowerCase().includes(taxSearch.toLowerCase());
    const matchesStatus = taxStatusFilter === 'All' || t.status === taxStatusFilter;
    const matchesCalc = taxCalcFilter === 'All' || t.calculationType === taxCalcFilter;
    return matchesSearch && matchesStatus && matchesCalc;
  });

  const totalTaxPages = Math.ceil(filteredTaxes.length / itemsPerPage);
  const paginatedTaxes = filteredTaxes.slice((taxPage - 1) * itemsPerPage, taxPage * itemsPerPage);

  // Filtered Fees
  const filteredFees = fees.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(feeSearch.toLowerCase()) ||
      f.code.toLowerCase().includes(feeSearch.toLowerCase()) ||
      f.appliesTo.toLowerCase().includes(feeSearch.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(feeSearch.toLowerCase()));
    const matchesStatus = feeStatusFilter === 'All' || f.status === feeStatusFilter;
    const matchesCalc = feeCalcFilter === 'All' || f.calculationType === feeCalcFilter;
    return matchesSearch && matchesStatus && matchesCalc;
  });

  const totalFeePages = Math.ceil(filteredFees.length / itemsPerPage);
  const paginatedFees = filteredFees.slice((feePage - 1) * itemsPerPage, feePage * itemsPerPage);

  // Tax Metrics
  const totalTaxesCount = taxes.length;
  const activeTaxesCount = taxes.filter(t => t.status === 'Active').length;
  const exclusiveTaxesCount = taxes.filter(t => t.taxNature === 'Exclusive').length;
  const inclusiveTaxesCount = taxes.filter(t => t.taxNature === 'Inclusive').length;

  // Fee Metrics
  const totalFeesCount = fees.length;
  const activeFeesCount = fees.filter(f => f.status === 'Active').length;
  const fixedFeesCount = fees.filter(f => f.calculationType === 'Fixed Amount').length;
  const percentageFeesCount = fees.filter(f => f.calculationType === 'Percentage').length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8 animate-fade-in">
      <div className="h-1"></div>

      {/* Top Header Card with Segmented Main Tab Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Taxes & Fees</h1>
            <span className="bg-[#e5f4eb] text-[#1b7f43] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {taxes.length + fees.length} Total Rules
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure statutory government levies, VAT/GST parameters, and operational hotel service surcharges.
          </p>
        </div>

        {/* Tab Switcher: [ Taxes ] [ Fees ] */}
        <div className="flex items-center bg-gray-100 p-1 rounded-2xl self-start sm:self-auto border border-gray-200">
          <button
            onClick={() => setActiveMainTab('taxes')}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'taxes'
                ? 'bg-white text-[#1b7f43] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AccountBalance sx={{ fontSize: 16 }} />
            <span>Taxes ({taxes.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('fees')}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'fees'
                ? 'bg-white text-[#1b7f43] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ReceiptLong sx={{ fontSize: 16 }} />
            <span>Fees ({fees.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TAXES TAB CONTENT */}
      {/* ======================================================== */}
      {activeMainTab === 'taxes' && (
        <div className="space-y-4">
          
          {/* Tax Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-semibold text-[11px] truncate">Total Taxes</span>
                <AccountBalance className="text-indigo-500 shrink-0" sx={{ fontSize: 17 }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-900">{totalTaxesCount}</span>
                <span className="text-[10px] text-gray-400 font-medium">Configured</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-semibold text-[11px] truncate">Active Taxes</span>
                <CheckCircle className="text-emerald-600 shrink-0" sx={{ fontSize: 17 }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-emerald-700">{activeTaxesCount}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Applied at Billing</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-semibold text-[11px] truncate">Exclusive Taxes</span>
                <Percent className="text-blue-500 shrink-0" sx={{ fontSize: 17 }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-900">{exclusiveTaxesCount}</span>
                <span className="text-[10px] text-blue-600 font-medium">Added to Invoice</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-semibold text-[11px] truncate">Inclusive Taxes</span>
                <Percent className="text-amber-500 shrink-0" sx={{ fontSize: 17 }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-900">{inclusiveTaxesCount}</span>
                <span className="text-[10px] text-amber-600 font-medium">In Base Price</span>
              </div>
            </div>
          </div>

          {/* Tax Table Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            
            {/* Controls Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
                  <input
                    type="text"
                    placeholder="Search tax name, code, applies to..."
                    value={taxSearch}
                    onChange={(e) => {
                      setTaxSearch(e.target.value);
                      setTaxPage(1);
                    }}
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
                  />
                  {taxSearch && (
                    <button
                      onClick={() => {
                        setTaxSearch('');
                        setTaxPage(1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Clear sx={{ fontSize: 14 }} />
                    </button>
                  )}
                </div>

                {/* Status Segmented */}
                <div className="flex bg-gray-50 p-0.5 border border-gray-200 rounded-xl overflow-x-auto hide-scrollbar shrink-0">
                  {['All', 'Active', 'Inactive'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setTaxStatusFilter(tab);
                        setTaxPage(1);
                      }}
                      className={`px-3 py-1 text-[11px] font-semibold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                        taxStatusFilter === tab
                          ? 'bg-white text-[#1b7f43] shadow-xs font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-auto">
                <select
                  value={taxCalcFilter}
                  onChange={(e) => {
                    setTaxCalcFilter(e.target.value);
                    setTaxPage(1);
                  }}
                  className="py-1.5 px-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
                >
                  <option value="All">All Calculations</option>
                  <option value="Percentage">Percentage Only</option>
                  <option value="Fixed Amount">Fixed Amount Only</option>
                </select>

                <button
                  onClick={handleOpenAddTax}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1b7f43] hover:bg-[#156736] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Add sx={{ fontSize: 17 }} />
                  <span>Add Tax</span>
                </button>
              </div>
            </div>

            {/* Taxes Data Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Tax Name</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Tax Code</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Calculation</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Rate / Value</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Application</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Nature</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap text-center">Status</th>
                    <th className="py-2.5 px-2 text-right whitespace-nowrap w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedTaxes.map((tax) => (
                    <tr key={tax.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2 px-3">
                        <div>
                          <span className="font-bold text-gray-900 block text-xs leading-tight">{tax.name}</span>
                          {tax.description && (
                            <p className="text-[10.5px] text-gray-500 truncate max-w-[180px] mt-0.5">
                              {tax.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-[11px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md border border-gray-200 whitespace-nowrap">
                          {tax.code}
                        </span>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap text-gray-700 font-semibold text-[11px]">
                        {tax.calculationType}
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
                          {tax.calculationType === 'Percentage' ? `${tax.value}%` : `PKR ${Number(tax.value).toLocaleString()}`}
                        </span>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="text-gray-800 font-medium text-xs">{tax.appliesTo}</span>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${
                          tax.taxNature === 'Exclusive'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {tax.taxNature}
                        </span>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleTaxStatus(tax)}
                          title="Toggle Active Status"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                            tax.status === 'Active'
                              ? 'bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d0ebd8] border border-[#1b7f43]/20'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tax.status === 'Active' ? 'bg-[#1b7f43]' : 'bg-gray-400'}`}></span>
                          <span className="whitespace-nowrap">{tax.status}</span>
                        </button>
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Tooltip title="Edit Tax">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditTax(tax)}
                              sx={{ padding: '2px', color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                            >
                              <Edit sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Tax">
                            <IconButton
                              size="small"
                              onClick={() => handlePromptDeleteTax(tax)}
                              sx={{ padding: '2px', color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                            >
                              <Delete sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedTaxes.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AccountBalance sx={{ fontSize: 36, color: '#d1d5db' }} />
                          <p className="text-sm font-semibold text-gray-600">No taxes match your search or filter criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalTaxPages > 0 && (
              <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{(taxPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-semibold text-gray-700">{Math.min(taxPage * itemsPerPage, filteredTaxes.length)}</span> of{' '}
                  <span className="font-semibold text-gray-700">{filteredTaxes.length}</span> taxes
                </span>

                <div className="flex items-center space-x-1 self-end sm:self-auto">
                  <button
                    onClick={() => setTaxPage(prev => Math.max(prev - 1, 1))}
                    disabled={taxPage === 1}
                    className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft fontSize="small" />
                  </button>

                  {[...Array(totalTaxPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTaxPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        taxPage === i + 1
                          ? 'bg-[#1b7f43] text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setTaxPage(prev => Math.min(prev + 1, totalTaxPages))}
                    disabled={taxPage === totalTaxPages}
                    className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronRight fontSize="small" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FEES TAB CONTENT */}
      {/* ======================================================== */}
      {activeMainTab === 'fees' && (
        <div className="space-y-4">
          
          {/* Fee Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-semibold text-[11px] truncate">Total Fees</span>
                <ReceiptLong className="text-indigo-500 shrink-0" sx={{ fontSize: 17 }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-900">{totalFeesCount}</span>
                <span className="text-[10px] text-gray-400 font-medium">Configured</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-semibold text-[11px] truncate">Active Fees</span>
                <CheckCircle className="text-emerald-600 shrink-0" sx={{ fontSize: 17 }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-emerald-700">{activeFeesCount}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Live in Billing</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-semibold text-[11px] truncate">Fixed Surcharges</span>
                <MonetizationOn className="text-blue-500 shrink-0" sx={{ fontSize: 17 }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-900">{fixedFeesCount}</span>
                <span className="text-[10px] text-blue-600 font-medium">PKR Flat Amount</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-semibold text-[11px] truncate">Percentage Fees</span>
                <Percent className="text-amber-500 shrink-0" sx={{ fontSize: 17 }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-900">{percentageFeesCount}</span>
                <span className="text-[10px] text-amber-600 font-medium">% Of Total Bill</span>
              </div>
            </div>
          </div>

          {/* Fee Table Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            
            {/* Controls Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
                  <input
                    type="text"
                    placeholder="Search fee name, code, applies to..."
                    value={feeSearch}
                    onChange={(e) => {
                      setFeeSearch(e.target.value);
                      setFeePage(1);
                    }}
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
                  />
                  {feeSearch && (
                    <button
                      onClick={() => {
                        setFeeSearch('');
                        setFeePage(1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Clear sx={{ fontSize: 14 }} />
                    </button>
                  )}
                </div>

                {/* Status Segmented */}
                <div className="flex bg-gray-50 p-0.5 border border-gray-200 rounded-xl overflow-x-auto hide-scrollbar shrink-0">
                  {['All', 'Active', 'Inactive'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setFeeStatusFilter(tab);
                        setFeePage(1);
                      }}
                      className={`px-3 py-1 text-[11px] font-semibold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                        feeStatusFilter === tab
                          ? 'bg-white text-[#1b7f43] shadow-xs font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-auto">
                <select
                  value={feeCalcFilter}
                  onChange={(e) => {
                    setFeeCalcFilter(e.target.value);
                    setFeePage(1);
                  }}
                  className="py-1.5 px-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
                >
                  <option value="All">All Calculations</option>
                  <option value="Fixed Amount">Fixed Amount Only</option>
                  <option value="Percentage">Percentage Only</option>
                </select>

                <button
                  onClick={handleOpenAddFee}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1b7f43] hover:bg-[#156736] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Add sx={{ fontSize: 17 }} />
                  <span>Add Fee</span>
                </button>
              </div>
            </div>

            {/* Fees Data Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Fee Name</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Fee Code</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Calculation</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Value / Rate</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Application</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap text-center">Status</th>
                    <th className="py-2.5 px-2 text-right whitespace-nowrap w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2 px-3">
                        <div>
                          <span className="font-bold text-gray-900 block text-xs leading-tight">{fee.name}</span>
                          {fee.description && (
                            <p className="text-[10.5px] text-gray-500 truncate max-w-[180px] mt-0.5">
                              {fee.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-[11px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md border border-gray-200 whitespace-nowrap">
                          {fee.code}
                        </span>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap text-gray-700 font-semibold text-[11px]">
                        {fee.calculationType}
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
                          {fee.calculationType === 'Percentage' ? `${fee.value}%` : `PKR ${Number(fee.value).toLocaleString()}`}
                        </span>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="text-gray-800 font-medium text-xs">{fee.appliesTo}</span>
                      </td>

                      <td className="py-2 px-2.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleFeeStatus(fee)}
                          title="Toggle Active Status"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                            fee.status === 'Active'
                              ? 'bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d0ebd8] border border-[#1b7f43]/20'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${fee.status === 'Active' ? 'bg-[#1b7f43]' : 'bg-gray-400'}`}></span>
                          <span className="whitespace-nowrap">{fee.status}</span>
                        </button>
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Tooltip title="Edit Fee">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditFee(fee)}
                              sx={{ padding: '2px', color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                            >
                              <Edit sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Fee">
                            <IconButton
                              size="small"
                              onClick={() => handlePromptDeleteFee(fee)}
                              sx={{ padding: '2px', color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                            >
                              <Delete sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedFees.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ReceiptLong sx={{ fontSize: 36, color: '#d1d5db' }} />
                          <p className="text-sm font-semibold text-gray-600">No fees match your search or filter criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalFeePages > 0 && (
              <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{(feePage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-semibold text-gray-700">{Math.min(feePage * itemsPerPage, filteredFees.length)}</span> of{' '}
                  <span className="font-semibold text-gray-700">{filteredFees.length}</span> fees
                </span>

                <div className="flex items-center space-x-1 self-end sm:self-auto">
                  <button
                    onClick={() => setFeePage(prev => Math.max(prev - 1, 1))}
                    disabled={feePage === 1}
                    className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft fontSize="small" />
                  </button>

                  {[...Array(totalFeePages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFeePage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        feePage === i + 1
                          ? 'bg-[#1b7f43] text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setFeePage(prev => Math.min(prev + 1, totalFeePages))}
                    disabled={feePage === totalFeePages}
                    className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronRight fontSize="small" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Tax Modal */}
      <TaxModal
        open={taxModalOpen}
        onClose={() => setTaxModalOpen(false)}
        tax={editingTax}
        onSave={handleSaveTax}
      />

      {/* Fee Modal */}
      <FeeModal
        open={feeModalOpen}
        onClose={() => setFeeModalOpen(false)}
        fee={editingFee}
        onSave={handleSaveFee}
      />

      {/* Delete Tax Confirmation */}
      <ActionModal
        open={deleteTaxModalOpen}
        title="Delete Tax Rule?"
        description={
          taxToDelete
            ? `Are you sure you want to delete the tax rule "${taxToDelete.name}" (${taxToDelete.code})? It will be removed from prospective reservation billing calculations.`
            : ''
        }
        onClose={() => setDeleteTaxModalOpen(false)}
        onConfirm={handleConfirmDeleteTax}
        confirmText="Delete Tax"
        cancelText="Keep Tax"
        confirmColor="error"
      />

      {/* Delete Fee Confirmation */}
      <ActionModal
        open={deleteFeeModalOpen}
        title="Delete Fee Surcharge?"
        description={
          feeToDelete
            ? `Are you sure you want to delete the fee surcharge "${feeToDelete.name}" (${feeToDelete.code})?`
            : ''
        }
        onClose={() => setDeleteFeeModalOpen(false)}
        onConfirm={handleConfirmDeleteFee}
        confirmText="Delete Fee"
        cancelText="Keep Fee"
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
