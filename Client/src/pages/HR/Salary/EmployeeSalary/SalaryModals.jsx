import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField
} from '@mui/material';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import { departmentsList, rolesList } from './constants';

export const SalaryModals = ({
  isAddModalOpen,
  setIsAddModalOpen,
  handleSaveNewSalary,
  formData,
  setFormData,
  isEditModalOpen,
  setIsEditModalOpen,
  handleSaveEditSalary,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  selectedRecord,
  handleConfirmDelete
}) => {
  return (
    <>
      {/* Dialog: Add New Employee Salary */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <div className="bg-[#5d5fef] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <PaymentsOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">New Employee Salary</h3>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsAddModalOpen(false)}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <form onSubmit={handleSaveNewSalary} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  placeholder="Employee Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Employee ID"
                  placeholder="e.g. EMP-101"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <TagOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  placeholder="test@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <MailOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departmentsList
                    .filter((d) => d !== 'All')
                    .map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                </TextField>
              </div>

              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {rolesList.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Salary"
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PaymentsOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Bonus"
                  type="number"
                  placeholder="e.g. 200"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <AttachMoneyOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Deductions"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <RemoveCircleOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Employee Salary */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <div className="bg-[#5d5fef] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <PaymentsOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">Edit Employee Salary</h3>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsEditModalOpen(false)}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <form onSubmit={handleSaveEditSalary} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Employee ID"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <TagOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <MailOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departmentsList
                    .filter((d) => d !== 'All')
                    .map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                </TextField>
              </div>

              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {rolesList.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PaymentsOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <AttachMoneyOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Deductions"
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <RemoveCircleOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Confirmation */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 2,
            textAlign: 'center'
          }
        }}
      >
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
          <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Delete Salary Record?</h3>
        <p className="text-xs text-slate-500 mb-5">
          Are you sure you want to delete salary record for{' '}
          <strong className="text-slate-700">{selectedRecord?.name}</strong>? This action cannot be
          undone.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Dialog>
    </>
  );
};
