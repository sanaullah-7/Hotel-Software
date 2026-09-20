import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import {
  Inventory as StockIcon,
  MoneyOff as ExpenseIcon,
  TrendingUp as RevenueIcon,
  Hotel as OccupancyIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import StockReport from './tabs/StockReport';
import ExpenseReport from './tabs/ExpenseReport';
import RevenueReport from './tabs/RevenueReport';
import OccupancyReportTab from './tabs/OccupancyReportTab';
import ExpenseVsRevenueTab from './tabs/ExpenseVsRevenueTab';

const TAB_CONFIG = [
  { key: 'stock', label: 'Stock', icon: <StockIcon sx={{ fontSize: 18 }} /> },
  { key: 'expense', label: 'Expense', icon: <ExpenseIcon sx={{ fontSize: 18 }} /> },
  { key: 'revenue', label: 'Revenue Report', icon: <RevenueIcon sx={{ fontSize: 18 }} /> },
  { key: 'occupancy', label: 'Occupancy Report', icon: <OccupancyIcon sx={{ fontSize: 18 }} /> },
  { key: 'expense-vs-revenue', label: 'Expense Vs Revenue', icon: <CompareIcon sx={{ fontSize: 18 }} /> },
];

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ pt: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { tab } = useParams();
  const navigate = useNavigate();

  // Map URL tab param to index
  const getTabIndex = (tabKey) => {
    if (tabKey === 'revenue-report' || tabKey === 'revenue') return 2;
    if (tabKey === 'stock-report' || tabKey === 'stock') return 0;
    if (tabKey === 'expense-report' || tabKey === 'expense') return 1;
    if (tabKey === 'occupancy-report' || tabKey === 'occupancy') return 3;
    const index = TAB_CONFIG.findIndex(t => t.key === tabKey);
    return index >= 0 ? index : 0;
  };

  const [activeTab, setActiveTab] = useState(getTabIndex(tab));

  useEffect(() => {
    setActiveTab(getTabIndex(tab));
  }, [tab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(`/reports/${TAB_CONFIG[newValue].key}`, { replace: true });
  };

  return (
    <div className="p-0">
      

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <StockReport />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ExpenseReport />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <RevenueReport />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <OccupancyReportTab />
      </TabPanel>
      <TabPanel value={activeTab} index={4}>
        <ExpenseVsRevenueTab />
      </TabPanel>
    </div>
  );
}
