const { execSync } = require("child_process");

// Files where we keep SHAYAN's version (our work - reservation form, routes, edit)
const keepOurs = [
    "Client/src/features/reservations/pages/AddReservation.jsx",
    "Client/src/features/reservations/pages/AddReservation/index.jsx",
    "Client/src/features/reservations/components/AddReservationForm/index.jsx",
    "Client/src/features/reservations/components/AddReservationForm/useAddReservation.js",
    "Client/src/routes/AppRoutes.jsx",
];

// Files where we keep YOUNAS version (their work - unrelated UI improvements)
const keepTheirs = [
    "Client/src/features/events/components/EventSummaryCards.jsx",
    "Client/src/features/events/components/EventToolbar.jsx",
    "Client/src/features/guests/components/tabs/InvoicesTab.jsx",
    "Client/src/features/guests/components/tabs/ReservationsTab.jsx",
    "Client/src/features/inventory/pages/GuestCharges.jsx",
    "Client/src/features/inventory/pages/MissingInventory.jsx",
    "Client/src/features/reservations/components/ReservationTable.jsx",
    "Client/src/features/reservations/pages/CancelledBookings.jsx",
    "Client/src/features/reservations/pages/ReservationHistory.jsx",
    "Client/src/pages/Dashboard/components/BookingsGridTable.jsx",
    "Client/src/pages/HR/Attendance/TodaysAttendance/useTodaysAttendance.js",
    "Client/src/pages/HR/Salary/EmployeeSalary/useEmployeeSalary.js",
];

keepOurs.forEach(f => {
    try {
        execSync(`git checkout --ours "${f}"`, {stdio: 'pipe'});
        execSync(`git add "${f}"`, {stdio: 'pipe'});
        console.log("Kept OURS:", f);
    } catch(e) { console.error("Error on ours:", f, e.message); }
});

keepTheirs.forEach(f => {
    try {
        execSync(`git checkout --theirs "${f}"`, {stdio: 'pipe'});
        execSync(`git add "${f}"`, {stdio: 'pipe'});
        console.log("Kept THEIRS:", f);
    } catch(e) { console.error("Error on theirs:", f, e.message); }
});
