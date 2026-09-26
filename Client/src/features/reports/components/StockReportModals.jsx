import React from 'react';
import {
  Close as CloseIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { CATEGORIES } from '../data/stockDemoData';

export default function StockReportModals({
  isModalOpen,
  modalMode,
  editingItem,
  setEditingItem,
  setIsModalOpen,
  handleSaveModal,
  deleteConfirmItem,
  setDeleteConfirmItem,
  handleConfirmDelete
}) {
  return (
    <>
      {/* Add / Edit Record Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-scaleUp">
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-base font-semibold tracking-wide">
                {modalMode === 'add' ? 'New Record' : editingItem.productName || 'Edit Record'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveModal(editingItem);
              }}
              className="p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Product Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Product Code*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.productCode || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.productName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status*
                  </label>
                  <select
                    required
                    value={editingItem.status || 'In Stock'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800 bg-white"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    required
                    value={editingItem.category || 'Room Service'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    price*
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
                      value={editingItem.price === '' ? '' : editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.quantity === '' ? '' : editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-7 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirmItem.productName}"</span> ({deleteConfirmItem.productCode})? This action cannot be undone.
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
}
