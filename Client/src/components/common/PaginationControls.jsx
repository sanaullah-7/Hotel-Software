import React from 'react';
import {
  KeyboardArrowDown as ArrowDownIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

/**
 * Standard Pagination Controls for tables across HMS modules.
 */
export default function PaginationControls({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  rowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 20, 50],
  onPageChange,
  onRowsPerPageChange,
  indexOfFirstRow,
  indexOfLastRow,
  variant = 'standard', // 'standard' | 'compact'
  className = ''
}) {
  const startRecord =
    totalRecords === 0
      ? 0
      : indexOfFirstRow !== undefined
      ? indexOfFirstRow + 1
      : (currentPage - 1) * rowsPerPage + 1;

  const endRecord =
    totalRecords === 0
      ? 0
      : indexOfLastRow !== undefined
      ? Math.min(indexOfLastRow, totalRecords)
      : Math.min(currentPage * rowsPerPage, totalRecords);

  const calculatedTotalPages =
    totalPages > 0
      ? totalPages
      : Math.max(1, Math.ceil(totalRecords / (rowsPerPage || 10)));

  if (variant === 'compact') {
    return (
      <div className={`p-4 flex items-center justify-end gap-6 text-[12px] text-gray-600 border-t border-gray-100 ${className}`}>
        {rowsPerPageOptions && onRowsPerPageChange && (
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 outline-none text-[12px] bg-white cursor-pointer"
            >
              {rowsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <span>
          {startRecord} - {endRecord} of {totalRecords}
        </span>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
            className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(Math.min(currentPage + 1, calculatedTotalPages))}
            disabled={currentPage >= calculatedTotalPages}
            className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {'>'}
          </button>
        </div>
      </div>
    );
  }

  // Default: 'standard'
  return (
    <div className={`p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      <span className="text-[12px] text-gray-500">
        Showing <span className="font-semibold text-gray-700">{startRecord}</span> -{' '}
        <span className="font-semibold text-gray-700">{endRecord}</span> of{' '}
        <span className="font-semibold text-gray-700">{totalRecords}</span> records
      </span>

      <div className="flex items-center gap-3">
        {rowsPerPageOptions && onRowsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px] text-gray-500 font-medium">Items per page:</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                className="appearance-none pl-2.5 pr-6 py-1 border border-gray-200 rounded-lg text-[11.5px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {rowsPerPageOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ArrowDownIcon
                sx={{ fontSize: 14 }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        )}

        <span className="text-[11.5px] text-gray-500 font-medium">
          {startRecord}–{endRecord} of {totalRecords}
        </span>

        {onPageChange && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
              className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title="First Page"
            >
              <FirstPageIcon fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeftIcon fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(currentPage + 1, calculatedTotalPages))}
              disabled={currentPage >= calculatedTotalPages}
              className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title="Next Page"
            >
              <ChevronRightIcon fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(calculatedTotalPages)}
              disabled={currentPage >= calculatedTotalPages}
              className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title="Last Page"
            >
              <LastPageIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
