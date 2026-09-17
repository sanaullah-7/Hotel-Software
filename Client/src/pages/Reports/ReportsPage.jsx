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
        <Box sx={{ pt: 3 }}>
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
    <div className="p-6">
      <PageHeader title="Reports" />

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: '52px',
            borderBottom: '1px solid #e5e7eb',
            '& .MuiTabs-indicator': {
              backgroundColor: '#1b7f43',
              height: '3px',
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              minHeight: '52px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#64748b',
              letterSpacing: '0.01em',
              padding: '12px 20px',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#1b7f43',
                backgroundColor: '#f0fdf4',
              },
              '&.Mui-selected': {
                color: '#1b7f43',
                fontWeight: 700,
              },
            },
            '& .MuiTabs-scrollButtons': {
              color: '#64748b',
              '&.Mui-disabled': { opacity: 0.3 },
            },
          }}
        >
          {TAB_CONFIG.map((tabItem, index) => (
            <Tab
              key={tabItem.key}
              icon={tabItem.icon}
              iconPosition="start"
              label={tabItem.label}
              id={`report-tab-${index}`}
              aria-controls={`report-tabpanel-${index}`}
              sx={{
                gap: '8px',
                '& .MuiTab-iconWrapper': {
                  marginRight: '0px',
                },
              }}
            />
          ))}
        </Tabs>
      </div>

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
