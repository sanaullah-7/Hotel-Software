import React from 'react';
import {
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
} from '@mui/icons-material';

export default function StockReportTable({
  currentStocks,
  visibleColumns,
  selectedIds,
  isAllSelected,
  isIndeterminate,
  handleSelectAll,
  handleSelectRow,
  handleOpenEditModal,
  handleDeleteClick
}) {
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e6f7ec] text-[#16a34a]">
            In Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e0f2fe] text-[#2563eb]">
            Low Stock
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#ffedd5] text-[#ea580c]">
            Out of Stock
          </span>
        );
      default:
        return <span className="text-xs text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="w-full overflow-x-auto min-w-0">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-white">
            {visibleColumns.checkbox && (
              <th className="py-2 px-2.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                />
              </th>
            )}
            {visibleColumns.productCode && (
              <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Product Code</th>
            )}
            {visibleColumns.productName && (
              <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Product Name</th>
            )}
            {visibleColumns.status && (
              <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Status</th>
            )}
            {visibleColumns.price && (
              <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Price</th>
            )}
            {visibleColumns.category && (
              <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Category</th>
            )}
            {visibleColumns.quantity && (
              <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Quantity</th>
            )}
            {visibleColumns.actions && (
              <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider text-right pr-4">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 text-sm">
          {currentStocks.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-12 text-gray-400">
                No matching stock items found.
              </td>
            </tr>
          ) : (
            currentStocks.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <tr
                  key={item.id}
                  className={`transition-colors duration-150 hover:bg-gray-50/75 ${
                    isSelected ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  {visibleColumns.checkbox && (
                    <td className="py-1.5 px-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(item.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                    </td>
                  )}
                  {visibleColumns.productCode && (
                    <td className="py-1.5 px-2.5 font-normal text-gray-600">{item.productCode}</td>
                  )}
                  {visibleColumns.productName && (
                    <td className="py-1.5 px-2.5 font-medium text-gray-800">{item.productName}</td>
                  )}
                  {visibleColumns.status && (
                    <td className="py-1.5 px-2.5">{renderStatusBadge(item.status)}</td>
                  )}
                  {visibleColumns.price && (
                    <td className="py-1.5 px-2.5 font-normal text-gray-700">{item.price}</td>
                  )}
                  {visibleColumns.category && (
                    <td className="py-1.5 px-2.5 font-normal text-gray-600">{item.category}</td>
                  )}
                  {visibleColumns.quantity && (
                    <td className="py-1.5 px-2.5 font-normal text-gray-700">{item.quantity}</td>
                  )}
                  {visibleColumns.actions && (
                    <td className="py-1.5 px-2.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Record"
                          className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded transition"
                        >
                          <EditIcon sx={{ fontSize: 17 }} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          title="Delete Record"
                          className="text-orange-500 hover:text-orange-700 p-1 hover:bg-orange-50 rounded transition"
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
