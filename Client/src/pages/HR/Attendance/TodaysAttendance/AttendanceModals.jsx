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
                                Employee Name *
                            </label>
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
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                >
                                    <MenuItem value="present">Present</MenuItem>
                                    <MenuItem value="absent">Absent</MenuItem>
                                </TextField>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    First In (HH:MM)
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.firstIn}
                                    onChange={(e) =>
                                        setFormData({ ...formData, firstIn: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Break (HH:MM)
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.breakTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, breakTime: e.target.value })
                                    }
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
                                    value={formData.lastOut}
                                    onChange={(e) =>
                                        setFormData({ ...formData, lastOut: e.target.value })
                                    }
                                />
                            </div>
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
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                >
                                    <MenuItem value="present">Present</MenuItem>
                                    <MenuItem value="absent">Absent</MenuItem>
                                </TextField>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    First In (HH:MM)
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.firstIn}
                                    onChange={(e) =>
                                        setFormData({ ...formData, firstIn: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Break (HH:MM)
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    value={formData.breakTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, breakTime: e.target.value })
                                    }
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
                                    value={formData.lastOut}
                                    onChange={(e) =>
                                        setFormData({ ...formData, lastOut: e.target.value })
                                    }
                                />
                            </div>
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
