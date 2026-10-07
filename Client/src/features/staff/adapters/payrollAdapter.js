export const payrollAdapter = {
  /**
   * Normalizes a backend roster/employee/item record to the UI Salary table row format.
   */
  toSalaryRow(record) {
    if (!record) return null;

    const id = (record.id || record._id || '').toString();
    const employeeId = (record.employee_id || record.employeeId || id).toString();
    const empId = record.empId || record.employee_ref || `EMP-${id.slice(-4).toUpperCase()}`;

    const firstName = record.first_name || '';
    const lastName = record.last_name || '';
    const fullName = record.name || `${firstName} ${lastName}`.trim() || 'Staff Member';

    const department =
      typeof record.department === 'string'
        ? record.department
        : record.department_id?.name || record.department?.name || 'Unassigned';

    const role = record.role || record.job_title || record.designation || 'Staff';

    const salary = Number(record.salary ?? record.base_salary ?? record.basicSalary ?? 0);
    const bonus = Number(record.bonus ?? record.bonuses ?? record.allowances ?? 0);
    const deductions = Number(record.deductions ?? 0);
    const netSalary = Number(record.netSalary ?? record.net_pay ?? (salary + bonus - deductions));

    const rawStatus = (record.paymentStatus || record.status || 'Pending').toUpperCase();
    const paymentStatus = rawStatus === 'PAID' ? 'Paid' : 'Pending';

    const avatar =
      record.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5d5fef&color=fff`;

    return {
      id,
      _id: id,
      employeeId,
      payroll_item_id: record.payroll_item_id || null,
      empId,
      name: fullName,
      email: record.email || '',
      department,
      role,
      salary,
      bonus,
      deductions,
      netSalary,
      paymentStatus,
      paymentDate: record.paymentDate || record.process_date || '',
      avatar,
    };
  },

  /**
   * Normalizes an array of records to UI salary list.
   */
  toSalaryList(records) {
    if (!Array.isArray(records)) return [];
    return records.map(payrollAdapter.toSalaryRow).filter(Boolean);
  },
};

export default payrollAdapter;
