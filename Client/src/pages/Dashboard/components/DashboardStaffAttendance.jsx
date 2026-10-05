import React from 'react';
import { Snackbar, Alert } from "@mui/material";

// Import exact full table components from TodaysAttendance
import { useTodaysAttendance } from '../../HR/Attendance/TodaysAttendance/useTodaysAttendance';
import { AttendanceTable } from '../../HR/Attendance/TodaysAttendance/AttendanceTable';
import { AttendanceModals } from '../../HR/Attendance/TodaysAttendance/AttendanceModals';

export default function DashboardStaffAttendance() {
  // Use the full HR Attendance state
  const attendanceState = useTodaysAttendance();

  return (
    <div className="flex flex-col gap-4">
      {/* Exact Full Attendance Table */}
      <div className="w-full flex flex-col">
          <AttendanceTable {...attendanceState} isDashboard={true} hideScrollbar={true} />
      </div>

      {/* Attendance Modals and Toasts (needed for full functionality) */}
      <AttendanceModals {...attendanceState} />

      <Snackbar
          open={attendanceState.toast.open}
          autoHideDuration={4000}
          onClose={() => attendanceState.setToast({ ...attendanceState.toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
          <Alert
              onClose={() => attendanceState.setToast({ ...attendanceState.toast, open: false })}
              severity={attendanceState.toast.severity}
              variant="filled"
              sx={{ width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          >
              {attendanceState.toast.message}
          </Alert>
      </Snackbar>
    </div>
  );
}
