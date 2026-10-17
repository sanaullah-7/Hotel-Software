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

    const paidAmount = Number(record.paidAmount ?? record.paid_amount ?? 0);
    const remainingBalance = Number(
      record.remainingBalance ?? Math.max(0, netSalary - paidAmount)
    );

    const rawStatus = (record.rawStatus || record.status || record.paymentStatus || 'PENDING').toUpperCase();
    let paymentStatus = 'Pending';
    if (rawStatus === 'PAID' || (paidAmount >= netSalary && netSalary > 0)) {
      paymentStatus = 'Paid';
    } else if (rawStatus === 'PARTIAL' || paidAmount > 0) {
      paymentStatus = 'Partial';
    }

    const avatar =
      record.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5d5fef&color=fff`;

    return {
      id,
      _id: id,
      employeeId,
      payroll_item_id: record.payroll_item_id || null,
      run_id: record.run_id || null,
      run_ref: record.run_ref || '',
      empId,
      name: fullName,
      email: record.email || '',
      department,
      role,
      salary,
      bonus,
      deductions,
      netSalary,
      paidAmount,
      remainingBalance,
      paymentStatus,
      rawStatus,
      paymentMethod: record.paymentMethod || record.payment_method || 'BANK_TRANSFER',
      paymentDate: record.paymentDate || record.payment_date || record.process_date || '',
      paymentNotes: record.paymentNotes || record.payment_notes || '',
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

  /**
   * Normalizes a past payroll item record to an employee history ledger row.
   */
  toHistoryRow(item) {
    if (!item) return null;
    const run = item.run_id || {};
    const emp = item.employee_id || {};

    const baseSalary = Number(item.base_salary || 0);
    const bonus = Number(item.bonuses || 0);
    const deductions = Number(item.deductions || 0);
    const netSalary = Number(item.net_pay ?? (baseSalary + bonus - deductions));
    const paidAmount = Number(item.paid_amount || 0);
    const remainingBalance = Math.max(0, netSalary - paidAmount);
    const rawStatus = (item.status || 'PENDING').toUpperCase();

    let paymentStatus = 'Pending';
    if (rawStatus === 'PAID' || (paidAmount >= netSalary && netSalary > 0)) {
      paymentStatus = 'Paid';
    } else if (rawStatus === 'PARTIAL' || paidAmount > 0) {
      paymentStatus = 'Partial';
    }

    const firstName = emp.first_name || '';
    const lastName = emp.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Staff Member';

    return {
      id: item._id?.toString() || item.id,
      payroll_item_id: item._id?.toString() || item.id,
      run_id: run._id?.toString() || '',
      run_ref: run.run_ref || 'N/A',
      period_start: run.period_start || null,
      period_end: run.period_end || null,
      process_date: item.payment_date || run.process_date || item.created_at,
      baseSalary,
      salary: baseSalary,
      bonus,
      deductions,
      netSalary,
      paidAmount,
      remainingBalance,
      paymentStatus,
      rawStatus,
      paymentMethod: item.payment_method || 'BANK_TRANSFER',
      paymentDate: item.payment_date || null,
      paymentNotes: item.payment_notes || '',
      name: fullName,
      empId: emp.employee_ref || '',
      department: emp.department_id?.name || 'Unassigned',
      role: emp.job_title || 'Staff',
      email: emp.email || '',
    };
  },

  /**
   * Normalizes an array of past payroll items for history view.
   */
  toHistoryList(items) {
    if (!Array.isArray(items)) return [];
    return items.map(payrollAdapter.toHistoryRow).filter(Boolean);
  },
};

export default payrollAdapter;
