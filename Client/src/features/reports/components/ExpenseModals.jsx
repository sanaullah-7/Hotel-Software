import React from 'react';
import {
  EditOutlined as EditIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Receipt as InvoiceIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CreditCard as PaymentIcon,
  Business as VendorIcon,
  CheckCircleOutlined as StatusIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';

import { PAYMENT_MODES, STATUSES } from '../data/expenseDemoData';

export const ExpenseModals = ({
  detailItem,
  setDetailItem,
  handleOpenEditModal,
  renderStatusBadge,
  isAddEditModalOpen,
  setIsAddEditModalOpen,
  editingItem,
  setEditingItem,
  modalMode,
  handleSaveModal,
  deleteConfirmItem,
  setDeleteConfirmItem,
  handleConfirmDelete
}) => {
  return (
    <>
      {/* Row Detail View Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {detailItem.expenseBy.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-wide">All Expenses</h3>
                  <div className="text-xs text-indigo-100 font-medium">{detailItem.status}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(detailItem)}
                  title="Edit Expense"
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </button>
                <button
                  onClick={() => setDetailItem(null)}
                  title="Close"
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>

            {/* Modal Detail Cards Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <InvoiceIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Invoice No</div>
                  <div className="text-sm font-semibold text-gray-800">{detailItem.invoiceNo}</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CalendarIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Date</div>
                  <div className="text-sm font-semibold text-gray-800">{detailItem.date}</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <InvoiceIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Expense</div>
                  <div className="text-sm font-semibold text-gray-800">{detailItem.expense}</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <PersonIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Expense By</div>
                  <div className="text-sm font-semibold text-gray-800">{detailItem.expenseBy}</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <MoneyIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Amount</div>
                  <div className="text-sm font-semibold text-gray-800">${detailItem.amount}</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <PaymentIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Payment Mode</div>
                  <div className="text-sm font-semibold text-gray-800">{detailItem.paymentMode}</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <StatusIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Status</div>
                  <div className="mt-0.5">{renderStatusBadge(detailItem.status)}</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <VendorIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Paid To</div>
                  <div className="text-sm font-semibold text-gray-800">{detailItem.paidTo}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Record Modal */}
      {isAddEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-scaleUp">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-base font-semibold tracking-wide">
                {modalMode === 'add' ? 'New Record' : editingItem.expense || 'Edit Record'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveModal(editingItem);
              }}
              className="p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Invoice No*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.invoiceNo || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, invoiceNo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    required
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expense*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.expense || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, expense: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expense By*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.expenseBy || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, expenseBy: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={editingItem.amount === '' ? '' : editingItem.amount}
                      onChange={(e) => setEditingItem({ ...editingItem, amount: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Mode*
                  </label>
                  <select
                    required
                    value={editingItem.paymentMode || 'Cash'}
                    onChange={(e) => setEditingItem({ ...editingItem, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800 bg-white"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status*
                  </label>
                  <select
                    required
                    value={editingItem.status || 'Paid'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800 bg-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Paid To*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.paidTo || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, paidTo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-7 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-7 py-2 rounded-full bg-white hover:bg-red-50 text-red-500 border border-red-400 font-medium text-sm transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <WarningIcon sx={{ fontSize: 28 }} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Record</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirmItem.expense}"</span> (Invoice #{deleteConfirmItem.invoiceNo})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
