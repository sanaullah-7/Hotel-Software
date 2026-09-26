import { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

import ActionModal from '../../../components/common/ActionModal';
import TaxModal from './components/TaxModal';
import FeeModal from './components/FeeModal';
import { TaxesTable } from '../components/TaxesTable';
import { FeesTable } from '../components/FeesTable';
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
  const filteredTaxes = taxes.filter((t) => {
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
  const filteredFees = fees.filter((f) => {
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
  const activeTaxesCount = taxes.filter((t) => t.status === 'Active').length;
  const exclusiveTaxesCount = taxes.filter((t) => t.taxNature === 'Exclusive').length;
  const inclusiveTaxesCount = taxes.filter((t) => t.taxNature === 'Inclusive').length;

  // Fee Metrics
  const totalFeesCount = fees.length;
  const activeFeesCount = fees.filter((f) => f.status === 'Active').length;
  const fixedFeesCount = fees.filter((f) => f.calculationType === 'Fixed Amount').length;
  const percentageFeesCount = fees.filter((f) => f.calculationType === 'Percentage').length;

  return (
    <div className="space-y-2 max-w-[1600px] mx-auto pb-2 animate-fade-in">
      {/* Top Segmented Main Tab Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveMainTab('taxes')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeMainTab === 'taxes'
                ? 'bg-white text-[#1b7f43] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Taxes ({taxes.length})
          </button>

          <button
            onClick={() => setActiveMainTab('fees')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeMainTab === 'fees'
                ? 'bg-white text-[#1b7f43] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Fees ({fees.length})
          </button>
        </div>
      </div>

      {/* 1. TAXES TAB CONTENT */}
      {activeMainTab === 'taxes' && (
        <TaxesTable
          totalTaxesCount={totalTaxesCount}
          activeTaxesCount={activeTaxesCount}
          exclusiveTaxesCount={exclusiveTaxesCount}
          inclusiveTaxesCount={inclusiveTaxesCount}
          taxSearch={taxSearch}
          setTaxSearch={setTaxSearch}
          setTaxPage={setTaxPage}
          taxStatusFilter={taxStatusFilter}
          setTaxStatusFilter={setTaxStatusFilter}
          taxCalcFilter={taxCalcFilter}
          setTaxCalcFilter={setTaxCalcFilter}
          handleOpenAddTax={handleOpenAddTax}
          paginatedTaxes={paginatedTaxes}
          handleToggleTaxStatus={handleToggleTaxStatus}
          handleOpenEditTax={handleOpenEditTax}
          handlePromptDeleteTax={handlePromptDeleteTax}
          totalTaxPages={totalTaxPages}
          taxPage={taxPage}
          itemsPerPage={itemsPerPage}
          filteredTaxes={filteredTaxes}
        />
      )}

      {/* 2. FEES TAB CONTENT */}
      {activeMainTab === 'fees' && (
        <FeesTable
          totalFeesCount={totalFeesCount}
          activeFeesCount={activeFeesCount}
          fixedFeesCount={fixedFeesCount}
          percentageFeesCount={percentageFeesCount}
          feeSearch={feeSearch}
          setFeeSearch={setFeeSearch}
          setFeePage={setFeePage}
          feeStatusFilter={feeStatusFilter}
          setFeeStatusFilter={setFeeStatusFilter}
          feeCalcFilter={feeCalcFilter}
          setFeeCalcFilter={setFeeCalcFilter}
          handleOpenAddFee={handleOpenAddFee}
          paginatedFees={paginatedFees}
          handleToggleFeeStatus={handleToggleFeeStatus}
          handleOpenEditFee={handleOpenEditFee}
          handlePromptDeleteFee={handlePromptDeleteFee}
          totalFeePages={totalFeePages}
          feePage={feePage}
          itemsPerPage={itemsPerPage}
          filteredFees={filteredFees}
        />
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
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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
