import React, { useState, useEffect, useCallback } from 'react';
import {
  Payments as RevenueIcon,
  ReceiptLong as ExpenseIcon,
  Savings as ProfitIcon,
  Percent as MarginIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { CircularProgress, Alert, Button } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

import reportService from '../../../../services/reportService.js';
import { toFrontendExpenseVsRevenueReport } from '../../adapters/reportAdapter.js';

// Custom Tooltip for Spline Area Chart
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const rev = payload[0]?.value || 0;
    const exp = payload[1]?.value || 0;
    const diff = rev - exp;
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-xs font-sans min-w-[200px]">
        <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">{label}</p>
        <div className="flex items-center justify-between gap-4 py-0.5 text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00b894]"></span>
            Total Revenue:
          </span>
          <span className="font-bold text-gray-900">${rev.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5 text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7875]"></span>
            Total Operating Expense:
          </span>
          <span className="font-bold text-gray-900">${exp.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-gray-100 text-gray-600 font-medium">
          <span>Profit Gap:</span>
          <span className={`font-bold ${diff >= 0 ? 'text-[#00b894]' : 'text-[#ff4d4f]'}`}>
            {diff >= 0 ? '+' : '-'}${Math.abs(diff).toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ExpenseVsRevenueTab() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenseVsRevenueData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getExpenseVsRevenueReport();
      const raw = res?.data || res;
      setReportData(toFrontendExpenseVsRevenueReport(raw));
    } catch (err) {
      console.error('Failed to load expense vs revenue report:', err);
      setError(err?.message || 'Failed to load financial comparison data from server. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates on mount, event dispatch, and focus
  useEffect(() => {
    fetchExpenseVsRevenueData();

    const handleSync = () => {
      fetchExpenseVsRevenueData();
    };

    window.addEventListener('hotel:data-updated', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('hotel:data-updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [fetchExpenseVsRevenueData]);

  const kpi = reportData?.kpi || {
    totalRevenueYtd: 0,
    totalExpensesYtd: 0,
    netProfit: 0,
    profitMargin: 0,
  };
  const monthlyTrendsData = reportData?.monthlyTrendsData || [];

  return (
    <div className="w-full space-y-3 pb-0 font-sans">
      {/* Header with Refresh button */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Expense vs. Revenue Analysis</h2>
          <p className="text-xs text-gray-500">Live operational financial comparison, net profit margins, and trend dynamics</p>
        </div>
        <button
          onClick={fetchExpenseVsRevenueData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
        >
          <RefreshIcon sx={{ fontSize: 16 }} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchExpenseVsRevenueData}>
              Retry Connection
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && !reportData ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <CircularProgress size={36} sx={{ color: '#00b894' }} />
          <p className="mt-3 text-sm text-gray-500 font-medium">Computing live revenue vs. expense comparisons...</p>
        </div>
      ) : (
        <>
          {/* 1. KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-1 mb-2">
            {/* Card 1: TOTAL REVENUE (YTD) */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  ${kpi.totalRevenueYtd.toLocaleString()}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Total Revenue (YTD)</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                <RevenueIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 2: TOTAL EXPENSES (YTD) */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  ${kpi.totalExpensesYtd.toLocaleString()}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Total Expenses (YTD)</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-50 text-red-600 shrink-0">
                <ExpenseIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 3: NET PROFIT */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold leading-none mb-1 ${kpi.netProfit >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                  ${kpi.netProfit.toLocaleString()}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Net Operating Profit</div>
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${kpi.netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <ProfitIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 4: OPERATING MARGIN */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold leading-none mb-1 ${kpi.profitMargin >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                  {kpi.profitMargin}%
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Net Profit Margin</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
                <MarginIcon sx={{ fontSize: 20 }} />
              </div>
            </div>
          </div>

          {/* 2. Revenue vs Expense Trends Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Revenue vs. Expense Trends</h3>
                <p className="text-xs text-gray-500 mt-1">Monthly performance comparison and profitability gap</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00b894]"></span>
                  <span className="text-xs font-semibold text-gray-700">Total Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff7875]"></span>
                  <span className="text-xs font-semibold text-gray-700">Total Operating Expense</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="w-full h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevTrends" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00b894" stopOpacity={0.25} />
                      <stop offset="90%" stopColor="#00b894" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorExpTrends" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff7875" stopOpacity={0.15} />
                      <stop offset="90%" stopColor="#ff7875" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    domain={[0, 'auto']}
                    tickFormatter={(val) => {
                      if (val === 0) return '$0';
                      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                      if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
                      return `$${val}`;
                    }}
                  />
                  <RechartsTooltip content={<CustomAreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#00b894"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevTrends)"
                    activeDot={{ r: 6, fill: '#00b894', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ff7875"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExpTrends)"
                    activeDot={{ r: 6, fill: '#ff7875', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
