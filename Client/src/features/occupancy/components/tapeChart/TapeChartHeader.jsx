import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Refresh as RefreshIcon,
  ViewModule as GridViewIcon,
  Timeline as TimelineIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { formatRangeDisplay } from '../../utils/tapeChartDates';

export default function TapeChartHeader({
  startDate,
  viewDays,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onRefresh,
  loading,
  unassignedCount = 0,
  onToggleUnassigned,
  showUnassigned,
}) {
  const rangeDisplay = formatRangeDisplay(startDate, viewDays);

  return (
    <div className="bg-white rounded-[6px] border border-gray-100 shadow-xs p-2.5 sm:p-3 mb-2">
      {/* Top Bar: Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1b7f43] flex items-center justify-center shrink-0">
            <TimelineIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Room Tape Chart
              </h1>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-[#1b7f43] border border-emerald-100">
                Timeline
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Interactive date-based room occupancy &amp; Gantt schedule
            </p>
          </div>
        </div>

        {/* View Switcher: Room Cards vs Tape Chart */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-md text-xs font-medium">
            <Link
              to="/occupancy"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-gray-600 hover:text-gray-900 transition-colors"
              title="Switch to Card Grid View"
            >
              <GridViewIcon sx={{ fontSize: 13 }} />
              <span>Room Cards</span>
            </Link>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-[#1b7f43] font-semibold shadow-xs">
              <TimelineIcon sx={{ fontSize: 13 }} />
              <span>Tape Chart</span>
            </span>
          </div>

          {unassignedCount > 0 && (
            <button
              type="button"
              onClick={onToggleUnassigned}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                showUnassigned
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
              title="Toggle unassigned bookings tray"
            >
              <WarningIcon sx={{ fontSize: 13 }} />
              <span>Unassigned ({unassignedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar: Navigation, Date Display, View Selector, Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5">
        {/* Left: Navigation Buttons & Current Range */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={onNavigatePrev}
              disabled={loading}
              className="inline-flex items-center justify-center p-1 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 cursor-pointer"
              title={`Previous ${viewDays} days`}
              aria-label="Previous period"
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </button>
            <button
              type="button"
              onClick={onNavigateToday}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 cursor-pointer"
              title="Jump to today"
            >
              <TodayIcon sx={{ fontSize: 13 }} />
              <span>Today</span>
            </button>
            <button
              type="button"
              onClick={onNavigateNext}
              disabled={loading}
              className="inline-flex items-center justify-center p-1 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 cursor-pointer"
              title={`Next ${viewDays} days`}
              aria-label="Next period"
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </button>
          </div>

          <div className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md">
            <span className="text-xs font-bold text-gray-800 tracking-tight">
              {rangeDisplay}
            </span>
          </div>
        </div>

        {/* Right: View Window Selector (7 / 14 / 30 Days) & Refresh */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5 shadow-2xs text-[11px] font-medium">
            <button
              type="button"
              onClick={() => onViewChange(7)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewDays === 7
                  ? 'bg-white text-[#1b7f43] font-bold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => onViewChange(14)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewDays === 14
                  ? 'bg-white text-[#1b7f43] font-bold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => onViewChange(30)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewDays === 30
                  ? 'bg-white text-[#1b7f43] font-bold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Reload tape chart from server"
          >
            <RefreshIcon sx={{ fontSize: 14 }} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
