# Explore Pakistan — Hotel PMS (Client & Tenant Data Plane) Architecture & Implementation Master Plan

**Platform:** Explore Pakistan Hotel Management System  
**Architecture:** Multi-Tenant SaaS — Physical Database-Per-Tenant Data Plane (`hotel_<hotelId>`)  
**Authority:** Principal Software Architect, Senior Hotel Systems Engineer, Multi-Tenant Database Architect, Security Architect, Financial Systems Architect, QA & Integration Auditor  
**Document Status:** PERMANENT AUTHORITATIVE ARCHITECTURAL SPECIFICATION & PHASE EXECUTION MASTER PLAN  
**File Path:** `hotel.md`

---

## 1. DOCUMENT AUTHORITY & CHANGE CONTROL

This document is the **single permanent source of truth** for the hotel operational application ([`Client/`](file:///d:/bootcamp/HotelManagement/Client)), the tenant PMS data plane backend ([`Server/src/modules/hotel/`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel)), and all future implementation phases of the hotel operations system.

### 1.1 Architectural Freeze & Change Control Rule
Once recorded, the architectural invariants, database partition boundaries, financial ledger rules, and lifecycle state machines defined in this document are **frozen**.

Any future modification to:
* Physical database-per-tenant isolation (`hotel_<hotelId>`)
* Tenant context extraction from cryptographically verified JWT tokens
* Reservation collision locking algorithms (`expected_check_in < checkOut && expected_check_out > checkIn`)
* Financial immutability of invoices, payments, and refunds
* Automated folio balance calculation formulas
* State machine transition rules for Guests, Rooms, Reservations, Stays, and Housekeeping

**MUST be processed as a formal Architectural Decision Record (ADR)**. Informal or cosmetic code refactoring is strictly prohibited.

### 1.2 Implementation Philosophy: Preservation Over Rebuild
The Explore Pakistan PMS already contains **38 connected frontend operational views** and **27 mounted backend business modules** backed by **111 automated test suites** across the workspace.

$$\textbf{AUDIT} \longrightarrow \textbf{PRESERVE WORKING CODE} \longrightarrow \textbf{FIX KNOWN DEFECTS} \longrightarrow \textbf{ADD NEW PROFESSIONAL CAPABILITIES} \longrightarrow \textbf{TEST \& VERIFY}$$

* **DO NOT rebuild working modules** simply for personal stylistic preference.
* **DO NOT create duplicate controllers, services, routes, or components** when canonical ones exist.
* **DO NOT bypass server-side validation or business logic** with browser-only calculations.
* **DO NOT revert to browser `localStorage`** as a source of truth for business data.

---

## 2. SYSTEM TOPOLOGY & ARCHITECTURAL FOUNDATION

### 2.1 System Topology
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                                 │
│  Client PMS (React 19 / Vite / Port 5173)                                   │
│  - Front Desk, Room Management, Stays, Folios, Housekeeping, Operations    │
│  - Recharts, Material-UI Icons, Tailwind CSS v4                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / JSON Bearer JWT
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & ROUTING LAYER                              │
│  Server (Express 5.2 / Port 5000)                                           │
│  - Mounted via Server/src/routes/hotel.routes.js under /api/v1/hotel        │
│  - Global Middleware: cors, helmet, cookieParser, express.json             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TENANT CONTEXT RESOLUTION PIPELINE                       │
│  1. authMiddleware: Validates JWT signature & checks Account.tokenVersion   │
│  2. hotelContext: STRICTLY derives hotelId = req.user.hotelId (Tamper-proof)│
│  3. rbacMiddleware: Enforces HOTEL_ADMIN vs HOTEL_USER role permissions    │
│  4. validate: Validates request payload against Joi/Zod schemas             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TENANT DATA PLANE ROUTER                              │
│  - connectionManager.js: Cached connection to mongodb://.../hotel_<hotelId> │
│  - modelFactory.js: Pre-registers 51 tenant schemas from schemaRegistry.js  │
│  - Database: Physical database-per-tenant isolation                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Architectural Principles
1. **Physical Database-Per-Tenant Isolation:** Operational hotel records are strictly stored in dedicated databases (`hotel_<hotelId>`). Shared operational collections across hotels are structurally prohibited.
2. **Server-Owned Business Authority:** The backend database is the sole authority for availability, balances, room status, and lifecycle transitions. Frontend stores serve as presentation caches only.
3. **Double-Booking Prevention:** Reservation dates are validated using strict overlap mathematics coupled with atomic physical room booking locks inside `Room.active_bookings`.
4. **Append-Only Financial Ledger:** Folio balances are derived from itemized guest charges, invoices, payments, and refunds. Direct manual overrides of folio balance fields are prohibited.
5. **Fail-Closed Security:** Unauthenticated, unassociated, or suspended accounts are rejected with `HTTP 401/403` before reaching tenant business logic.

---

## 3. DOMAIN LIFECYCLE STATE MACHINES

### 3.1 Reservation Lifecycle State Machine
```
              ┌──────────────┐
              │   PENDING    │
              └──────┬───────┘
                     │ Staff Confirms / Guarantee Captured
                     ▼
              ┌──────────────┐      Guest No-Show (Midnight Audit)
              │  CONFIRMED   ├──────────────────────────────────────────┐
              └──────┬───────┘                                          │
                     │ Check-In (Valid Physical Room Assigned)          │
                     ▼                                                  │
              ┌──────────────┐                                          ▼
              │   IN_HOUSE   │                                   ┌──────────────┐
              └──────┬───────┘                                   │   NO_SHOW    │
                     │ Check-Out (Folio Fully Settled)           └──────────────┘
                     ▼                                                  ▲
              ┌──────────────┐                                          │
              │ CHECKED_OUT  │                                          │
              └──────────────┘                                          │
                     ▲                                                  │
                     │ Cancellation Command                             │
                     └──────────────────────────────────────────────────┘
```
**Invariants:**
- A `CANCELLED` or `CHECKED_OUT` reservation cannot be checked in.
- An `IN_HOUSE` reservation cannot be cancelled without performing formal early check-out.
- Creating a reservation locks physical room dates in `Room.active_bookings`.

---

### 3.2 Room Operational & Housekeeping Lifecycle
```
┌───────────────────────────┐         Front Desk Check-In
│     ROOM OPERATIONAL      │  AVAILABLE ──────────────────► OCCUPIED
│         STATUS            │      ▲                             │
└───────────────────────────┘      │                             │ Front Desk
                                   │ Inspection Approved         │ Check-Out
                                   │                             ▼
┌───────────────────────────┐  INSPECTED                     DIRTY
│       HOUSEKEEPING        │      ▲                             │
│         STATUS            │      │ Room Cleaned                │ Cleaning Started
└───────────────────────────┘      │                             ▼
                                CLEAN ◄────────────────────── CLEANING
```
**Invariants:**
- When a guest checks out, `Room.status` remains `AVAILABLE`, but `Room.housekeeping_status` MUST transition to `DIRTY`.
- **Cleanliness Gate:** Front desk CANNOT check an arriving guest into a room unless `Room.housekeeping_status === 'CLEAN'` or `'INSPECTED'` (override requires manager permission).

---

### 3.3 Financial Ledger Lifecycle (Folio, Charges, Invoices & Payments)
```
  Reservation Created ──────► Folio Auto-Created (Status: OPEN, Balance: 0)
                                    │
                                    ├────► Post GuestCharge (Room Rate, Dining, Minibar)
                                    │             │
                                    │             ▼
                                    ├────► Generate Invoice (Snapshot of Charges + Taxes)
                                    │             │
                                    │             ▼
                                    ├────► Record Payment (Cash, Card, Online)
                                    │             │
                                    │             ▼
                                    ├────► Folio Balance Recalculated = (Total Invoiced - Paid)
                                    │             │
                                    ▼             ▼
       Checkout Reached ──────► Folio Settled (Balance == 0) ──► Folio Status: CLOSED
```
**Invariants:**
- Every charge posted to a guest must reference an active, open `folio_id`.
- Payments and refunds are immutable transaction records.
- Invoices cannot be deleted; they may only transition to `VOIDED`, which automatically triggers folio balance recalculation.

---

## 4. WHAT ALREADY WORKS & MUST NOT BE CHANGED

The following systems are verified and **MUST BE PRESERVED**:

1. **Multi-Tenant Dynamic Connection Pool ([`Server/src/database/connectionManager.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/connectionManager.js)):**
   - Lazily connects to `hotel_<hotelId>` and caches connections with regex URI sanitation.
2. **Tenant Context Pipeline ([`Server/src/middlewares/hotelContext.middleware.js`](file:///d:/bootcamp/HotelManagement/Server/src/middlewares/hotelContext.middleware.js)):**
   - Derives tenant identity strictly from verified token claims.
3. **Double-Booking Overlap Engine ([`Server/src/modules/hotel/reservations/reservation.service.js:18-77`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/reservations/reservation.service.js#L18-L77)):**
   - Mathematical date overlap checking and atomic room blocking.
4. **Stay Lifecycle Operations ([`Server/src/modules/hotel/checkInOut/checkInOut.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/checkInOut/checkInOut.service.js)):**
   - Check-in, check-out, room occupancy synchronization.
5. **Domain Operational Modules:**
   - Housekeeping Tasks & Inspection Checklists ([`housekeeping.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/housekeeping/housekeeping.service.js))
   - Equipment Maintenance Ticketing ([`maintenance.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/maintenance/maintenance.service.js))
   - Guest Complaints & Resolution Logs ([`complaint.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/complaints/complaint.service.js))
   - Car Parking Space Assignment ([`parking.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/parking/parking.service.js))
   - Restaurant Menu, Tables & POS Orders ([`restaurant.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/restaurant/restaurant.service.js))
   - Events & Banquet Event Orders (BEO) ([`event.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/events/event.service.js))
   - Inventory Stock & Incident Tracking ([`inventory.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/inventory/inventory.service.js))
   - HR Staff Attendance, Leaves & Salary Runs ([`hr/attendance.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/hr/attendance.service.js))
   - Append-Only System Audit Logs ([`hotelAudit/audit.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/hotelAudit/audit.service.js))

---

## 5. CURRENT DEFECT & GAP INVENTORY

Before implementing new features, the following foundational gaps must be resolved in **Phases 1 and 2**:

1. **Billing Test Assertion Mismatch (P0):**
   - In [`reservation.service.js:236-260`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/reservations/reservation.service.js#L236-L260), creating a reservation auto-generates a folio, a room rate guest charge, and an invoice. Older tests ([`billingFoundation.test.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/invoices/__tests__/billingFoundation.test.js), [`billingStep3.test.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/invoices/__tests__/billingStep3.test.js), [`billingStep4.test.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/invoices/__tests__/billingStep4.test.js)) expect a fresh folio to have `$0` balance. The test assertions must be aligned with the auto-billing engine.
2. **Dashboard KPI Client-Side Slicing (P0):**
   - [`Dashboard.jsx:54-59`](file:///d:/bootcamp/HotelManagement/Client/src/pages/Dashboard/Dashboard.jsx#L54-L59) fetches the first 100 records and computes "Revenue Today" and "Occupancy" using client-side JavaScript loops. A native MongoDB aggregation endpoint `/api/v1/hotel/dashboard/metrics` must be implemented.
3. **Missing Cleanliness Gate on Check-In (P1):**
   - Front desk can check an arriving guest into a `DIRTY` room without a prompt or blocking gate.
4. **Base64 Document Storage Bloat (P1):**
   - Scanned guest CNICs/Passports and hotel logos are converted via `FileReader.readAsDataURL()` and stored as multi-megabyte inline base64 strings directly in MongoDB documents.
5. **Synthetic / Mock Report Metrics (P1):**
   - [`report.service.js:93-125`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/reports/report.service.js#L93-L125) hardcodes 5% Spa revenue and fake booking channel ratios (35% Direct, 30% OTA). These must be calculated dynamically from real booking sources.
6. **Orphaned Placeholder Directories:**
   - Empty directories containing only placeholder READMEs (`taxesFees`, `discounts`, `availability`, `staff`, `files`, empty `room.routes.js`) must be cleaned up.

---

## 6. PHASED IMPLEMENTATION MASTER PLAN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STABILIZATION & GAP RESOLUTION                        │
│  Phase 1: Operational Core Stabilization & Test Alignment                   │
│  Phase 2: Storage Optimization, Report Integrity & Directory Cleanup        │
├─────────────────────────────────────────────────────────────────────────────┤
│                       THE PROFESSIONAL PMS UPGRADES                         │
│  Phase 3: Visual Front Desk — Interactive Gantt Room Tape Chart             │
│  Phase 4: Front-Desk Speed, Cash Integrity & Universal Command Palette      │
│  Phase 5: Financial Maturity — Multi-Folio Splitting & Night Audit Wizard   │
├─────────────────────────────────────────────────────────────────────────────┤
│                       THE MARKET-BEATER INNOVATIONS                         │
│  Phase 6: Pakistani ID OCR Scanner & WhatsApp Native Guest Experience       │
│  Phase 7: Compliance, Direct Booking Engine & Revenue Maximizer             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### PHASE 1: OPERATIONAL CORE STABILIZATION & TEST ALIGNMENT

**Goal:** Achieve 100% test pass rates across Server and Client, implement authoritative server-side dashboard metrics, and enforce the housekeeping check-in gate.

#### 1. Database & Schemas
- **File:** [`Server/src/database/hotel/schemas/rooms/room.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/rooms/room.schema.js)
  - Ensure `housekeeping_status` enum strictly allows: `['CLEAN', 'DIRTY', 'INSPECTING', 'CLEANING', 'OUT_OF_SERVICE']`.
  - Add index `{ housekeeping_status: 1, status: 1 }` for high-speed front-desk queries.

#### 2. Backend Implementation
- **File:** [`Server/src/modules/hotel/dashboard/dashboard.routes.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/dashboard/dashboard.routes.js) *(New)*
  - Mount `GET /api/v1/hotel/dashboard/metrics` in [`hotel.routes.js`](file:///d:/bootcamp/HotelManagement/Server/src/routes/hotel.routes.js).
- **File:** [`Server/src/modules/hotel/dashboard/dashboard.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/dashboard/dashboard.service.js) *(New)*
  - Implement native MongoDB `$facet` aggregation querying:
    1. `today_reservations`: Total count where `created_at` or `expected_check_in` matches today's date in hotel timezone.
    2. `today_check_ins`: Count of stays where `actual_check_in` is today.
    3. `today_check_outs`: Count of stays where `actual_check_out` is today.
    4. `occupied_rooms`: Count of physical rooms with `status === 'OCCUPIED'`.
    5. `available_rooms`: Count of physical rooms with `status === 'AVAILABLE'`.
    6. `today_revenue`: Sum of payments received today + non-invoiced direct sales.
    7. `outstanding_dues`: Sum of unpaid invoice balances across active in-house folios.
- **File:** [`Server/src/modules/hotel/checkInOut/checkInOut.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/checkInOut/checkInOut.service.js)
  - Enforce Housekeeping Gate in `checkIn()`: If room `housekeeping_status !== 'CLEAN' && housekeeping_status !== 'INSPECTING'`, throw `HTTP 409 Conflict: Room is currently DIRTY and cannot be assigned without manager override`.
- **File:** Align Billing Test Assertions:
  - Update [`billingFoundation.test.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/invoices/__tests__/billingFoundation.test.js), [`billingStep3.test.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/invoices/__tests__/billingStep3.test.js), and [`billingStep4.test.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/invoices/__tests__/billingStep4.test.js) to reflect that reservation creation automatically posts a room accommodation charge.

#### 3. Frontend Implementation
- **File:** [`Client/src/services/dashboardService.js`](file:///d:/bootcamp/HotelManagement/Client/src/services/dashboardService.js) *(New)*
  - Add `getDashboardMetrics: () => api.get('/hotel/dashboard/metrics')`.
- **File:** [`Client/src/pages/Dashboard/Dashboard.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/pages/Dashboard/Dashboard.jsx)
  - Replace client-side array math in `DashboardMetrics` with live data from `dashboardService.getDashboardMetrics()`.
- **File:** [`Client/src/features/front-office/pages/CheckInOut.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/front-office/pages/CheckInOut.jsx)
  - Add visual prompt modal if receptionist selects a room that is not clean: "Room 102 is currently DIRTY. Require Manager Passkey to assign anyway?"

#### 4. Acceptance Criteria & Tests
- `npm test` in `Server/` runs 44 test suites with **44 PASSED (582/582 tests passing)**.
- Dashboard displays instantaneous, accurate metrics even when tenant database has >10,000 reservations.

---

### PHASE 2: STORAGE OPTIMIZATION, REPORT INTEGRITY & DIRECTORY CLEANUP

**Goal:** Offload Base64 documents to dedicated object storage or GridFS, replace synthetic reporting metrics with dynamic aggregations, and remove dead structural directories.

#### 1. Database & Schemas
- **File:** [`Server/src/database/hotel/schemas/system/fileRecord.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/system/fileRecord.schema.js)
  - Schema stores: `file_name`, `mime_type`, `size_bytes`, `storage_provider` (`'GRIDFS'` or `'S3'`), `storage_key`, `uploaded_by`.
- **File:** [`Server/src/database/hotel/schemas/guests/guestDocument.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/guests/guestDocument.schema.js)
  - Replace `base64_data` with `file_id` (ObjectId referencing `FileRecord`) and `file_url`.

#### 2. Backend Implementation
- **File:** [`Server/src/modules/hotel/files/file.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/files/file.service.js) *(New)*
  - Implement GridFS bucket streaming (`mongoose.mongo.GridFSBucket`) bound to tenant connection.
  - Endpoints: `POST /api/v1/hotel/files/upload` (multipart/form-data via Multer) and `GET /api/v1/hotel/files/:id`.
- **File:** [`Server/src/modules/hotel/reports/report.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/reports/report.service.js)
  - Remove hardcoded 5% Spa revenue calculation (`Math.round(totalRevenue * 0.05)`).
  - Compute booking source distribution dynamically using MongoDB `$group` on `Reservation.booking_source` (`'DIRECT'`, `'WALK_IN'`, `'CORPORATE'`, `'OTA'`).
- **File:** Purge dead placeholder directories:
  - Delete unused directories [`Server/src/modules/hotel/taxesFees`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/taxesFees), [`discounts`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/discounts), [`availability`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/availability), [`roomTypes`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/roomTypes), and 0-byte file [`room.routes.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/rooms/room.routes.js).

#### 3. Frontend Implementation
- **File:** [`Client/src/features/reservations/pages/AddReservation.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/reservations/pages/AddReservation.jsx)
  - Replace `FileReader.readAsDataURL` with async file upload to `POST /api/v1/hotel/files/upload`, attaching returned `file_id` to reservation payload.
- **File:** [`Client/src/features/reports/pages/ReportsPage.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/reports/pages/ReportsPage.jsx)
  - Render dynamically derived booking sources; remove hardcoded Spa indicators.

#### 4. Acceptance Criteria & Tests
- Documents up to 10MB upload smoothly without bloating standard JSON payloads or MongoDB BSON records.
- Reports accurately reflect 100% live transactional data with zero fictitious categories.

---

### PHASE 3: THE FRONT-DESK VISUAL ENGINE — INTERACTIVE GANTT ROOM TAPE CHART

**Goal:** Build the interactive, visual 7/14/30-day room timeline matrix that front-desk receptionists rely on for daily operations.

#### 1. Database & Schemas
- **File:** [`Server/src/database/hotel/schemas/reservations/reservationRoom.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/reservations/reservationRoom.schema.js)
  - Ensure fast range lookups by adding compound index: `{ room_id: 1, check_in_date: 1, check_out_date: 1 }`.

#### 2. Backend Implementation
- **File:** [`Server/src/modules/hotel/rooms/tapeChart.controller.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/rooms/tapeChart.controller.js) *(New)*
  - Route: `GET /api/v1/hotel/rooms/tape-chart?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`.
- **File:** [`Server/src/modules/hotel/rooms/tapeChart.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/rooms/tapeChart.service.js) *(New)*
  - Returns all physical rooms grouped by `RoomType` with their status.
  - Returns all overlapping reservations, active stays, and maintenance blocks in the requested date range.
  - Endpoint: `POST /api/v1/hotel/rooms/swap` (Atomic room transfer mid-stay):
    - Validates target room is vacant and clean.
    - Moves `StayRoom` and reallocates `ReservationRoom`.
    - Automatically updates prior room's `housekeeping_status = 'DIRTY'`.

#### 3. Frontend Implementation
- **File:** [`Client/src/features/occupancy/components/TapeChartTimeline.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/occupancy/components/TapeChartTimeline.jsx) *(New)*
  - Horizontal timeline view showing Room rows on Y-axis and Day columns on X-axis.
  - Interactive features:
    - **Drag-and-Drop:** Drag reservation block to another clean room to swap.
    - **Resize Edge:** Drag end-edge of reservation block to extend or shorten stay.
    - **Click-and-Drag Empty Cells:** Select 3 dates on Room 204 to open `ReservationFormModal` pre-filled with Room 204 and dates.
    - **Right-Click Context Menu:** Quick actions ("Check In", "View Folio", "Move Room", "Mark Out of Order").
- **File:** Mount Tape Chart into [`Occupancy.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/occupancy/pages/Occupancy.jsx) with a view switcher: `[ Matrix Timeline View | Grid Cards View ]`.

#### 4. Acceptance Criteria & Tests
- Receptionist can visualize entire hotel's 14-day occupancy at a glance.
- Swapping rooms or extending stays executes atomically with instant optimistic UI update.

---

### PHASE 4: FRONT-DESK SPEED, CASH INTEGRITY & COMMAND PALETTE

**Goal:** Deliver 30-second walk-in check-in, anti-theft cash drawer shift management with Z-Reports, and a universal `Ctrl+K` command bar.

#### 1. Database & Schemas
- **File:** [`Server/src/database/hotel/schemas/financials/cashShift.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/financials/cashShift.schema.js) *(New)*
  - Fields: `shift_number`, `staff_id`, `opened_at`, `closed_at`, `opening_float`, `cash_collected`, `cash_paid_out`, `expected_cash`, `actual_counted_cash`, `discrepancy_amount`, `notes`, `status` (`'OPEN'`, `'CLOSED'`).

#### 2. Backend Implementation
- **File:** [`Server/src/modules/hotel/financials/cashShift.routes.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/financials/cashShift.routes.js) *(New)*
  - `POST /api/v1/hotel/shifts/open`: Starts shift with opening cash float.
  - `GET /api/v1/hotel/shifts/active`: Retrieves current active drawer status.
  - `POST /api/v1/hotel/shifts/close`: Performs blind cash count, calculates variance, generates immutable shift report.
- **File:** [`Server/src/modules/hotel/search/quickSearch.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/search/quickSearch.service.js) *(New)*
  - Route: `GET /api/v1/hotel/quick-search?q=query`.
  - Searches rooms by number, guests by name/CNIC/phone, and bookings by reference within 50ms using text indexes.

#### 3. Frontend Implementation
- **File:** [`Client/src/components/common/GlobalCommandBar.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/components/common/GlobalCommandBar.jsx) *(New)*
  - Triggered globally via `Cmd+K` or `Ctrl+K`.
  - Instant navigation to rooms, guests, reservations, and common commands ("New Booking", "Open Shift", "Night Audit").
- **File:** [`Client/src/features/front-office/components/ExpressCheckInModal.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/front-office/components/ExpressCheckInModal.jsx) *(New)*
  - 3-step rapid form: (1) Phone/CNIC search, (2) Clean room select, (3) Payment method. Check-in completed in under 30 seconds.
- **File:** [`Client/src/features/payment-billing/pages/ShiftHandover.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/payment-billing/pages/ShiftHandover.jsx) *(New)*
  - Shift dashboard tracking cash in drawer, payment reconciliation, and printable Z-Report.

#### 4. Acceptance Criteria & Tests
- End-of-shift cash drawer discrepancies are flagged immediately with auditable staff signatures.
- Reception staff can access any room or guest record from any screen in under 2 keystrokes.

---

### PHASE 5: FINANCIAL MATURITY — MULTI-FOLIO SPLITTING & NIGHT AUDIT WIZARD

**Goal:** Implement multi-folio ledger management (Corporate Room Charges vs. Guest Personal Expenses) and automated Night Audit business day roll.

#### 1. Database & Schemas
- **File:** [`Server/src/database/hotel/schemas/financials/folio.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/financials/folio.schema.js)
  - Add `folio_type` enum: `['MASTER_COMPANY', 'GUEST_PERSONAL', 'EXTRA_INCIDENTAL']`.
  - Support multiple folios per reservation: `Reservation` references array of `folio_ids`.
- **File:** [`Server/src/database/hotel/schemas/system/nightAuditRun.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/system/nightAuditRun.schema.js) *(New)*
  - Stores: `audit_date`, `executed_by`, `rooms_occupied`, `room_revenue_posted`, `no_shows_cancelled`, `manager_report_snapshot`.

#### 2. Backend Implementation
- **File:** [`Server/src/modules/hotel/folios/folioSplit.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/folios/folioSplit.service.js) *(New)*
  - Endpoints to create secondary folio and move charges between Folio A (Company) and Folio B (Personal).
- **File:** [`Server/src/modules/hotel/nightAudit/nightAudit.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/nightAudit/nightAudit.service.js) *(New)*
  - Route: `POST /api/v1/hotel/night-audit/execute`.
  - Actions performed atomically in transaction:
    1. Posts nightly room rate charge and applicable taxes to all in-house folios.
    2. Flags remaining unarrived confirmed bookings past check-in cutoff as `NO_SHOW` and releases rooms.
    3. Generates the Daily Operations Report (DOR) with ADR, RevPAR, and total revenue.
    4. Advances tenant operational business date.

#### 3. Frontend Implementation
- **File:** [`Client/src/features/payment-billing/pages/FolioDetail.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/payment-billing/pages/FolioDetail.jsx)
  - Tabbed folio view (`Folio A: Company` | `Folio B: Incidentals`) with drag-or-click charge re-assignment.
- **File:** [`Client/src/features/front-office/pages/NightAuditWizard.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/front-office/pages/NightAuditWizard.jsx) *(New)*
  - Step-by-step wizard showing: (1) Pending Arrivals, (2) Open Folios, (3) Room Charges to Post, (4) One-Click Execution & PDF Flash Report download.

#### 4. Acceptance Criteria & Tests
- Corporate stays accurately bill room nights to company invoice while charging minibar/laundry to guest's personal invoice.
- Night audit successfully rolls hotel business day with zero double-charge errors.

---

### PHASE 6: MARKET-BEATERS — PAKISTANI ID OCR & WHATSAPP GUEST EXPERIENCE

**Goal:** Eliminate manual typing with 1-second CNIC/Passport OCR and build an end-to-end WhatsApp automated guest journey.

#### 1. Database & Schemas
- **File:** [`Server/src/database/hotel/schemas/guests/guest.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/guests/guest.schema.js)
  - Add fields: `cnic_number` (format: `XXXXX-XXXXXXX-X`), `father_name`, `date_of_birth`, `whatsapp_consent` (boolean).

#### 2. Backend Implementation
- **File:** [`Server/src/modules/hotel/ocr/idParser.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/ocr/idParser.service.js) *(New)*
  - Route: `POST /api/v1/hotel/ocr/scan-id`.
  - Accepts image, parses Pakistani CNIC format (13 digits, Urdu/English names) and international machine-readable passport zones (MRZ).
- **File:** [`Server/src/modules/hotel/notifications/whatsapp.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/notifications/whatsapp.service.js) *(New)*
  - Webhook integration (via Twilio WhatsApp / Cloud API):
    - Automated booking confirmation PDF + hotel location pin.
    - Pre-check-in digital registration link 2 hours before arrival.
    - Checkout invoice PDF delivery with feedback rating link.
    - **Owner Daily Digest:** Automated 11:30 PM executive summary sent to hotel owner's phone.

#### 3. Frontend Implementation
- **File:** [`Client/src/components/common/IdScanButton.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/components/common/IdScanButton.jsx) *(New)*
  - Camera capture or file drop button integrated into `AddReservation`, `CheckInOut`, and `Guests`.
  - Automatically populates Name, CNIC, DOB, and Address in 1 second.
- **File:** [`Client/src/features/settings/pages/WhatsAppSettings.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/settings/pages/WhatsAppSettings.jsx) *(New)*
  - UI for hotel owner to configure automated WhatsApp message templates and toggle the Owner Daily Digest.

#### 4. Acceptance Criteria & Tests
- Guest registration time at the front desk drops from 4 minutes to under 30 seconds.
- Hotel owner receives daily automated WhatsApp digest reliably every night.

---

### PHASE 7: COMPLIANCE, DIRECT BOOKING ENGINE & REVENUE MAXIMIZER

**Goal:** Provide 1-click police Form-C export, commission-free direct booking engine widget, and dynamic pricing rules.

#### 1. Database & Schemas
- **File:** [`Server/src/database/hotel/schemas/pricing/dynamicRule.schema.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/hotel/schemas/pricing/dynamicRule.schema.js) *(New)*
  - Fields: `rule_name`, `occupancy_threshold` (e.g. 75%), `price_modifier_type` (`'PERCENTAGE'`, `'FIXED'`), `price_modifier_value` (+15%), `is_active`.

#### 2. Backend Implementation
- **File:** [`Server/src/modules/hotel/reports/policeManifest.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/reports/policeManifest.service.js) *(New)*
  - Route: `GET /api/v1/hotel/reports/police-manifest?date=YYYY-MM-DD`.
  - Exports mandated Pakistani police guest registration format (Form C) with CNIC, vehicle number, and stay duration in Excel/PDF.
- **File:** Public Direct Booking API:
  - Mounted under `/api/v1/public/:hotelSlug/availability` and `/api/v1/public/:hotelSlug/book`.
  - Allows commission-free bookings directly from the hotel's website or social media.
- **File:** Dynamic Pricing Rule Engine:
  - Automatically calculates rate adjustments in `checkAvailability()` when hotel occupancy crosses defined thresholds.

#### 3. Frontend Implementation
- **File:** [`Client/src/features/reports/pages/PoliceManifestReport.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/reports/pages/PoliceManifestReport.jsx) *(New)*
  - Dedicated view with 1-click **"Export Daily Police Record"** button.
- **File:** Embeddable Booking Widget:
  - Clean, mobile-friendly booking widget that hotel owners can link on their Google Maps profile or Instagram bio.

#### 4. Acceptance Criteria & Tests
- Police compliance reporting takes 5 seconds per day instead of 2 hours of manual paper logging.
- Direct bookings flow into the PMS reservation calendar without third-party commission fees.

---

## 7. ARCHITECTURAL PRESERVATION MATRIX

The following table dictates what is frozen vs. what is upgraded across the implementation lifecycle:

| Layer / Subsystem | Canonical File Path | Status | Policy |
| :--- | :--- | :--- | :--- |
| **Connection Pooling** | [`Server/src/database/connectionManager.js`](file:///d:/bootcamp/HotelManagement/Server/src/database/connectionManager.js) | **FROZEN** | DO NOT modify connection caching or URI isolation regex. |
| **Tenant Context** | [`Server/src/middlewares/hotelContext.middleware.js`](file:///d:/bootcamp/HotelManagement/Server/src/middlewares/hotelContext.middleware.js) | **FROZEN** | DO NOT allow client-supplied `hotelId` overrides. |
| **Double-Booking Engine**| [`Server/src/modules/hotel/reservations/reservation.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/reservations/reservation.service.js) | **FROZEN** | Keep atomic `Room.active_bookings` date-overlap lock. |
| **Financial Ledger** | [`Server/src/modules/hotel/folios/folio.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/folios/folio.service.js) | **EXTEND** | Maintain immutable ledger; extend with multi-folio support in Phase 5. |
| **Dashboard Metrics** | [`Server/src/modules/hotel/dashboard/dashboard.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/dashboard/dashboard.service.js) | **IMPLEMENT**| Implement native MongoDB aggregation endpoint in Phase 1. |
| **Document Storage** | [`Server/src/modules/hotel/files/file.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/files/file.service.js) | **IMPLEMENT**| Replace Base64 inlining with GridFS / object storage in Phase 2. |
| **Room Tape Chart** | [`Client/src/features/occupancy/components/TapeChartTimeline.jsx`](file:///d:/bootcamp/HotelManagement/Client/src/features/occupancy/components/TapeChartTimeline.jsx) | **IMPLEMENT**| Implement interactive Gantt timeline in Phase 3. |
| **Shift Management** | [`Server/src/modules/hotel/financials/cashShift.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/financials/cashShift.service.js) | **IMPLEMENT**| Add shift cash drawer tracking and Z-Report in Phase 4. |
| **Night Audit** | [`Server/src/modules/hotel/nightAudit/nightAudit.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/nightAudit/nightAudit.service.js) | **IMPLEMENT**| Implement automated date-roll and charge-posting wizard in Phase 5. |
| **ID OCR & WhatsApp** | [`Server/src/modules/hotel/ocr/idParser.service.js`](file:///d:/bootcamp/HotelManagement/Server/src/modules/hotel/ocr/idParser.service.js) | **IMPLEMENT**| Implement CNIC scanner and WhatsApp guest engine in Phase 6. |

---

## 8. MASTER VERDICT & NEXT STEPS

The Explore Pakistan Hotel Management System possesses an exceptionally strong architectural core with genuine multi-tenant physical isolation.

By following this **7-Phase Master Execution Plan**, the platform will systematically:
1. **Stabilize its core** by eliminating legacy test mismatches and client-side metric slicing (Phases 1 & 2).
2. **Elevate front-desk operations** to match global standards with the interactive Tape Chart and Shift Handover management (Phases 3, 4 & 5).
3. **Outperform legacy competitors** through Pakistani CNIC OCR auto-fill, automated WhatsApp guest workflows, and owner mobile digests (Phases 6 & 7).

Whenever execution resumes, prompt:
> **"Read hotel.md and implement Phase [N]."**
The implementation will proceed directly from the explicit contracts, routes, components, and tests defined in that phase.
