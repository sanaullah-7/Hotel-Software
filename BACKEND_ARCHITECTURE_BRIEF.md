# Hotel Management System: Frontend Analysis and Backend Architecture Brief

**Purpose:** Use the current Client UI to define backend domains and API contracts before connecting screens to persistent server data.

**Scope:** The hotel-operations application under `Client/`. The separate `SuperAdmin/` application is not included and needs its own requirements pass. This document describes observed UI behavior and proposes backend design; proposed endpoints are not existing contracts.

## Executive Summary

The Client contains a broad set of hotel workflows, but it is not yet integrated with the server API. Feature stores use browser `localStorage`, in-memory arrays, component state, seeded demo data, or hard-coded report values. There is no shared API client or application `fetch`/Axios usage under `Client/src`.

The server has module directories for many of these domains, but `Server/src/routes/index.js` currently mounts only `/auth`. Room CRUD route code is present in the working tree, but is not mounted and should be considered in progress, not an available frontend contract. Backend work should first establish tenant-aware identity and a canonical set of guest, room, reservation, stay, and financial records. Those records then become the source for front desk, guest profile, billing, operations, and reports.

## Frontend Surface

Routes are registered in `Client/src/routes/AppRoutes.jsx`; the primary sidebar destinations and their tabs are in `Client/src/layouts/DashboardLayout/sidebarConfig.js`.

| Frontend area | Tabs and workflows visible in the UI |
| --- | --- |
| Dashboard and operations | Dashboard; operations alerts; front-office check-in/check-out; guest complaints; registration forms |
| Reservations | All bookings; booking history; cancelled bookings; group bookings; add/edit booking |
| Rooms and occupancy | All rooms; room types; room rate/pricing; add room; occupancy |
| Guests | Guest list and guest profile tabs: Overview, Reservations & Stays, Charges & Payments, Invoices, Requests & Complaints, Documents, Activity Log |
| Housekeeping | Room cleaning; cleaning schedule; inspections; staff assignments; lost and found; inspection checklist |
| Inventory | Stock; guest charges; missing items |
| Rates and billing | Rate plans; discounts; taxes and fees; invoices; payment history; pending payments; refunds |
| Staff / HR | All staff; add staff; leave requests; attendance sheet; today's attendance; employee salary |
| Restaurant and events | Menu; orders; all events; add event; banquet manager |
| Other operations | Car parking; expense, revenue, occupancy, and expense-vs-revenue reports; audit log; hotel profile; policies; Luxuria Assistant |

Some pages are routed but not represented in the sidebar (for example registration forms and housekeeping inspection). There are also legacy route aliases and multiple implementations for some areas. Treat the route inventory as current UI scope, not a final navigation or permissions specification.

## Current Behavior and Backend Implications

### Reservation, room, and stay lifecycle

`Client/src/features/reservations/state/reservationLifecycle.js` and `bookingRules.js` enforce date validity, room availability, booking overlap, check-in eligibility, and check-out consistency in the browser. Check-in links the booking, guest, room, and occupancy record; check-out updates those local records. These rules need to move to server-side commands executed atomically, because client-side checks cannot prevent two users from booking or checking in to the same room concurrently.

There are reservation persistence inconsistencies to resolve during integration: the canonical store uses `hotel_reservations`, while an older add form uses `hotel_all_bookings`. The currently routed add-reservation page's save handler navigates without persisting the form. Do not use either browser key as the API or database contract. Use stable IDs and explicit relationships instead of matching guest names, room numbers, or display labels.

### Guest profile and linked records

The guest profile consolidates reservations/stays, charges, payments, invoices, complaints, documents, and activity. Some current sections infer relationships from names or room numbers. The backend should return records joined by stable guest, reservation, stay, invoice, and room IDs, with pagination for growing histories.

### Billing and financial integrity

`Client/src/features/payment-billing/pages/paymentBillingStore.js` derives paid and due amounts from payment entries and completed refunds, and detects mismatches with invoice snapshots. Preserve this as a server-owned ledger invariant: clients submit payment/refund commands, while the server validates amounts and recomputes invoice totals and status. Never accept a client-provided paid balance as authoritative.

### Authentication and authorization

The current Client restores auth state from `localStorage`; the login flow uses demo credentials and registration stores credentials locally. The dashboard route gate only checks for a local user. Production authentication, hotel membership, role checks, and record-level authorization must be enforced by the API. Hotel/tenant context must come from verified server-side identity, not a caller-supplied `hotelId` that can be changed in the browser.

### Mocked and local-only areas

- Guests, rooms, reservations, occupancy, billing, rate plans, inventory, housekeeping, staff, parking, alerts, registration forms, and hotel profile use local stores or seeded data.
- Restaurant orders/menu and event/banquet data include in-memory or locally seeded stores and are not durable server records.
- Policies are component state; hotel profile and logos use browser storage.
- Expense actions and several revenue/occupancy report values are mock data or hard-coded.
- Audit entries are stored locally and use a fixed demo actor; they are not a trustworthy audit history.
- Luxuria Assistant is labeled demo mode and produces local rule-based responses; it has no backend/model integration.

Do not migrate demo/browser data automatically without a reconciliation plan. Some records have generated IDs, unresolved room/guest links, or duplicated legacy data.

## Proposed Backend Domains

| Domain | Core records | Backend responsibility |
| --- | --- | --- |
| Identity and hotels | Hotel/tenant, user, membership, role/permission, session | Login, refresh/logout, current user and hotel context, access control |
| Rooms and room types | Room type, room, amenity, operational status | CRUD, unique room number within hotel, filters and pagination, status changes |
| Guests | Guest, contact details, document metadata, preferences | Search, profile CRUD, duplicate handling, consent and access to sensitive documents |
| Reservations | Reservation, guest links, room assignment, group, status history | Availability, create/update/cancel, date and capacity validation, audit trail |
| Stays / front office | Stay/check-in/out, occupancy, registration, complaint/request, alert | Atomic check-in/out, operational holds, guest requests, registration and alert lifecycle |
| Rates and billing | Rate plan, date rules, discount, tax/fee, folio, charge, invoice, line item, payment, refund | Server calculations, immutable financial entries, approval/status workflows and reconciliation |
| Housekeeping / maintenance | Task, schedule, assignment, inspection, checklist, lost-and-found item, maintenance ticket | Room readiness, task assignment and completion, independent room operational status |
| Inventory | Item/SKU, stock location, stock movement, missing-item incident | Auditable adjustments and counts; link guest-chargeable loss/consumption to folio |
| Workforce | Employee, leave request, attendance entry, payroll/salary record | HR lifecycle and strict permissions for personal and salary data |
| Restaurant | Menu item/category, order, order line, fulfillment status | Order lifecycle and optional posting of charges to a guest folio/stay |
| Events / banquets | Event, venue, schedule, package, BEO, deposit, event charge | Venue availability, event lifecycle, deposits and links to billing |
| Parking | Parking space, vehicle, parking stay, charge | Space availability, vehicle/guest linkage, check-in/out and charge posting |
| Settings, audit, reports | Hotel profile, policy, audit event, report query/expense | Persist configuration; append-only actor-attributed audit events; reports over canonical data |

## Suggested API Shape

Keep a versioned base path consistent with the server's current `/api/v1` mount. Names below are a starting point for discussion, not a requirement to expose every resource as generic CRUD.

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/rooms?status=&typeId=&page=&limit=
POST   /api/v1/rooms
GET    /api/v1/rooms/:roomId
PATCH  /api/v1/rooms/:roomId
DELETE /api/v1/rooms/:roomId                 # deactivate/archive, do not erase history
GET    /api/v1/room-types
GET    /api/v1/availability?checkIn=&checkOut=&guests=

GET    /api/v1/guests?search=&page=&limit=
POST   /api/v1/guests
GET    /api/v1/guests/:guestId                # profile summary with linked-record IDs
GET    /api/v1/guests/:guestId/reservations
GET    /api/v1/guests/:guestId/folio
GET    /api/v1/guests/:guestId/activity

GET    /api/v1/reservations?status=&from=&to=&search=&page=&limit=
POST   /api/v1/reservations
GET    /api/v1/reservations/:reservationId
PATCH  /api/v1/reservations/:reservationId
POST   /api/v1/reservations/:reservationId/cancel
POST   /api/v1/reservations/:reservationId/check-in
POST   /api/v1/reservations/:reservationId/check-out
GET    /api/v1/occupancy?date=

GET    /api/v1/folios/:folioId
POST   /api/v1/folios/:folioId/charges
POST   /api/v1/invoices
POST   /api/v1/invoices/:invoiceId/payments
POST   /api/v1/payments/:paymentId/refunds
GET    /api/v1/invoices?status=&guestId=&page=&limit=
```

Other domains should follow the same tenant-scoped and paginated conventions, with explicit business commands for transitions (for example, assign/complete housekeeping task, approve leave, fulfill restaurant order, or close an event) instead of trusting arbitrary status edits.

## Core Data Relationships and Invariants

- Every operational record belongs to a hotel/tenant. Enforce tenant scope in repository queries and authorization middleware.
- Reservation references one or more guests and assigned rooms, with check-in/out dates, guest count, status, price snapshot, and status history. Group bookings need an explicit parent/group relationship.
- A stay/occupancy record references the reservation, guest, and room. Reservation status and housekeeping status are separate concepts; a dirty room is not bookable merely because no guest is checked in.
- Availability must account for overlapping active reservations and operational room holds. Validate and assign within a transaction or with an equivalent concurrency-safe constraint.
- Folios contain charges; invoices snapshot itemized amounts and currency. Payments and refunds are separate ledger records. Derive paid, refunded, and due amounts on the server and make financial history append-only.
- Room, inventory, invoice, payment, and status mutations should record actor and timestamp. Audit records should be append-only and tenant-scoped.
- Add idempotency or duplicate-submission protection for reservation creation, check-in/out, payment, refund, and other commands with side effects.
- Define currency, date/timezone, rounding, status enums, soft-delete rules, and retention policies before frontend integration.

## Current Server Readiness

- `Server/src/app.js` mounts routes under `/api/v1`; `Server/src/routes/index.js` currently mounts only `/auth`.
- Server module directories already exist for auth, hotels, bookings, check-in/out, guests, housekeeping, inventory, invoices, payments, refunds, rooms, room types, services/orders, staff, settings, and related areas. A folder's presence does not confirm a complete or mounted API; review each module before wiring the Client.
- The working tree contains in-progress room CRUD files. `Server/src/modules/rooms/room.routes.js` defines CRUD routes but is not mounted in `Server/src/routes/index.js`. It currently imports handlers from `room.constant.js`, which only exports room status constants, so the route/controller connection must be completed and tested before treating those routes as functional.
- `Server/src/modules/rooms/room.repository.js` scopes reads and updates by `hotelId` and returns paginated list results, but the frontend/API integration and trusted tenant context still need to be designed.

## Recommended Delivery Order

1. **API foundation:** Agree on authentication/session strategy, tenant membership, role/permission model, validation/error envelope, pagination, logging, and API client conventions.
2. **Canonical room and guest data:** Finish and mount room/room-type APIs; establish guest IDs, filters, and stable relationships.
3. **Reservation and stay lifecycle:** Implement availability and reservation commands; move check-in/out rules into atomic server operations; connect occupancy and front-office UI.
4. **Billing ledger:** Implement folios, invoice lines, payments, refunds, authorization, idempotency, and reconciliation before connecting payment tabs.
5. **Guest 360 and operational modules:** Link complaints, registration, documents, housekeeping, inventory, parking, restaurant, and events to canonical guest/stay/room/folio records.
6. **HR, settings, audit, reports, assistant:** Add permissioned HR/payroll, persisted hotel policies/profile, server audit history, and reports derived from authoritative data. Integrate an assistant only after its data access and privacy boundaries are defined.
7. **Frontend migration:** Replace local stores behind feature-level service/repository interfaces; add loading, empty, validation, conflict, and failure states; stop treating browser storage as shared business state.

## Decisions Needed Before Implementation

- Is the product single-hotel or multi-tenant, and can a user belong to multiple hotels?
- Which roles and field-level permissions are required for front desk, finance, HR/payroll, housekeeping, inventory, and management?
- Which payment providers and refund approval rules are in scope? Are payments captured by this system or recorded as external transactions?
- Are restaurant and event charges posted to a guest folio? How are group bookings and shared rooms priced?
- What timezone, currency, tax/fee rules, invoice numbering, and cancellation/refund policies apply per hotel?
- Which current local/demo records should be discarded, imported, or manually reconciled during cutover?
- Should the `SuperAdmin/` UI be included in the same backend, with separate platform-level tenant-management permissions?

## Code References

- Route inventory: `Client/src/routes/AppRoutes.jsx`
- Sidebar tabs: `Client/src/layouts/DashboardLayout/sidebarConfig.js`
- Reservation lifecycle rules: `Client/src/features/reservations/state/reservationLifecycle.js`
- Billing ledger calculations: `Client/src/features/payment-billing/pages/paymentBillingStore.js`
- Browser-based authentication state: `Client/src/context/AuthContext.jsx`
- API mount: `Server/src/app.js` and `Server/src/routes/index.js`
- Room routes and repository in progress: `Server/src/modules/rooms/room.routes.js` and `Server/src/modules/rooms/room.repository.js`