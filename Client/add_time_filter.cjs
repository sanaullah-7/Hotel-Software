const fs = require('fs');

let auditLog = fs.readFileSync('src/features/audit/pages/AuditLog.jsx', 'utf8');

if (!auditLog.includes('timeFilter')) {
  // Add state
  auditLog = auditLog.replace(
    "const [importanceFilter, setImportanceFilter] = useState('All');",
    "const [importanceFilter, setImportanceFilter] = useState('All');\n  const [timeFilter, setTimeFilter] = useState('All');"
  );

  // Add filter logic
  auditLog = auditLog.replace(
    "const matchesImportance = importanceFilter === 'All' || log.importance === importanceFilter;",
    `const matchesImportance = importanceFilter === 'All' || log.importance === importanceFilter;
    
    let matchesTime = true;
    if (timeFilter !== 'All') {
      const logDate = new Date(log.dateTime);
      const now = new Date();
      if (timeFilter === 'Daily') {
        matchesTime = logDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'Weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesTime = logDate >= weekAgo;
      } else if (timeFilter === 'Monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesTime = logDate >= monthAgo;
      } else if (timeFilter === 'Yearly') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        matchesTime = logDate >= yearAgo;
      }
    }`
  );
  
  auditLog = auditLog.replace(
    "return matchesSearch && matchesModule && matchesImportance;",
    "return matchesSearch && matchesModule && matchesImportance && matchesTime;"
  );

  // Add UI for timeFilter
  auditLog = auditLog.replace(
    /<FormControl size="small" sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}>\s*<InputLabel>Importance<\/InputLabel>[\s\S]*?<\/FormControl>/,
    `$&
          <FormControl size="small" sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel>Time</InputLabel>
            <Select
              value={timeFilter}
              label="Time"
              onChange={(e) => setTimeFilter(e.target.value)}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="All">All Time</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
            </Select>
          </FormControl>`
  );

  fs.writeFileSync('src/features/audit/pages/AuditLog.jsx', auditLog, 'utf8');
}
