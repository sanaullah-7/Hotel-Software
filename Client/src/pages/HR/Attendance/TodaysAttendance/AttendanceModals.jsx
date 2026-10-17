import React from "react";
import {
    Dialog,
    DialogContent,
    TextField,
    MenuItem,
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

export const AttendanceModals = ({
    employees = [],
    isAddModalOpen,
    setIsAddModalOpen,
    handleSaveNewAttendance,
    formData,
    setFormData,
    isEditModalOpen,
    setIsEditModalOpen,
    handleSaveEditAttendance,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedRecord,
    handleConfirmDelete
}) => {
    // Dynamic calculation helper
    const computeNetHours = (firstIn, lastOut, breakFrom, breakTo, breakTime) => {
        if (!firstIn || !lastOut) return '00:00';
        try {
            const [inH, inM] = firstIn.split(':').map(Number);
            const [outH, outM] = lastOut.split(':').map(Number);
            let diff = (outH * 60 + outM) - (inH * 60 + inM);
            if (diff < 0) diff += 24 * 60; // Crosses midnight

            let brkMins = 0;
            if (breakFrom && breakTo) {
                const [bF_H, bF_M] = breakFrom.split(':').map(Number);
                const [bT_H, bT_M] = breakTo.split(':').map(Number);
                let bDiff = (bT_H * 60 + bT_M) - (bF_H * 60 + bF_M);
                if (bDiff < 0) bDiff += 24 * 60;
                brkMins = bDiff;
            } else if (breakTime && breakTime !== '00:00') {
                const [bH, bM] = breakTime.split(':').map(Number);
                brkMins = (bH || 0) * 60 + (bM || 0);
            }

            const net = diff <= brkMins ? diff : Math.max(0, diff - brkMins);
            const hrs = Math.floor(net / 60);
            const mins = net % 60;
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        } catch {
            return '00:00';
        }
    };

    const handleTimeChange = (field, value) => {
        const next = { ...formData, [field]: value };
        const isNonWorking = ['absent', 'on_leave', 'leave'].includes((next.status || '').toLowerCase());

        if ((field === 'breakFrom' || field === 'breakTo') && next.breakFrom && next.breakTo) {
            const [bF_H, bF_M] = next.breakFrom.split(':').map(Number);
            const [bT_H, bT_M] = next.breakTo.split(':').map(Number);
            let bDiff = (bT_H * 60 + bT_M) - (bF_H * 60 + bF_M);
            if (bDiff < 0) bDiff += 24 * 60;
            const bH = Math.floor(bDiff / 60);
            const bM = bDiff % 60;
            next.breakTime = `${String(bH).padStart(2, '0')}:${String(bM).padStart(2, '0')}`;
        }

        if (isNonWorking) {
            next.totalHours = '00:00';
        } else {
            next.totalHours = computeNetHours(
                field === 'firstIn' ? value : next.firstIn,
                field === 'lastOut' ? value : next.lastOut,
                field === 'breakFrom' ? value : next.breakFrom,
                field === 'breakTo' ? value : next.breakTo,
                next.breakTime
            );
        }
        setFormData(next);
    };

    const handleStatusChange = (newStatus) => {
        const isNonWorking = ['absent', 'on_leave', 'leave'].includes((newStatus || '').toLowerCase());
        const total = isNonWorking
            ? '00:00'
            : computeNetHours(formData.firstIn, formData.lastOut, formData.breakFrom, formData.breakTo, formData.breakTime);

        setFormData({
            ...formData,
            status: newStatus,
            totalHours: total,
            ...(isNonWorking ? { breakTime: '00:00' } : {})
        });
    };

    return (
        <>
            {/* Dialog: Add Today's Attendance */}
            <Dialog
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        p: 1,
                    },
                }}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">
                        Add Today's Attendance
                    </h3>
                    <IconButton size="small" onClick={() => setIsAddModalOpen(false)}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </div>

                <DialogContent sx={{ p: 3 }}>
                    <form onSubmit={handleSaveNewAttendance} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Employee *
                            </label>
                            {employees.length > 0 ? (
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={formData.employee_id || ''}
                                    onChange={(e) => {
                                        const emp = employees.find(item => (item._id || item.id) === e.target.value);
                                        const fullName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : '';
                                        setFormData({
                                            ...formData,
                                            employee_id: e.target.value,
                                            name: fullName,
                                            avatar: emp?.avatar || ''
                                        });
                                    }}
                                    required
                                >
                                    {employees.map((emp) => (
                                        <MenuItem key={emp._id || emp.id} value={emp._id || emp.id}>
                                            {emp.first_name} {emp.last_name} ({emp.employee_ref || 'EMP'}) - {emp.job_title || 'Staff'}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="e.g. Alex Morgan"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Shift *
                                </label>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={formData.shift}
                                    onChange={(e) =>
                                        setFormData({ ...formData, shift: e.target.value })
                                    }
                                >
                                    <MenuItem value="Day Shift">Day Shift</MenuItem>
                                    <MenuItem value="Night Shift">Night Shift</MenuItem>
                                </TextField>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Status *
                                </label>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={formData.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                    <MenuItem value="present">Present</MenuItem>
                                    <MenuItem value="absent">Absent</MenuItem>
                                    <MenuItem value="on_leave">Leave</MenuItem>
                                    <MenuItem value="late">Late</MenuItem>
                                </TextField>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    First In (HH:MM)
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.firstIn || ''}
                                    onChange={(e) => handleTimeChange('firstIn', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Break From
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.breakFrom || ''}
                                    onChange={(e) => handleTimeChange('breakFrom', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Break To
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.breakTo || ''}
                                    onChange={(e) => handleTimeChange('breakTo', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Last Out (HH:MM)
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.lastOut || ''}
                                    onChange={(e) => handleTimeChange('lastOut', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Live Total Hours Indicator */}
                        <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#5d5fef]" />
                                <span className="text-xs font-medium text-slate-700">Calculated Working Time</span>
                            </div>
                            <span className="text-xs font-bold text-[#5d5fef] font-mono bg-white px-2.5 py-0.5 rounded shadow-2xs border border-indigo-100">
                                {formData.totalHours || '00:00'} hrs
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-lg bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                            >
                                Save Attendance
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog: Edit Attendance */}
            <Dialog
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        p: 1,
                    },
                }}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">
                        Edit Today's Attendance
                    </h3>
                    <IconButton size="small" onClick={() => setIsEditModalOpen(false)}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </div>

                <DialogContent sx={{ p: 3 }}>
                    <form onSubmit={handleSaveEditAttendance} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Employee Name *
                            </label>
                            <TextField
                                fullWidth
                                size="small"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Shift *
                                </label>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={formData.shift}
                                    onChange={(e) =>
                                        setFormData({ ...formData, shift: e.target.value })
                                    }
                                >
                                    <MenuItem value="Day Shift">Day Shift</MenuItem>
                                    <MenuItem value="Night Shift">Night Shift</MenuItem>
                                </TextField>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Status *
                                </label>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={formData.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                    <MenuItem value="present">Present</MenuItem>
                                    <MenuItem value="absent">Absent</MenuItem>
                                    <MenuItem value="on_leave">Leave</MenuItem>
                                    <MenuItem value="late">Late</MenuItem>
                                </TextField>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    First In (HH:MM)
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.firstIn || ''}
                                    onChange={(e) => handleTimeChange('firstIn', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Break From
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.breakFrom || ''}
                                    onChange={(e) => handleTimeChange('breakFrom', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Break To
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.breakTo || ''}
                                    onChange={(e) => handleTimeChange('breakTo', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Last Out (HH:MM)
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.lastOut || ''}
                                    onChange={(e) => handleTimeChange('lastOut', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Live Total Hours Indicator */}
                        <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#5d5fef]" />
                                <span className="text-xs font-medium text-slate-700">Calculated Working Time</span>
                            </div>
                            <span className="text-xs font-bold text-[#5d5fef] font-mono bg-white px-2.5 py-0.5 rounded shadow-2xs border border-indigo-100">
                                {formData.totalHours || '00:00'} hrs
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-lg bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                            >
                                Update Attendance
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
                        borderRadius: "16px",
                        p: 2,
                        textAlign: "center",
                    },
                }}
            >
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
                    <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                    Delete Attendance Record?
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                    Are you sure you want to delete attendance record for{""}
                    <strong className="text-slate-700">{selectedRecord?.name}</strong>?
                    This action cannot be undone.
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

