import React, { useState, useEffect } from'react';
import { useParams, useNavigate } from'react-router-dom';
import StockReport from'./tabs/StockReport';
import ExpenseReport from'./tabs/ExpenseReport';
import RevenueReport from'./tabs/RevenueReport';
import OccupancyReportTab from'./tabs/OccupancyReportTab';
import ExpenseVsRevenueTab from'./tabs/ExpenseVsRevenueTab';
import ReportTabPanel from '../../components/Reports/ReportTabPanel';
import { REPORT_TABS, getReportTabIndex } from '../../utils/Reports/reportTabs';
import '../../components/Reports/reportToolbarStyles.css';

export default function ReportsPage() {
 const { tab } = useParams();
 const navigate = useNavigate();

 // Map URL tab param to index
 const [activeTab, setActiveTab] = useState(getReportTabIndex(tab));

 useEffect(() => {
 setActiveTab(getReportTabIndex(tab));
 }, [tab]);

 const handleTabChange = (event, newValue) => {
 setActiveTab(newValue);
 navigate(`/reports/${REPORT_TABS[newValue].key}`, { replace: true });
 };

 return (
 <div className="reports-icon-surface p-0">
 

 {/* Tab Panels */}
 <ReportTabPanel value={activeTab} index={0}>
 <StockReport />
 </ReportTabPanel>
 <ReportTabPanel value={activeTab} index={1}>
 <ExpenseReport />
 </ReportTabPanel>
 <ReportTabPanel value={activeTab} index={2}>
 <RevenueReport />
 </ReportTabPanel>
 <ReportTabPanel value={activeTab} index={3}>
 <OccupancyReportTab />
 </ReportTabPanel>
 <ReportTabPanel value={activeTab} index={4}>
 <ExpenseVsRevenueTab />
 </ReportTabPanel>
 </div>
 );
}
