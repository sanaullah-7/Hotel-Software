/**
 * Staff Adapter
 * Translates between Backend Employee schema and Frontend Staff UI models.
 *
 * Backend Schema:
 *   _id: ObjectId
 *   employee_ref: String (e.g. "EMP-001")
 *   first_name: String
 *   last_name: String
 *   email: String
 *   phone: String
 *   job_title: String
 *   department_id: { _id, name, code, ... } | ObjectId
 *   status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED'
 *   address, dob, gender, nationality, marital_status, languages, alt_phone
 *   joining_date, employment_type, shift, salary, reports_to
 *   experience, education, skills, emergency_contact, notes, avatar
 *   created_at: ISO Date string
 *   updated_at: ISO Date string
 */

export const staffAdapter = {
  toUI(backendEmp) {
    if (!backendEmp) return null;

    const id = (backendEmp._id || backendEmp.id || '').toString();
    const empId = backendEmp.employee_ref || (id ? `EMP-${id.slice(-4).toUpperCase()}` : 'EMP-000');
    const firstName = (backendEmp.first_name || '').trim();
    const rawLastName = (backendEmp.last_name || '').trim();
    const lastName = (rawLastName === '.' || rawLastName.toLowerCase() === 'null' || rawLastName.toLowerCase() === 'undefined') ? '' : rawLastName;
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || backendEmp.name || 'Staff Member';

    // Department extraction
    let departmentName = 'General';
    let departmentId = null;
    let departmentCode = '';
    if (backendEmp.department_id) {
      if (typeof backendEmp.department_id === 'object') {
        departmentName = backendEmp.department_id.name || backendEmp.department_id.code || 'General';
        departmentId = (backendEmp.department_id._id || '').toString() || null;
        departmentCode = backendEmp.department_id.code || '';
      } else {
        departmentId = backendEmp.department_id.toString();
      }
    } else if (backendEmp.department) {
      departmentName = backendEmp.department;
    }

    // Status mapping: backend enum -> frontend display
    // 'ACTIVE' -> 'Active', 'ON_LEAVE' -> 'On Leave', 'TERMINATED' -> 'Terminated'
    let uiStatus = 'Active';
    const rawStatus = (backendEmp.status || '').toUpperCase();
    if (rawStatus === 'ON_LEAVE') {
      uiStatus = 'On Leave';
    } else if (rawStatus === 'TERMINATED') {
      uiStatus = 'Terminated';
    } else if (rawStatus === 'ACTIVE') {
      uiStatus = 'Active';
    } else if (backendEmp.status) {
      uiStatus = backendEmp.status;
    }

    // Joining date formatted from joining_date or created_at
    let joiningDate = 'N/A';
    if (backendEmp.joining_date) {
      joiningDate = backendEmp.joining_date;
    } else if (backendEmp.created_at) {
      try {
        joiningDate = new Date(backendEmp.created_at).toISOString().split('T')[0];
      } catch {
        joiningDate = 'N/A';
      }
    } else if (backendEmp.joiningDate) {
      joiningDate = backendEmp.joiningDate;
    }

    const shiftTimingMap = {
      'Morning Shift': '06:00 - 14:00',
      'Evening Shift': '14:00 - 22:00',
      'Night Shift': '22:00 - 06:00',
      'Rotational': 'Rotational Schedule',
    };
    const rawShift = (backendEmp.shift || '').trim();
    const shiftTime = backendEmp.shiftTime || shiftTimingMap[rawShift] || (rawShift ? 'Standard Schedule' : 'N/A');

    const emergencyContact = backendEmp.emergency_contact || {};

    return {
      id,
      _id: id,
      empId,
      employee_ref: empId,
      name: fullName,
      fullName,
      firstName,
      lastName,
      first_name: firstName,
      last_name: lastName,
      designation: backendEmp.job_title || backendEmp.designation || 'Staff',
      job_title: backendEmp.job_title || backendEmp.designation || 'Staff',
      department: departmentName,
      departmentId,
      departmentCode,
      phone: backendEmp.phone || 'N/A',
      email: backendEmp.email || 'N/A',
      status: uiStatus,
      rawStatus: backendEmp.status,
      joiningDate,
      address: backendEmp.address || 'N/A',
      shift: rawShift || 'N/A',
      shiftTime,
      gender: backendEmp.gender || '',
      dob: backendEmp.dob || '',
      nationality: backendEmp.nationality || '',
      maritalStatus: backendEmp.marital_status || backendEmp.maritalStatus || '',
      languages: backendEmp.languages || '',
      empType: backendEmp.employment_type || backendEmp.empType || '',
      salary: backendEmp.salary !== undefined && backendEmp.salary !== null ? String(backendEmp.salary) : '',
      reportsTo: backendEmp.reports_to || backendEmp.reportsTo || '',
      altPhone: backendEmp.alt_phone || backendEmp.altPhone || '',
      experience: backendEmp.experience || '',
      education: backendEmp.education || '',
      skills: backendEmp.skills || '',
      emergencyName: emergencyContact.name || backendEmp.emergencyName || '',
      emergencyPhone: emergencyContact.phone || backendEmp.emergencyPhone || '',
      emergencyRelation: emergencyContact.relation || backendEmp.emergencyRelation || '',
      notes: backendEmp.notes || '',
      avatar: backendEmp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1b7f43&color=fff`,
      createdAt: backendEmp.created_at,
      updatedAt: backendEmp.updated_at,
    };
  },

  toListUI(backendList) {
    if (!Array.isArray(backendList)) return [];
    return backendList.map(emp => staffAdapter.toUI(emp)).filter(Boolean);
  },

  toBackendCreatePayload(formData) {
    if (!formData) return {};

    const nameStr = (formData.fullName || formData.name || '').trim();
    const nameParts = nameStr.split(/\s+/);
    const firstName = nameParts[0] || 'Staff';
    const lastName = nameParts.slice(1).join(' ') || '.';

    let status = 'ACTIVE';
    const rawStatus = (formData.employmentStatus || formData.status || '').toUpperCase();
    if (rawStatus === 'ON LEAVE' || rawStatus === 'ON_LEAVE') status = 'ON_LEAVE';
    else if (rawStatus === 'TERMINATED' || rawStatus === 'INACTIVE') status = 'TERMINATED';
    else if (rawStatus === 'ACTIVE') status = 'ACTIVE';

    const payload = {
      employee_ref: (formData.empId || formData.employee_ref || '').trim().toUpperCase(),
      first_name: firstName,
      last_name: lastName,
      email: (formData.email || '').trim().toLowerCase(),
      phone: (formData.mobile || formData.phone || '').trim(),
      job_title: (formData.designation || formData.job_title || 'Staff').trim(),
      department_id: (formData.department_id || formData.department || '').trim(),
      status,
    };

    if (formData.address?.trim()) payload.address = formData.address.trim();
    if (formData.dob?.trim()) payload.dob = formData.dob.trim();
    if (formData.gender?.trim()) payload.gender = formData.gender.trim();
    if (formData.nationality?.trim()) payload.nationality = formData.nationality.trim();
    if (formData.maritalStatus?.trim()) payload.marital_status = formData.maritalStatus.trim();
    if (formData.languages?.trim()) payload.languages = formData.languages.trim();
    if (formData.altPhone?.trim()) payload.alt_phone = formData.altPhone.trim();
    if (formData.joiningDate?.trim()) payload.joining_date = formData.joiningDate.trim();
    if (formData.empType?.trim()) payload.employment_type = formData.empType.trim();
    if (formData.shift?.trim()) payload.shift = formData.shift.trim();
    if (formData.salary !== '' && formData.salary !== null && formData.salary !== undefined) {
      const numSal = Number(formData.salary);
      if (!isNaN(numSal)) payload.salary = numSal;
    }
    if (formData.reportsTo?.trim()) payload.reports_to = formData.reportsTo.trim();
    if (formData.experience?.trim()) payload.experience = formData.experience.trim();
    if (formData.education?.trim()) payload.education = formData.education.trim();
    if (formData.skills?.trim()) payload.skills = formData.skills.trim();

    if (formData.emergencyName?.trim() || formData.emergencyPhone?.trim() || formData.emergencyRelation?.trim()) {
      payload.emergency_contact = {
        name: formData.emergencyName?.trim() || '',
        phone: formData.emergencyPhone?.trim() || '',
        relation: formData.emergencyRelation?.trim() || '',
      };
    }

    if (formData.notes?.trim()) payload.notes = formData.notes.trim();
    if (formData.avatar?.trim()) payload.avatar = formData.avatar.trim();

    return payload;
  },

  toBackendUpdatePayload(formData) {
    if (!formData) return {};

    const payload = {};

    if (formData.fullName !== undefined || formData.name !== undefined) {
      const nameStr = (formData.fullName || formData.name || '').trim();
      const nameParts = nameStr.split(/\s+/);
      payload.first_name = nameParts[0] || 'Staff';
      payload.last_name = nameParts.slice(1).join(' ') || '.';
    }

    if (formData.designation !== undefined || formData.job_title !== undefined) {
      payload.job_title = (formData.designation || formData.job_title || '').trim();
    }

    if (formData.phone !== undefined || formData.mobile !== undefined) {
      payload.phone = (formData.phone || formData.mobile || '').trim();
    }

    if (formData.email !== undefined) {
      payload.email = formData.email.trim().toLowerCase();
    }

    if (formData.address !== undefined) {
      payload.address = formData.address.trim();
    }

    if (formData.joiningDate !== undefined || formData.joining_date !== undefined) {
      payload.joining_date = (formData.joiningDate || formData.joining_date || '').trim();
    }

    if (formData.department_id || (formData.department && formData.department.length === 24)) {
      payload.department_id = formData.department_id || formData.department;
    }

    if (formData.status !== undefined || formData.employmentStatus !== undefined) {
      const rawStatus = (formData.employmentStatus || formData.status || '').toUpperCase();
      if (rawStatus === 'ON LEAVE' || rawStatus === 'ON_LEAVE') payload.status = 'ON_LEAVE';
      else if (rawStatus === 'TERMINATED' || rawStatus === 'INACTIVE') payload.status = 'TERMINATED';
      else if (rawStatus === 'ACTIVE') payload.status = 'ACTIVE';
    }

    if (formData.dob !== undefined) payload.dob = formData.dob.trim();
    if (formData.gender !== undefined) payload.gender = formData.gender.trim();
    if (formData.nationality !== undefined) payload.nationality = formData.nationality.trim();
    if (formData.maritalStatus !== undefined || formData.marital_status !== undefined) {
      payload.marital_status = (formData.maritalStatus || formData.marital_status || '').trim();
    }
    if (formData.languages !== undefined) payload.languages = formData.languages.trim();
    if (formData.altPhone !== undefined || formData.alt_phone !== undefined) {
      payload.alt_phone = (formData.altPhone || formData.alt_phone || '').trim();
    }
    if (formData.empType !== undefined || formData.employment_type !== undefined) {
      payload.employment_type = (formData.empType || formData.employment_type || '').trim();
    }
    if (formData.shift !== undefined) payload.shift = formData.shift.trim();
    if (formData.salary !== undefined && formData.salary !== '' && formData.salary !== null) {
      const numSal = Number(formData.salary);
      if (!isNaN(numSal)) payload.salary = numSal;
    }
    if (formData.reportsTo !== undefined || formData.reports_to !== undefined) {
      payload.reports_to = (formData.reportsTo || formData.reports_to || '').trim();
    }
    if (formData.experience !== undefined) payload.experience = formData.experience.trim();
    if (formData.education !== undefined) payload.education = formData.education.trim();
    if (formData.skills !== undefined) payload.skills = formData.skills.trim();

    if (formData.emergencyName || formData.emergencyPhone || formData.emergencyRelation) {
      payload.emergency_contact = {
        name: formData.emergencyName?.trim() || '',
        phone: formData.emergencyPhone?.trim() || '',
        relation: formData.emergencyRelation?.trim() || '',
      };
    }

    if (formData.notes !== undefined) payload.notes = formData.notes.trim();

    return payload;
  },

  toLeaveUI(backendLeave) {
    if (!backendLeave) return null;

    const id = (backendLeave._id || backendLeave.id || '').toString();
    const emp = backendLeave.employee_id || {};
    const empId = emp.employee_ref || (emp._id ? `EMP-${emp._id.toString().slice(-4).toUpperCase()}` : 'EMP-000');
    const firstName = emp.first_name || '';
    const lastName = emp.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || emp.name || 'Staff Member';

    let department = 'General';
    if (emp.department_id) {
      if (typeof emp.department_id === 'object') {
        department = emp.department_id.name || emp.department_id.code || 'General';
      } else {
        department = emp.department_id.toString();
      }
    } else if (emp.department) {
      department = emp.department;
    }

    const designation = emp.job_title || emp.designation || 'Staff';
    const avatar = emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5d5fef&color=fff`;

    // Map leave_type to UI display
    const typeMap = {
      SICK: 'Sick Leave',
      CASUAL: 'Casual Leave',
      ANNUAL: 'Annual Leave',
      MATERNITY: 'Maternity Leave',
      UNPAID: 'Unpaid Leave',
      SPECIAL: 'Special Leave',
      PERSONAL: 'Personal Leave',
      OTHER: 'Special Leave',
    };
    const rawType = (backendLeave.leave_type || '').toUpperCase();
    const leaveType = typeMap[rawType] || backendLeave.leave_type || 'Special Leave';

    // Status mapping: PENDING -> Pending, APPROVED -> Approved, REJECTED -> Rejected, CANCELLED -> Cancelled
    const rawStatus = (backendLeave.status || '').toUpperCase();
    let status = 'Pending';
    if (rawStatus === 'APPROVED') status = 'Approved';
    else if (rawStatus === 'REJECTED') status = 'Rejected';
    else if (rawStatus === 'CANCELLED') status = 'Cancelled';
    else if (backendLeave.status) status = backendLeave.status;

    // Date formatting to YYYY-MM-DD
    const formatDate = (val) => {
      if (!val) return '';
      try {
        return new Date(val).toISOString().split('T')[0];
      } catch {
        return String(val);
      }
    };
    const from = formatDate(backendLeave.start_date || backendLeave.from);
    const to = formatDate(backendLeave.end_date || backendLeave.to);

    // Days
    let days = backendLeave.days;
    if (!days && from && to) {
      try {
        const d1 = new Date(from);
        const d2 = new Date(to);
        days = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      } catch {
        days = 1;
      }
    }

    // Approved By
    let approvedBy = '-';
    if (backendLeave.approved_by) {
      if (typeof backendLeave.approved_by === 'object') {
        const appFirst = backendLeave.approved_by.first_name || '';
        const appLast = backendLeave.approved_by.last_name || '';
        approvedBy = `${appFirst} ${appLast}`.trim() || backendLeave.approved_by.name || '-';
      } else {
        approvedBy = backendLeave.approved_by.toString();
      }
    }

    return {
      id,
      _id: id,
      empId,
      employeeId: (emp._id || emp.id || '').toString(),
      name: fullName,
      avatar,
      department,
      designation,
      leaveType,
      rawLeaveType: backendLeave.leave_type,
      status,
      rawStatus: backendLeave.status,
      from,
      to,
      startDate: from,
      endDate: to,
      days: days || 1,
      approvedBy,
      approvedById: (backendLeave.approved_by?._id || backendLeave.approved_by || '').toString(),
      managerComments: backendLeave.manager_comments || '',
      reason: backendLeave.reason || '',
      createdAt: backendLeave.created_at,
      updatedAt: backendLeave.updated_at,
    };
  },

  toLeaveListUI(backendList) {
    if (!Array.isArray(backendList)) return [];
    return backendList.map(item => staffAdapter.toLeaveUI(item)).filter(Boolean);
  },

  toLeaveBackendPayload(formData) {
    if (!formData) return {};

    // Reverse leave type mapping
    const revTypeMap = {
      'SICK LEAVE': 'SICK',
      'CASUAL LEAVE': 'CASUAL',
      'ANNUAL LEAVE': 'ANNUAL',
      'MATERNITY LEAVE': 'MATERNITY',
      'UNPAID LEAVE': 'UNPAID',
      'SPECIAL LEAVE': 'SPECIAL',
      'PERSONAL LEAVE': 'PERSONAL',
      'MEDICAL LEAVE': 'SICK',
      'OTHER LEAVE': 'OTHER',
    };
    const normType = (formData.leaveType || formData.leave_type || 'SPECIAL').trim().toUpperCase();
    const leave_type = revTypeMap[normType] || normType;

    // Reverse status mapping
    const normStatus = (formData.status || 'PENDING').trim().toUpperCase();
    let status = 'PENDING';
    if (normStatus === 'APPROVED') status = 'APPROVED';
    else if (normStatus === 'REJECTED') status = 'REJECTED';
    else if (normStatus === 'CANCELLED') status = 'CANCELLED';

    const payload = {
      employee_id: formData.employee_id || formData.employeeId,
      leave_type,
      start_date: formData.start_date || formData.from,
      end_date: formData.end_date || formData.to,
      reason: (formData.reason || '').trim(),
      status,
    };

    if (formData.days) {
      const d = Number(formData.days);
      if (!isNaN(d) && d > 0) payload.days = d;
    }

    if (formData.approved_by || formData.approvedById) {
      payload.approved_by = formData.approved_by || formData.approvedById;
    }

    if (formData.manager_comments || formData.managerComments) {
      payload.manager_comments = (formData.manager_comments || formData.managerComments || '').trim();
    }

    return payload;
  }
};

export default staffAdapter;
