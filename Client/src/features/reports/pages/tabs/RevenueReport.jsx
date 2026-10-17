import React, { useState, useEffect, useCallback } from 'react';
import {
  AttachMoney as DollarIcon,
  TrendingUp as TrendingUpIcon,
  Hotel as BedIcon,
  AccountBalanceWallet as WalletIcon,
  AutoAwesome as SparkleIcon,
  Public as GlobeIcon,
  Apartment as BuildingIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Close as CloseIcon,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import reportService from '../../../../services/reportService.js';
import { toFrontendRevenueReport } from '../../adapters/reportAdapter.js';

// Custom Label inside donut slices
const RADIAN = Math.PI / 180;
const renderCustomizedDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (!percent || percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-bold select-none pointer-events-none"
      style={{ fontSize: '13px', fontWeight: 700 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom Area Chart Tooltip
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-xs">
        <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">{label}</p>
        <div className="flex items-center justify-between gap-4 py-0.5 text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008ffb]"></span>
            Current Year:
          </span>
          <span className="font-bold text-gray-900">${payload[0]?.value?.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5 text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e396]"></span>
            Previous Year:
          </span>
          <span className="font-bold text-gray-900">${payload[1]?.value?.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const fetchRevenueData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getRevenueReport();
      const raw = res?.data || res;
      setReportData(toFrontendRevenueReport(raw));
    } catch (err) {
      console.error('Failed to load revenue report:', err);
      setError(err?.message || 'Failed to load revenue data from server. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates on mount, event dispatch, and focus
  useEffect(() => {
    fetchRevenueData();

    const handleSync = () => {
      fetchRevenueData();
    };

    window.addEventListener('hotel:data-updated', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('hotel:data-updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [fetchRevenueData]);

  const kpi = reportData?.kpi || { totalRevenue: 0, adr: 0, revPar: 0, grossMargin: 0 };
  const trendData = reportData?.trendData || [];
  const donutData = reportData?.donutData || [];
  const sourceData = reportData?.sourceData || [];

  const getSourceIcon = (sourceName) => {
    if (sourceName.includes('Direct')) return BedIcon;
    if (sourceName.includes('OTA')) return GlobeIcon;
    if (sourceName.includes('Corporate')) return BuildingIcon;
    if (sourceName.includes('Agent')) return GroupsIcon;
    return PersonIcon;
  };

  const getSourceBg = (index) => {
    const bgs = ['bg-[#e0edff] text-[#2563eb]', 'bg-[#e0f7ef] text-[#00b894]', 'bg-[#ffedd5] text-[#f97316]', 'bg-[#ede9fe] text-[#7c3aed]', 'bg-[#ffe4e6] text-[#f43f5e]'];
    return bgs[index % bgs.length];
  };

  return (
    <div className="w-full space-y-3 pb-1 font-sans">
      {/* Header with Refresh button */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue Performance</h2>
          <p className="text-xs text-gray-500">Live consolidated hotel revenue across bookings, food & beverage, and banquet services</p>
        </div>
        <button
          onClick={fetchRevenueData}
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
            <Button color="inherit" size="small" onClick={fetchRevenueData}>
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
          <CircularProgress size={36} sx={{ color: '#2563eb' }} />
          <p className="mt-3 text-sm text-gray-500 font-medium">Computing real-time revenue analytics...</p>
        </div>
      ) : (
        <>
          {/* 1. KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-1 mb-2">
            {/* Card 1: TOTAL REVENUE */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  ${kpi.totalRevenue.toLocaleString()}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Total Realized Revenue</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                <DollarIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 2: AVG. DAILY RATE */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  ${kpi.adr}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Avg. Daily Rate (ADR)</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-50 text-red-600">
                <TrendingUpIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 3: RevPAR */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  ${kpi.revPar}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">RevPAR (Per Available Room)</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
                <WalletIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 4: GROSS MARGIN */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  {kpi.grossMargin}%
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Operating Gross Margin</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                <BedIcon sx={{ fontSize: 20 }} />
              </div>
            </div>
          </div>

          {/* 2. Revenue Trend Analysis (Area Chart) */}
          <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Revenue Trend Analysis</h3>
                <p className="text-xs text-gray-500">Monthly revenue dynamic breakdown comparing current year against past year</p>
              </div>
              <button
                onClick={() => setShowAiModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <SparkleIcon sx={{ fontSize: 14 }} />
                AI Analysis
              </button>
            </div>

            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradient2024" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008ffb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#008ffb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradient2023" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e396" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00e396" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
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
                  <Area type="monotone" dataKey="rev2024" name="Current Year" stroke="#008ffb" strokeWidth={2.5} fillOpacity={1} fill="url(#gradient2024)" activeDot={{ r: 5, fill: '#008ffb' }} />
                  <Area type="monotone" dataKey="rev2023" name="Previous Year" stroke="#00e396" strokeWidth={2} fillOpacity={1} fill="url(#gradient2023)" strokeDasharray="3 3" activeDot={{ r: 4, fill: '#00e396' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Revenue Distribution Donut & Source Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Donut Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-[16px] font-bold text-gray-900 mb-1">Revenue Distribution</h3>
              <p className="text-xs text-gray-500 mb-2">By room revenue, food & beverage, and event services</p>

              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      label={renderCustomizedDonutLabel}
                      labelLine={false}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val, name) => [`${val}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-2 text-xs font-semibold text-gray-700">
                {donutData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span>{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown by Source Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-[16px] font-bold text-gray-900 mb-1">Revenue Breakdown by Source</h3>
              <p className="text-xs text-gray-500 mb-3">Booking channel performance based on database accounts</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase">
                      <th className="py-2.5 px-3">SOURCE</th>
                      <th className="py-2.5 px-3">REVENUE</th>
                      <th className="py-2.5 px-3">SHARE</th>
                      <th className="py-2.5 px-3">TREND</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sourceData.map((row, idx) => {
                      const IconComp = getSourceIcon(row.source);
                      return (
                        <tr key={row.id || idx} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${getSourceBg(idx)}`}>
                                <IconComp sx={{ fontSize: 15 }} />
                              </div>
                              <span className="font-semibold text-gray-800">{row.source}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">{row.revenue}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-600">{row.percentage}%</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${row.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {row.trend}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI Explain Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
            <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
            <div className="flex items-center gap-2 mb-3 text-blue-600">
              <SparkleIcon sx={{ fontSize: 22 }} />
              <h3 className="font-bold text-base text-gray-900">AI Revenue Intelligence</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Based on active room bookings, event bookings, and point-of-sale revenues in your MongoDB tenant database, your current RevPAR is <strong>${kpi.revPar}</strong> with a gross operating margin of <strong>{kpi.grossMargin}%</strong>.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowAiModal(false)} className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
