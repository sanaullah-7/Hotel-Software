import React from'react';
import {
 HomeOutlined as HomeIcon,
 Payments as RevenueIcon,
 ReceiptLong as ExpenseIcon,
 Savings as ProfitIcon,
 Percent as MarginIcon,
} from'@mui/icons-material';
import {
 ResponsiveContainer,
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip as RechartsTooltip
} from'recharts';

// Monthly Performance Data (Revenue vs Operating Expense)
const monthlyTrendsData = [
 { name:'Jan', revenue: 44000, expense: 26000 },
 { name:'Feb', revenue: 55000, expense: 22000 },
 { name:'Mar', revenue: 41000, expense: 36000 },
 { name:'Apr', revenue: 67000, expense: 25000 },
 { name:'May', revenue: 22000, expense: 45000 },
 { name:'Jun', revenue: 43000, expense: 37000 },
 { name:'Jul', revenue: 21000, expense: 64000 },
 { name:'Aug', revenue: 41000, expense: 50000 },
 { name:'Sep', revenue: 56000, expense: 58000 },
 { name:'Oct', revenue: 27000, expense: 35000 },
 { name:'Nov', revenue: 43000, expense: 39000 },
 { name:'Dec', revenue: 50000, expense: 28000 },
];

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
 <span className={`font-bold ${diff >= 0 ?'text-[#00b894]' :'text-[#ff4d4f]'}`}>
 {diff >= 0 ?'+' :'-'}${Math.abs(diff).toLocaleString()}
 </span>
 </div>
 </div>
 );
 }
 return null;
};

export default function ExpenseVsRevenueTab() {
 return (
 <div className="w-full space-y-2 pb-0 font-sans">
 

 {/* 2. Top Metric KPI Cards (2x2 Grid) */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {/* Card 1: TOTAL REVENUE (YTD) */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">
 TOTAL REVENUE (YTD)
 </span>
 <div className="text-xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
 $1,842,500
 </div>
 <span className="rounded-full px-2.5 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-xs font-bold inline-flex items-center gap-1 mb-1">
 ↗ +15.2%
 </span>
 </div>
 <div className="w-10 h-10 rounded-2xl bg-[#e0edff] flex items-center justify-center text-[#2563eb] shrink-0">
 <RevenueIcon sx={{ fontSize: 22 }} />
 </div>
 </div>
 {/* Progress Bar */}
 <div className="w-full h-1 bg-gray-200/80 rounded-full overflow-hidden mt-2.5 mb-1.5">
 <div className="h-full bg-[#3b5998] rounded-full" style={{ width:'85%' }}></div>
 </div>
 <div className="text-xs text-gray-500 font-normal">
 85% of annual target achieved
 </div>
 </div>

 {/* Card 2: TOTAL EXPENSES (YTD) */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">
 TOTAL EXPENSES (YTD)
 </span>
 <div className="text-xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
 $642,800
 </div>
 <span className="rounded-full px-2.5 py-0.5 bg-[#fee2e2] text-[#ef4444] text-xs font-bold inline-flex items-center gap-1 mb-1">
 ↘ -5.4%
 </span>
 </div>
 <div className="w-10 h-10 rounded-2xl bg-[#ffe4e6] flex items-center justify-center text-[#f43f5e] shrink-0">
 <ExpenseIcon sx={{ fontSize: 22 }} />
 </div>
 </div>
 {/* Progress Bar */}
 <div className="w-full h-1 bg-gray-200/80 rounded-full overflow-hidden mt-2.5 mb-1.5">
 <div className="h-full bg-[#3b5998] rounded-full" style={{ width:'42%' }}></div>
 </div>
 <div className="text-xs text-gray-500 font-normal">
 42% of budget utilized
 </div>
 </div>

 {/* Card 3: NET PROFIT */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">
 NET PROFIT
 </span>
 <div className="text-xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
 $1,199,700
 </div>
 <span className="rounded-full px-2.5 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-xs font-bold inline-flex items-center gap-1 mb-1">
 ↗ +12.8%
 </span>
 </div>
 <div className="w-10 h-10 rounded-2xl bg-[#d1fae5] flex items-center justify-center text-[#10b981] shrink-0">
 <ProfitIcon sx={{ fontSize: 22 }} />
 </div>
 </div>
 {/* Progress Bar */}
 <div className="w-full h-1 bg-gray-200/80 rounded-full overflow-hidden mt-2.5 mb-1.5">
 <div className="h-full bg-[#3b5998] rounded-full" style={{ width:'65.1%' }}></div>
 </div>
 <div className="text-xs text-gray-500 font-normal">
 Margin: 65.1%
 </div>
 </div>

 {/* Card 4: OPERATING MARGIN */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">
 OPERATING MARGIN
 </span>
 <div className="text-xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
 24.5%
 </div>
 <span className="rounded-full px-2.5 py-0.5 bg-[#f1f5f9] text-[#64748b] text-xs font-bold inline-flex items-center gap-1 mb-1">
 → Stable
 </span>
 </div>
 <div className="w-10 h-10 rounded-2xl bg-[#ede9fe] flex items-center justify-center text-[#7c3aed] shrink-0">
 <MarginIcon sx={{ fontSize: 22 }} />
 </div>
 </div>
 {/* Progress Bar */}
 <div className="w-full h-1 bg-gray-200/80 rounded-full overflow-hidden mt-2.5 mb-1.5">
 <div className="h-full bg-[#3b5998] rounded-full" style={{ width:'24.5%' }}></div>
 </div>
 <div className="text-xs text-gray-500 font-normal">
 Against industry avg: 22%
 </div>
 </div>
 </div>

 {/* 3. Revenue Trend (Dual Area Spline Chart) */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 mb-2">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h3 className="text-[18px] font-bold text-[#1e293b]">
 Revenue vs Expense Trends
 </h3>
 <p className="text-sm text-gray-500 mt-1">
 Monthly performance comparison and profitability gap
 </p>
 </div>

 {/* Legend & Options */}
 <div className="flex items-center gap-5">
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-full bg-[#00b894]"></span>
 <span className="text-xs font-semibold text-gray-700">Total Revenue</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-full bg-[#ff7875]"></span>
 <span className="text-xs font-semibold text-gray-700">Total Operating Expense</span>
 </div>
 <button className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Chart options">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
 </svg>
 </button>
 </div>
 </div>

 {/* Chart */}
 <div className="w-full h-[400px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
 tick={{ fill:'#64748b', fontSize: 13, fontWeight: 500 }}
 dy={10}
 />
 <YAxis
 domain={[20000, 70000]}
 ticks={[20000, 30000, 40000, 50000, 60000, 70000]}
 axisLine={false}
 tickLine={false}
 tick={{ fill:'#64748b', fontSize: 12 }}
 tickFormatter={(val) =>`$${val / 1000}k`}
 />
 <RechartsTooltip content={<CustomAreaTooltip />} />
 <Area
 type="monotone"
 dataKey="revenue"
 stroke="#00b894"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#colorRevTrends)"
 activeDot={{ r: 6, fill:'#00b894', stroke:'#ffffff', strokeWidth: 2 }}
 />
 <Area
 type="monotone"
 dataKey="expense"
 stroke="#ff7875"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#colorExpTrends)"
 activeDot={{ r: 6, fill:'#ff7875', stroke:'#ffffff', strokeWidth: 2 }}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* 4. Footer */}
 <div className="pt-2 text-left text-sm text-gray-500 font-normal">
 Copyright © 2026 Design By <span className="text-gray-700 font-semibold">Tech Titans</span>
 </div>
 </div>
 );
}
