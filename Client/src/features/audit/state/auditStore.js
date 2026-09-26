export const AUDIT_UPDATED_EVENT = 'audit_updated';

const generateId = () => `AUD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

export const getAuditLogs = () => {
  const stored = localStorage.getItem('hms_audit_log');
  return stored ? JSON.parse(stored) : [];
};

export const addAuditLog = ({
  module,
  action,
  recordId = '',
  description,
  importance = 'Normal',
  status = 'Completed',
  previousValue = null,
  newValue = null,
}) => {
  const logs = getAuditLogs();
  
  // Create ISO datetime for correct sorting and display
  const now = new Date();
  
  const newLog = {
    id: generateId(),
    dateTime: now.toISOString(),
    userId: 'USER-001',
    userName: localStorage.getItem('fullName') || 'Admin',
    module,
    action,
    recordId,
    description,
    importance,
    status,
    previousValue,
    newValue
  };
  
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem('hms_audit_log', JSON.stringify(updatedLogs));
  
  window.dispatchEvent(new Event(AUDIT_UPDATED_EVENT));
  return newLog;
};

// Also expose a way to clear them for dev/testing if needed
export const clearAuditLogs = () => {
  localStorage.removeItem('hms_audit_log');
  window.dispatchEvent(new Event(AUDIT_UPDATED_EVENT));
};
