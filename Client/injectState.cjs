const fs = require('fs');

function addDummyState(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  let injection = `
  // --- INJECTED MISSING VARIABLES ---
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [checkInData, setCheckInData] = useState([]);
  
  const handleExportCSV = () => {};
  const getStatusBadge = () => <span className="text-xs">Status</span>;
  const handleStatusChange = () => {};
  
  // Use alerts if it exists (OperationsAlerts), else use checkInData (CheckInOut)
  const rowsSource = (typeof alerts !== 'undefined') ? alerts : checkInData;
  const currentRows = rowsSource || [];
  const totalPages = 1;
  const indexOfFirstRow = 0;
  const indexOfLastRow = 10;
  // ----------------------------------
  `;

  const componentDeclMatch = content.match(/export default function [^()]+\(\) \{/);
  if (componentDeclMatch) {
    const idx = componentDeclMatch.index + componentDeclMatch[0].length;
    content = content.substring(0, idx) + '\n' + injection + content.substring(idx);
    fs.writeFileSync(file, content);
    console.log('Injected missing variables into ' + file);
  } else {
    console.log('Could not find component in ' + file);
  }
}

addDummyState('src/pages/FrontOffice/OperationsAlerts.jsx');
addDummyState('src/pages/FrontOffice/CheckInOut.jsx');
