import React, { useState } from 'react';
import {
  HomeOutlined as HomeIcon,
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
  CheckCircle as CheckIcon
} from '@mui/icons-material';
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
  Cell
} from 'recharts';

// Trend Area Chart Data (Monthly 2024 vs 2023)
const trendData = [
  { name: 'Jan', rev2024: 520000, rev2023: 450000 },
  { name: 'Feb', rev2024: 580000, rev2023: 480000 },
  { name: 'Mar', rev2024: 650000, rev2023: 560000 },
  { name: 'Apr', rev2024: 720000, rev2023: 620000 },
  { name: 'May', rev2024: 600000, rev2023: 540000 },
  { name: 'Jun', rev2024: 1080000, rev2023: 950000 },
  { name: 'Jul', rev2024: 1000000, rev2023: 900000 },
  { name: 'Aug', rev2024: 1200000, rev2023: 1050000 },
  { name: 'Sep', rev2024: 850000, rev2023: 740000 },
  { name: 'Oct', rev2024: 980000, rev2023: 880000 },
  { name: 'Nov', rev2024: 1100000, rev2023: 960000 },
  { name: 'Dec', rev2024: 1300000, rev2023: 1150000 },
];

// Revenue Distribution Donut Data
const donutData = [
  { name: 'Room Revenue', value: 45, color: '#2f65f6' },
  { name: 'Food & Beverage', value: 25, color: '#05b171' },
  { name: 'Spa & Wellness', value: 15, color: '#e58a00' },
  { name: 'Events & Banquets', value: 10, color: '#5352ed' },
  { name: 'Other Services', value: 5, color: '#ff4757' },
];

// Breakdown by Source Data
const sourceData = [
  {
    id: 1,
    source: 'Direct Booking',
    revenue: '$425,000.00',
    percentage: 34.1,
    trend: '+12.5%',
    isPositive: true,
    icon: BedIcon,
    iconBg: 'bg-[#e0edff]',
    iconColor: 'text-[#2563eb]',
  },
  {
    id: 2,
    source: 'OTA Channels',
    revenue: '$387,000.00',
    percentage: 31.1,
    trend: '+8.2%',
    isPositive: true,
    icon: GlobeIcon,
    iconBg: 'bg-[#e0f7ef]',
    iconColor: 'text-[#00b894]',
  },
  {
    id: 3,
    source: 'Corporate',
    revenue: '$218,000.00',
    percentage: 17.5,
    trend: '-2.3%',
    isPositive: false,
    icon: BuildingIcon,
    iconBg: 'bg-[#ffedd5]',
    iconColor: 'text-[#f97316]',
  },
  {
    id: 4,
    source: 'Travel Agents',
    revenue: '$126,000.00',
    percentage: 10.1,
    trend: '+5.7%',
    isPositive: true,
    icon: GroupsIcon,
    iconBg: 'bg-[#ede9fe]',
    iconColor: 'text-[#7c3aed]',
  },
  {
    id: 5,
    source: 'Walk-ins',
    revenue: '$89,000.00',
    percentage: 7.1,
    trend: '+15.3%',
    isPositive: true,
    icon: PersonIcon,
    iconBg: 'bg-[#ffe4e6]',
    iconColor: 'text-[#f43f5e]',
  },
];

// Custom Label inside donut slices
const RADIAN = Math.PI / 180;
const renderCustomizedDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
      {`${(percent * 100).toFixed(1)}%`}
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
            2024 Revenue:
          </span>
          <span className="font-bold text-gray-900">${payload[0]?.value?.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5 text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e396]"></span>
            2023 Revenue:
          </span>
          <span className="font-bold text-gray-900">${payload[1]?.value?.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueReport() {
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <div className="w-full space-y-2 pb-1 font-sans">
    

      {/* 2. Top Metric Cards (2x2 Grid) */}
      <div className="grid grid-cols-1  md:grid-cols-2 gap-2">
        {/* Card 1: TOTAL REVENUE */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  TOTAL REVENUE
                </span>
                <span className="rounded-full px-2.5 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-xs font-semibold inline-flex items-center gap-0.5">
                  ↑ 12.5%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
                $1,245,870
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-normal">
                This Period
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#d1fae5] flex items-center justify-center text-[#10b981] shrink-0">
              <DollarIcon sx={{ fontSize: 22 }} />
            </div>
          </div>
          <div className="my-2 border-t border-gray-100"></div>
          <div className="text-xs text-gray-500 font-normal">
            vs last period: $1,107,440
          </div>
        </div>

        {/* Card 2: AVG. DAILY RATE */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  AVG. DAILY RATE
                </span>
                <span className="rounded-full px-2.5 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-xs font-semibold inline-flex items-center gap-0.5">
                  ↑ 8.2%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
                $187.50
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-normal">
                Per occupied room
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-[#0284c7] shrink-0">
              <TrendingUpIcon sx={{ fontSize: 22 }} />
            </div>
          </div>
          <div className="my-2 border-t border-gray-100"></div>
          <div className="text-xs text-gray-500 font-normal">
            vs last period: $173.25
          </div>
        </div>

        {/* Card 3: TOTAL BOOKINGS */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  TOTAL BOOKINGS
                </span>
                <span className="rounded-full px-2.5 py-0.5 bg-[#fee2e2] text-[#ef4444] text-xs font-semibold inline-flex items-center gap-0.5">
                  ↓ 3.1%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
                2,847
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-normal">
                Confirmed reservations
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#ffedd5] flex items-center justify-center text-[#ea580c] shrink-0">
              <BedIcon sx={{ fontSize: 22 }} />
            </div>
          </div>
          <div className="my-2 border-t border-gray-100"></div>
          <div className="text-xs text-gray-500 font-normal">
            vs last period: 2,938
          </div>
        </div>

        {/* Card 4: REVENUE PER AVAILABLE ROOM */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  REVENUE PER AVAILABLE ROOM
                </span>
                <span className="rounded-full px-2.5 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-xs font-semibold inline-flex items-center gap-0.5">
                  ↑ 15.7%
                </span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3 mb-1">
                $124.80
              </div>
              <div className="text-sm text-gray-500 font-normal">
                RevPAR metric
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#ede9fe] flex items-center justify-center text-[#7c3aed] shrink-0">
              <WalletIcon sx={{ fontSize: 24 }} />
            </div>
          </div>
          <div className="my-4 border-t border-gray-100"></div>
          <div className="text-sm text-gray-500 font-normal">
            vs last period: $107.85
          </div>
        </div>
      </div>

      {/* 3. Revenue Trend Analysis (Area Chart) */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5">
        <div className="relative mb-6">
          <div className="text-center">
            <h3 className="text-[18px] font-bold text-[#1e293b]">
              Revenue Trend Analysis
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Monthly performance comparison with previous year
            </p>
          </div>

          <div className="absolute right-0 top-0">
            <button
              onClick={() => setShowAiModal(true)}
              title="Explain with AI"
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 border border-purple-100/50"
            >
              <SparkleIcon sx={{ fontSize: 19 }} />
            </button>
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex items-center justify-end gap-5 mb-4 pr-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#008ffb]"></span>
            <span className="text-xs font-semibold text-gray-700">2024 Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00e396]"></span>
            <span className="text-xs font-semibold text-gray-700">2023 Revenue</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Chart options">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Area Spline Chart */}
        <div className="w-full h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient2024" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#008ffb" stopOpacity={0.25} />
                  <stop offset="90%" stopColor="#008ffb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradient2023" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e396" stopOpacity={0.25} />
                  <stop offset="90%" stopColor="#00e396" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                domain={[400000, 1400000]}
                ticks={[600000, 800000, 1000000, 1200000, 1400000]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(val) => `$${val}k`}
                dx={-5}
              />
              <RechartsTooltip content={<CustomAreaTooltip />} />
              <Area
                type="monotone"
                dataKey="rev2024"
                stroke="#008ffb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gradient2024)"
                activeDot={{ r: 6, fill: '#008ffb', stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="rev2023"
                stroke="#00e396"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gradient2023)"
                activeDot={{ r: 6, fill: '#00e396', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Revenue Distribution (Donut Chart) */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5">
        <div className="mb-4">
          <h3 className="text-[18px] font-bold text-[#1e293b]">
            Revenue Distribution
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            By room type and service category
          </p>
        </div>

        <div className="w-full flex flex-col items-center justify-center py-4">
          <div className="w-full h-[320px] max-w-[480px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={125}
                  paddingAngle={1}
                  label={renderCustomizedDonutLabel}
                  labelLine={false}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val, name) => [`${val}%`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs font-semibold text-gray-700">
            {donutData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Revenue Breakdown by Source (Data List / Table) */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 overflow-hidden">
        <div className="mb-6">
          <h3 className="text-[18px] font-bold text-[#1e293b]">
            Revenue Breakdown by Source
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Detailed analysis of booking channels and revenue streams
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4 font-bold text-gray-500">SOURCE</th>
                <th className="py-3 px-4 font-bold text-gray-500">REVENUE</th>
                <th className="py-3 px-4 font-bold text-gray-500">PERCENTAGE</th>
                <th className="py-3 px-4 font-bold text-gray-500">TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/70">
              {sourceData.map((row) => {
                const IconComponent = row.icon;
                return (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* SOURCE */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl ${row.iconBg} ${row.iconColor} flex items-center justify-center shrink-0`}>
                          <IconComponent sx={{ fontSize: 22 }} />
                        </div>
                        <span className="font-bold text-gray-900 text-[14px]">
                          {row.source}
                        </span>
                      </div>
                    </td>

                    {/* REVENUE */}
                    <td className="py-4 px-4 whitespace-nowrap font-bold text-gray-900 text-[15px]">
                      {row.revenue}
                    </td>

                    {/* PERCENTAGE */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-40 sm:w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3b5998] rounded-full"
                            style={{ width: `${row.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[45px]">
                          {row.percentage}%
                        </span>
                      </div>
                    </td>

                    {/* TREND */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          row.isPositive
                            ? 'bg-[#e8f8f0] text-[#0abb75]'
                            : 'bg-[#fee2e2] text-[#ef4444]'
                        }`}
                      >
                        {row.isPositive ? '↗' : '↘'} {row.trend}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Footer */}
      <div className="pt-4 text-left text-sm text-gray-500 font-normal">
        Copyright © 2026 Design By <span className="text-gray-700 font-semibold">Luxuria</span>
      </div>

      {/* AI Explain Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <SparkleIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">AI Revenue Insights</h4>
                  <p className="text-xs text-gray-500">Luxuria Intelligent Analytics</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-sm text-gray-600">
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100/80">
                <p className="font-semibold text-purple-900 mb-1">Key Takeaway:</p>
                <p className="text-purple-800 text-xs leading-relaxed">
                  Total revenue achieved <span className="font-bold">$1,245,870</span>, up <span className="font-bold">12.5%</span> year-over-year. Peak performance concentrated in August ($1.2M) and December ($1.3M).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} className="mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-700">
                    <span className="font-bold">Direct Bookings</span> drove 34.1% of all revenue, reducing 3rd-party commission fees by approx $32,400.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} className="mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-700">
                    <span className="font-bold">RevPAR</span> expanded by 15.7% ($124.80), outperforming standard market hotel benchmarks.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} className="mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-700">
                    <span className="font-bold">Corporate bookings</span> softened by -2.3%; recommend launching targeted mid-week corporate packages.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
