import { mockSalaries } from '../../../../utils/mockData';

export const departmentsList = ['All', 'Management', 'Front Office', 'Housekeeping', 'Kitchen'];
export const rolesList = ['Manager', 'Receptionist', 'Housekeeper', 'Chef', 'Staff'];

export const initialSalaryList = mockSalaries.map((salary) => ({
  ...salary,
  role: salary.designation || 'Staff',
  salary: salary.salary ?? salary.basicSalary ?? 0,
  bonus: salary.bonus ?? salary.allowances ?? 0,
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(salary.name)}&background=5d5fef&color=fff`
}));
