import React from'react';
import {
 HomeOutlined as HomeIcon,
 Hotel as BedIcon,
 Build as WrenchIcon,
 CalendarToday as CalendarIcon,
 Apartment as BuildingIcon,
 KingBed as SuiteIcon,
} from'@mui/icons-material';
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
} from'recharts';

// 7-day Occupancy Trend Data
const trendData = [
 { name:'Mon', occupancyRate: 73, forecastedRate: 76 },
 { name:'Tue', occupancyRate: 75, forecastedRate: 78 },
 { name:'Wed', occupancyRate: 74, forecastedRate: 81 },
 { name:'Thu', occupancyRate: 78, forecastedRate: 84 },
 { name:'Fri', occupancyRate: 82, forecastedRate: 88 },
 { name:'Sat', occupancyRate: 85, forecastedRate: 92 },
 { name:'Sun', occupancyRate: 80, forecastedRate: 90 },
];

// Room Status Donut Data
const donutData = [
 { name:'Occupied', value: 56.0, color:'#2196f3' },
 { name:'Vacant', value: 29.3, color:'#00e676' },
 { name:'Maintenance', value: 10.7, color:'#ff1744' },
 { name:'Reserved', value: 4.0, color:'#651fff' },
];

// Room Type Performance Data
const roomTypeData = [
 {
 id: 1,
 type:'Deluxe Room',
 total: 50,
 occupied: 42,
 vacant: 5,
 maintenance: 3,
 occupancyPct: 84,
 trend:'+5.2%',
 isPositive: true,
 icon: BedIcon,
 iconBg:'bg-[#e0edff]',
 iconColor:'text-[#2563eb]',
 },
 {
 id: 2,
 type:'Executive Suite',
 total: 20,
 occupied: 18,
 vacant: 2,
 maintenance: 0,
 occupancyPct: 90,
 trend:'+2.1%',
 isPositive: true,
 icon: BuildingIcon,
 iconBg:'bg-[#e0f7ef]',
 iconColor:'text-[#00b894]',
 },
 {
 id: 3,
 type:'Standard Room',
 total: 80,
 occupied: 60,
 vacant: 15,
 maintenance: 5,
 occupancyPct: 75,
 trend:'-3.4%',
 isPositive: false,
 icon: BedIcon,
 iconBg:'bg-[#ffedd5]',
 iconColor:'text-[#ea580c]',
 },
 {
 id: 4,
 type:'Presidential Suite',
 total: 5,
 occupied: 3,
 vacant: 2,
 maintenance: 0,
 occupancyPct: 60,
 trend:'+8.7%',
 isPositive: true,
 icon: SuiteIcon,
 iconBg:'bg-[#ede9fe]',
 iconColor:'text-[#7c3aed]',
 },
];

// Real-time Room Status Live Grid Data
const liveRoomUpdates = [
 { room:'101', status:'OCCUPIED', time:'2 mins ago', bg:'bg-[#eff6ff]', border:'border-blue-100', text:'text-[#1d4ed8]', badgeBg:'bg-[#2563eb]' },
 { room:'205', status:'VACANT', time:'5 mins ago', bg:'bg-[#f0fdf4]', border:'border-green-100', text:'text-[#15803d]', badgeBg:'bg-[#16a34a]' },
 { room:'302', status:'MAINTENANCE', time:'10 mins ago', bg:'bg-[#fef2f2]', border:'border-red-100', text:'text-[#b91c1c]', badgeBg:'bg-[#dc2626]' },
 { room:'118', status:'OCCUPIED', time:'15 mins ago', bg:'bg-[#eff6ff]', border:'border-blue-100', text:'text-[#1d4ed8]', badgeBg:'bg-[#2563eb]' },
 { room:'222', status:'VACANT', time:'20 mins ago', bg:'bg-[#f0fdf4]', border:'border-green-100', text:'text-[#15803d]', badgeBg:'bg-[#16a34a]' },
 { room:'108', status:'OCCUPIED', time:'25 mins ago', bg:'bg-[#eff6ff]', border:'border-blue-100', text:'text-[#1d4ed8]', badgeBg:'bg-[#2563eb]' },
];

// Custom Centered Label inside donut slices
const RADIAN = Math.PI / 180;
const renderCustomDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
 style={{ fontSize:'13px', fontWeight: 700 }}
 >
 {`${(percent * 100).toFixed(1)}%`}
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
 Forecasted Rate:
 </span>
 <span className="font-bold text-gray-900">{payload[1]?.value}%</span>
 </div>
 </div>
 );
 }
 return null;
};

export default function OccupancyReportTab() {
 return (
 <div className="w-full space-y-2 pb-0 font-sans">
 

 {/* 2. Top Metric KPI Cards (2x2 Grid) */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {/* Card 1: CURRENT OCCUPANCY RATE */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2.5">
 <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
 CURRENT OCCUPANCY RATE
 </span>
 <span className="rounded-full px-2.5 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-xs font-semibold inline-flex items-center gap-0.5">
 ↑ 5.2%
 </span>
 </div>
 <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
 78.3%
 </div>
 <div className="text-xs sm:text-sm text-gray-500 font-normal">
 Overall property occupancy
 </div>
 </div>
 <div className="w-10 h-10 rounded-2xl bg-[#d1fae5] flex items-center justify-center text-[#10b981] shrink-0">
 <BedIcon sx={{ fontSize: 22 }} />
 </div>
 </div>
 <div className="my-2 border-t border-gray-100"></div>
 <div className="text-xs text-gray-500 font-normal">
 vs yesterday: 73.1%
 </div>
 </div>

 {/* Card 2: AVAILABLE ROOMS */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2.5">
 <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
 AVAILABLE ROOMS
 </span>
 <span className="rounded-full px-2.5 py-0.5 bg-[#fee2e2] text-[#ef4444] text-xs font-semibold inline-flex items-center gap-0.5">
 ↓ 12%
 </span>
 </div>
 <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
 32
 </div>
 <div className="text-xs sm:text-sm text-gray-500 font-normal">
 Currently available for booking
 </div>
 </div>
 <div className="w-10 h-10 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-[#0284c7] shrink-0">
 <BedIcon sx={{ fontSize: 22 }} />
 </div>
 </div>
 <div className="my-2 border-t border-gray-100"></div>
 <div className="text-xs text-gray-500 font-normal">
 vs yesterday: 37
 </div>
 </div>

 {/* Card 3: UNDER MAINTENANCE */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2.5">
 <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
 UNDER MAINTENANCE
 </span>
 <span className="rounded-full px-2.5 py-0.5 bg-[#f1f5f9] text-[#64748b] text-xs font-semibold inline-flex items-center gap-0.5">
 — 0%
 </span>
 </div>
 <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
 8
 </div>
 <div className="text-xs sm:text-sm text-gray-500 font-normal">
 Rooms requiring maintenance
 </div>
 </div>
 <div className="w-10 h-10 rounded-2xl bg-[#ffedd5] flex items-center justify-center text-[#ea580c] shrink-0">
 <WrenchIcon sx={{ fontSize: 22 }} />
 </div>
 </div>
 <div className="my-2 border-t border-gray-100"></div>
 <div className="text-xs text-gray-500 font-normal">
 vs yesterday: 8
 </div>
 </div>

 {/* Card 4: AVG. LENGTH OF STAY */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2.5">
 <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
 AVG. LENGTH OF STAY
 </span>
 <span className="rounded-full px-2.5 py-0.5 bg-[#e8f8f0] text-[#0abb75] text-xs font-semibold inline-flex items-center gap-0.5">
 ↑ 8.7%
 </span>
 </div>
 <div className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3 mb-1">
 3.2
 </div>
 <div className="text-sm text-gray-500 font-normal">
 Days per guest
 </div>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-[#ede9fe] flex items-center justify-center text-[#7c3aed] shrink-0">
 <CalendarIcon sx={{ fontSize: 24 }} />
 </div>
 </div>
 <div className="my-4 border-t border-gray-100"></div>
 <div className="text-sm text-gray-500 font-normal">
 vs last month: 2.9
 </div>
 </div>
 </div>

 {/* 3. Occupancy Trend Analysis (Dual Area Spline Chart) */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h3 className="text-[18px] font-bold text-[#1e293b]">
 Occupancy Trend Analysis
 </h3>
 <p className="text-sm text-gray-500 mt-1">
 7-day occupancy performance with forecasting
 </p>
 </div>

 {/* Legend & Controls */}
 <div className="flex flex-wrap items-center gap-4 sm:gap-6">
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-full bg-[#1e88e5]"></span>
 <span className="text-xs font-semibold text-gray-700">Occupancy Rate</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-full bg-[#00c853]"></span>
 <span className="text-xs font-semibold text-gray-700">Forecasted Rate</span>
 </div>

 {/* ApexCharts-like toolbar icons */}
 <div className="flex items-center gap-1 text-gray-400">
 <button className="hover:text-gray-700 p-1 text-xs font-bold leading-none" title="Zoom in">+</button>
 <button className="hover:text-gray-700 p-1 text-xs font-bold leading-none" title="Zoom out">−</button>
 <button className="hover:text-gray-700 p-1" title="Selection Zoom">
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <circle cx="11" cy="11" r="8" strokeWidth="2" />
 <path strokeLinecap="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
 </svg>
 </button>
 <button className="hover:text-gray-700 p-1" title="Pan">
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
 </svg>
 </button>
 <button className="hover:text-gray-700 p-1" title="Reset Zoom">
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 </button>
 <button className="hover:text-gray-700 p-1" title="Menu">
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
 </svg>
 </button>
 </div>
 </div>
 </div>

 {/* Chart */}
 <div className="w-full h-[360px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
 <defs>
 <linearGradient id="gradientOccupancy" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#1e88e5" stopOpacity={0.25} />
 <stop offset="90%" stopColor="#1e88e5" stopOpacity={0.0} />
 </linearGradient>
 <linearGradient id="gradientForecast" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#00c853" stopOpacity={0.25} />
 <stop offset="90%" stopColor="#00c853" stopOpacity={0.0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
 <XAxis
 dataKey="name"
 axisLine={false}
 tickLine={false}
 tick={{ fill:'#64748b', fontSize: 13, fontWeight: 500 }}
 dy={10}
 />
 <YAxis
 domain={[0, 100]}
 ticks={[0, 20, 40, 60, 80, 100]}
 axisLine={false}
 tickLine={false}
 tick={{ fill:'#64748b', fontSize: 12 }}
 tickFormatter={(val) =>`${val}%`}
 />
 <RechartsTooltip content={<CustomTrendTooltip />} />
 <Area
 type="monotone"
 dataKey="occupancyRate"
 stroke="#1e88e5"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#gradientOccupancy)"
 activeDot={{ r: 6, fill:'#1e88e5', stroke:'#ffffff', strokeWidth: 2 }}
 />
 <Area
 type="monotone"
 dataKey="forecastedRate"
 stroke="#00c853"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#gradientForecast)"
 activeDot={{ r: 6, fill:'#00c853', stroke:'#ffffff', strokeWidth: 2 }}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* 4. Room Status Distribution (Donut Chart) */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5">
 <div className="mb-4">
 <h3 className="text-[18px] font-bold text-[#1e293b]">
 Room Status Distribution
 </h3>
 <p className="text-sm text-gray-500 mt-1">
 Current status breakdown by category
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
 label={renderCustomDonutLabel}
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
 backgroundColor:'#ffffff',
 borderRadius:'12px',
 border:'1px solid #f1f5f9',
 boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)',
 fontSize:'13px',
 fontWeight: 600
 }}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>

 {/* Legend */}
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

 {/* 5. Room Type Performance (Data Table) */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-3.5 overflow-hidden">
 <div className="mb-6">
 <h3 className="text-[18px] font-bold text-[#1e293b]">
 Room Type Performance
 </h3>
 <p className="text-sm text-gray-500 mt-1">
 Detailed breakdown by room category and performance metrics
 </p>
 </div>

 <div className="w-full">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
 <th className="py-3 px-4 font-bold text-gray-500">ROOM TYPE</th>
 <th className="py-3 px-4 font-bold text-gray-500">TOTAL</th>
 <th className="py-3 px-4 font-bold text-gray-500">OCCUPIED</th>
 <th className="py-3 px-4 font-bold text-gray-500">VACANT</th>
 <th className="py-3 px-4 font-bold text-gray-500">MAINTENANCE</th>
 <th className="py-3 px-4 font-bold text-gray-500">OCCUPANCY %</th>
 <th className="py-3 px-4 font-bold text-gray-500">TREND</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/70">
 {roomTypeData.map((row) => {
 const IconComponent = row.icon;
 return (
 <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
 {/* ROOM TYPE */}
 <td className="py-4 px-4">
 <div className="flex items-center gap-3.5">
 <div className={`w-11 h-11 rounded-xl ${row.iconBg} ${row.iconColor} flex items-center justify-center shrink-0`}>
 <IconComponent sx={{ fontSize: 22 }} />
 </div>
 <span className="font-bold text-gray-900 text-[14px]">
 {row.type}
 </span>
 </div>
 </td>

 {/* TOTAL */}
 <td className="py-4 px-4 font-bold text-gray-900 text-[15px]">
 {row.total}
 </td>

 {/* OCCUPIED */}
 <td className="py-4 px-4 font-bold text-gray-900 text-[15px]">
 {row.occupied}
 </td>

 {/* VACANT */}
 <td className="py-4 px-4 font-bold text-gray-900 text-[15px]">
 {row.vacant}
 </td>

 {/* MAINTENANCE */}
 <td className="py-4 px-4 font-bold text-gray-900 text-[15px]">
 {row.maintenance}
 </td>

 {/* OCCUPANCY % */}
 <td className="py-4 px-4">
 <div className="flex flex-col items-center w-36">
 <span className="text-sm font-bold text-gray-900 mb-1">
 {row.occupancyPct}%
 </span>
 <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
 <div
 className="h-full bg-[#3b5998] rounded-full"
 style={{ width:`${row.occupancyPct}%` }}
 ></div>
 </div>
 </div>
 </td>

 {/* TREND */}
 <td className="py-4 px-4">
 <span
 className={`inline-flex items-center gap-1 font-bold text-xs ${
 row.isPositive ?'text-[#0abb75]' :'text-[#ef4444]'
 }`}
 >
 {row.isPositive ?'↗' :'↘'} {row.trend}
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 {/* 6. Real-time Room Status (Live Updates Grid) */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-6">
 <div className="mb-6">
 <h3 className="text-[18px] font-bold text-[#1e293b]">
 Real-time Room Status
 </h3>
 <p className="text-sm text-gray-500 mt-1">
 Live updates of room availability and status changes
 </p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
 {liveRoomUpdates.map((item, index) => (
 <div
 key={index}
 className={`${item.bg} border ${item.border} rounded-2xl p-5 text-center transition-all hover:shadow-sm`}
 >
 <div className={`text-2xl font-black ${item.text} tracking-tight mb-2.5`}>
 {item.room}
 </div>
 <div>
 <span
 className={`${item.badgeBg} text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block shadow-xs`}
 >
 {item.status}
 </span>
 </div>
 <div className={`text-[11px] font-medium mt-3.5 opacity-80 ${item.text}`}>
 {item.time}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* 7. Footer */}
 <div className="pt-4 text-left text-sm text-gray-500 font-normal">
 Copyright © 2026 Design By <span className="text-gray-700 font-semibold">Tech Titans</span>
 </div>
 </div>
 );
}
