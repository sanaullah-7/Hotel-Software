import { Grid, TextField } from '@mui/material';
import { 
  TrendingUp as RevenueIcon, 
  TrendingDown as ExpenseIcon, 
  AccountBalance as NetIcon 
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatSummaryCard from '../../components/common/StatSummaryCard';

export default function ExpenseVsRevenue() {
  const chartData = [
    { name: 'Jan', expense: 4000, revenue: 5400 },
    { name: 'Feb', expense: 3000, revenue: 4398 },
    { name: 'Mar', expense: 2000, revenue: 8800 },
    { name: 'Apr', expense: 2780, revenue: 3908 },
    { name: 'May', expense: 1890, revenue: 4800 },
    { name: 'Jun', expense: 2390, revenue: 6800 },
    { name: 'Jul', expense: 3490, revenue: 7300 },
    { name: 'Aug', expense: 3100, revenue: 6900 },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Expense vs Revenue" breadcrumb="Reports / Expense vs Revenue" />
        <div className="flex gap-4">
          <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }} />
          <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }} />
        </div>
      </div>

      {/* Summary Cards */}
      <Grid container spacing={4} className="mt-2 mb-6">
        <Grid item xs={12} md={4}>
          <StatSummaryCard title="Total Revenue" value="$48,306" icon={<RevenueIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatSummaryCard title="Total Expenses" value="$22,650" icon={<ExpenseIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatSummaryCard title="Net Amount" value="$25,656" icon={<NetIcon />} />
        </Grid>
      </Grid>

      <div className="bg-white rounded-xl shadow-sm p-6 h-[500px]">
        <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Revenue vs Expense Comparison</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1b7f43" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1b7f43" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Legend iconType="circle" />
            <Area type="monotone" dataKey="revenue" stroke="#1b7f43" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
