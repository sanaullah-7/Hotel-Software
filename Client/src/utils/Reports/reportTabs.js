import {
  MoneyOff as ExpenseIcon,
  TrendingUp as RevenueIcon,
  Hotel as OccupancyIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';

export const REPORT_TABS = [
  { key: 'expense', label: 'Expense', icon: ExpenseIcon },
  { key: 'revenue', label: 'Revenue Report', icon: RevenueIcon },
  { key: 'occupancy', label: 'Occupancy Report', icon: OccupancyIcon },
  { key: 'expense-vs-revenue', label: 'Expense Vs Revenue', icon: CompareIcon },
];

export function getReportTabIndex(tabKey) {
  if (tabKey === 'expense-report' || tabKey === 'expense') return 0;
  if (tabKey === 'revenue-report' || tabKey === 'revenue') return 1;
  if (tabKey === 'occupancy-report' || tabKey === 'occupancy') return 2;
  if (tabKey === 'expense-vs-revenue') return 3;

  const index = REPORT_TABS.findIndex((tab) => tab.key === tabKey);
  return index >= 0 ? index : 0;
}
