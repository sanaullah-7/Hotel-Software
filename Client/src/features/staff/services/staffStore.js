import { mockStaff } from '../../../utils/mockData';
import { addAuditLog } from '../../../features/audit/state/auditStore';

export const STAFF_STORAGE_KEY = 'luxuria_staff_data';

// Helper to get staff from localStorage
export const getStoredStaff = () => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading staff from localStorage:', error);
  }
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(mockStaff));
  } catch (error) {
    console.error('Error initializing staff localStorage:', error);
  }
  return [...mockStaff];
};

// Helper to save staff to localStorage
export const saveStoredStaff = (staffList) => {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffList));
    window.dispatchEvent(new Event('luxuria_staff_updated'));
  } catch (error) {
    console.error('Error saving staff to localStorage:', error);
  }
};

// Add a new staff member
export const addStaffMember = (formData) => {
  const currentStaff = getStoredStaff();

  let shiftTime = '08:00 AM - 04:00 PM';
  if (formData.shift === 'Morning') shiftTime = '08:00 AM - 04:00 PM';
  else if (formData.shift === 'Evening') shiftTime = '04:00 PM - 12:00 AM';
  else if (formData.shift === 'Night') shiftTime = '12:00 AM - 08:00 AM';
  else if (formData.shift === 'Flexible') shiftTime = 'Flexible';
  else if (formData.shiftTime) shiftTime = formData.shiftTime;

  const newStaff = {
    id: Date.now(),
    empId: (formData.empId && formData.empId.trim()) || `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name: (formData.fullName && formData.fullName.trim()) || (formData.name && formData.name.trim()) || 'New Staff Member',
    designation: formData.designation || 'Staff',
    department: formData.department || 'General',
    phone: (formData.mobile && formData.mobile.trim()) || (formData.phone && formData.phone.trim()) || '+1 234 567 8900',
    email: (formData.email && formData.email.trim()) || 'staff@hotel.com',
    shift: formData.shift || 'Morning',
    shiftTime: shiftTime,
    joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
    status: formData.employmentStatus || formData.status || 'Active',
    address: (formData.address && formData.address.trim()) || 'N/A',
    gender: formData.gender || 'Not specified',
    dob: formData.dob || '',
    nationality: formData.nationality || '',
    maritalStatus: formData.maritalStatus || 'Single',
    languages: formData.languages || 'English',
    empType: formData.empType || 'Full Time',
    salary: formData.salary || '',
    basicSalary: formData.salary || '',
    reportsTo: formData.reportsTo || 'Management',
    altPhone: formData.altPhone || '',
    experience: formData.experience || '',
    education: formData.education || '',
    skills: formData.skills || '',
    emergencyName: formData.emergencyName || '',
    emergencyPhone: formData.emergencyPhone || '',
    emergencyRelation: formData.emergencyRelation || '',
    notes: formData.notes || '',
    avatar: formData.avatar || `https://i.pravatar.cc/150?u=${Date.now()}`
  };

  const updatedStaff = [newStaff, ...currentStaff];
  saveStoredStaff(updatedStaff);
  
  addAuditLog({
    module: 'Human Resources',
    action: 'Added Staff',
    recordId: newStaff.empId,
    description: `Staff member ${newStaff.name} was added.`,
    importance: 'Important'
  });
  
  return newStaff;
};

// Update an existing staff member
export const updateStaffMember = (id, updatedFields) => {
  const currentStaff = getStoredStaff();
  const updatedStaff = currentStaff.map(staff => {
    if (String(staff.id) === String(id) || String(staff.empId) === String(id)) {
      return { ...staff, ...updatedFields };
    }
    return staff;
  });
  saveStoredStaff(updatedStaff);

  const updatedPerson = updatedStaff.find(s => String(s.id) === String(id) || String(s.empId) === String(id));
  if (updatedPerson) {
    addAuditLog({
      module: 'Human Resources',
      action: 'Updated Staff',
      recordId: updatedPerson.empId,
      description: `Staff member ${updatedPerson.name} was updated.`,
      importance: 'Normal'
    });
  }

  return updatedStaff;
};

// Delete a staff member by ID
export const deleteStaffMember = (id) => {
  const currentStaff = getStoredStaff();
  const deletedPerson = currentStaff.find(staff => String(staff.id) === String(id) || String(staff.empId) === String(id));
  
  const updatedStaff = currentStaff.filter(staff => String(staff.id) !== String(id) && String(staff.empId) !== String(id));
  saveStoredStaff(updatedStaff);

  if (deletedPerson) {
    addAuditLog({
      module: 'Human Resources',
      action: 'Deleted Staff',
      recordId: deletedPerson.empId,
      description: `Staff member ${deletedPerson.name} was deleted.`,
      importance: 'Critical'
    });
  }

  return updatedStaff;
};

// Bulk delete staff members
export const bulkDeleteStaff = (ids) => {
  const currentStaff = getStoredStaff();
  const stringIds = ids.map(id => String(id));
  const updatedStaff = currentStaff.filter(staff => 
    !stringIds.includes(String(staff.id)) && !stringIds.includes(String(staff.empId))
  );
  saveStoredStaff(updatedStaff);
  return updatedStaff;
};

// Reset staff to default mock data
export const resetStaffToDefault = () => {
  saveStoredStaff([...mockStaff]);
  return [...mockStaff];
};
