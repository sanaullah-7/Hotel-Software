import React, { useState, useEffect, useCallback } from 'react';
import {
  Hotel as BedIcon,
  Build as WrenchIcon,
  CalendarToday as CalendarIcon,
  Apartment as BuildingIcon,
  KingBed as SuiteIcon,
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
import { toFrontendOccupancyReport } from '../../adapters/reportAdapter.js';

// Custom Centered Label inside donut slices
const RADIAN = Math.PI / 180;
const renderCustomDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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

// Custom Area Spline Tooltip
const CustomTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-xs">
        <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">{label}</p>
        <div className="flex items-center justify-between gap-4 py-0.5 text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e88e5]"></span>
            Occupancy Rate:
          </span>
          <span className="font-bold text-gray-900">{payload[0]?.value}%</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5 text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00c853]"></span>
            Forecasted:
          </span>
          <span className="font-bold text-gray-900">{payload[1]?.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function OccupancyReportTab() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOccupancyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getOccupancyReport();
      const raw = res?.data || res;
      setReportData(toFrontendOccupancyReport(raw));
    } catch (err) {
      console.error('Failed to load occupancy report:', err);
      setError(err?.message || 'Failed to load occupancy data from server. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates on mount, event dispatch, and focus
  useEffect(() => {
    fetchOccupancyData();

    const handleSync = () => {
      fetchOccupancyData();
    };

    window.addEventListener('hotel:data-updated', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('hotel:data-updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [fetchOccupancyData]);

  const kpi = reportData?.kpi || {
    averageOccupancyRate: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    outOfOrderRooms: 0,
    totalRooms: 0,
  };
  const trendData = reportData?.trendData || [];
  const donutData = reportData?.donutData || [];
  const roomTypeData = reportData?.roomTypeData || [];

  return (
    <div className="w-full space-y-3 pb-0 font-sans">
      {/* Header with Refresh button */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Occupancy & Capacity Report</h2>
          <p className="text-xs text-gray-500">Live operational room allocation, stay lifecycle, and room type performance</p>
        </div>
        <button
          onClick={fetchOccupancyData}
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
            <Button color="inherit" size="small" onClick={fetchOccupancyData}>
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
          <p className="mt-3 text-sm text-gray-500 font-medium">Computing live occupancy analytics from database...</p>
        </div>
      ) : (
        <>
          {/* 1. KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-1 mb-2">
            {/* Card 1: CURRENT OCCUPANCY RATE */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  {kpi.averageOccupancyRate}%
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Occupancy Rate</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                <BedIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 2: OCCUPIED ROOMS */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  {kpi.occupiedRooms}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Occupied Rooms</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                <BedIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 3: AVAILABLE ROOMS */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  {kpi.availableRooms}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Available Rooms</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                <BedIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Card 4: UNDER MAINTENANCE */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                  {kpi.outOfOrderRooms}
                </div>
                <div className="text-[12px] text-gray-500 font-medium">Under Maintenance</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-50 text-red-600">
                <WrenchIcon sx={{ fontSize: 20 }} />
              </div>
            </div>
          </div>

          {/* 2. 7-Day Occupancy Trend Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">7-Day Occupancy Trend</h3>
            <p className="text-xs text-gray-500 mb-4">Daily occupancy percentage timeline and forecasted demand</p>

            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e88e5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1e88e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c853" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00c853" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(val) => `${val}%`}
                    domain={[0, 100]}
                  />
                  <RechartsTooltip content={<CustomTrendTooltip />} />
                  <Area type="monotone" dataKey="occupancyRate" stroke="#1e88e5" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientOccupancy)" />
                  <Area type="monotone" dataKey="forecastedRate" stroke="#00c853" strokeWidth={2} fillOpacity={1} fill="url(#gradientForecast)" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Donut & Room Type Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Room Status Donut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-[16px] font-bold text-gray-900 mb-1">Room Status Distribution</h3>
              <p className="text-xs text-gray-500 mb-2">Live operational room allocation across the hotel</p>

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
                      label={renderCustomDonutLabel}
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

            {/* Room Type Performance Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-[16px] font-bold text-gray-900 mb-1">Room Type Performance</h3>
              <p className="text-xs text-gray-500 mb-3">Live capacity and occupancy across defined room types</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase">
                      <th className="py-2.5 px-3">ROOM TYPE</th>
                      <th className="py-2.5 px-3">TOTAL</th>
                      <th className="py-2.5 px-3">OCCUPIED</th>
                      <th className="py-2.5 px-3">VACANT</th>
                      <th className="py-2.5 px-3">OCCUPANCY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {roomTypeData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          No room types provisioned yet.
                        </td>
                      </tr>
                    ) : (
                      roomTypeData.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-3 font-semibold text-gray-800">{row.type}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">{row.total}</td>
                          <td className="py-2.5 px-3 text-blue-600 font-medium">{row.occupied}</td>
                          <td className="py-2.5 px-3 text-emerald-600 font-medium">{row.vacant}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 min-w-[30px]">{row.occupancyPct}%</span>
                              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, row.occupancyPct)}%` }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
