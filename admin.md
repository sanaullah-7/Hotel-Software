# Explore Pakistan — Super Admin Architecture & Implementation Master Plan
**Platform:** Explore Pakistan Hotel Management System  
**Architecture:** Multi-Tenant SaaS — Platform Control Plane (`hotel_platform`) + Physical Database-Per-Tenant (`hotel_<hotelId>`)  
**Authority:** Principal Software Architect, MongoDB Architect, Multi-Tenant SaaS Architect, Security Architect, Identity/Auth Architect, Reliability Engineer, Distributed Systems Engineer, Financial Systems Architect, Database Integrity Engineer, API Contract Architect, Disaster Recovery / Saga Architect  
**Document Status:** PERMANENT AUTHORITATIVE ARCHITECTURAL SPECIFICATION & PHASE EXECUTION MASTER PLAN  
**File Path:** `admin.md`

---

## 1. DOCUMENT AUTHORITY & CHANGE CONTROL

This document is the **single permanent source of truth** for the Super Admin platform control plane, tenant data plane isolation, and all future implementation phases of the Explore Pakistan Hotel Management SaaS.

### 1.1 Architectural Freeze & Change Control Rule
Once written, the architectural principles, lifecycle models, authorization gates, database indexing constraints, cross-database saga boundaries, and security invariants in this document are **frozen**. 
Any future modification to:
* Lifecycle state machines (`Account`, `Hotel`, `Subscription`, `Tenant Provisioning`)
* Cross-lifecycle invariants or decoupling rules
* Multi-tenant physical database isolation (`hotel_<hotelId>`)
* Authorization gate ordering or permission boundaries
* MongoDB partial unique index definitions or multi-document transaction boundaries
* Audit immutability or sensitive data redaction policies
* Financial agreement immutability or supersession semantics

**MUST be processed as a formal Architectural Decision Record (ADR)**. It cannot be modified informally in code. The ADR must document the affected invariant, schema migration requirements, security implications, backward compatibility impact, test matrix updates, and acceptance criteria updates.

### 1.2 Implementation Philosophy: Preservation Over Rebuild
The Explore Pakistan codebase contains substantial working functionality across `Server/`, `SuperAdmin/`, and `Client/`.
The governing implementation principle across all phases is:
$$\textbf{AUDIT} \longrightarrow \textbf{PRESERVE WORKING CODE} \longrightarrow \textbf{FIX REAL DEFECTS ONLY} \longrightarrow \textbf{ADD MISSING CAPABILITIES} \longrightarrow \textbf{TEST \& VERIFY}$$

* **DO NOT rebuild working features** simply for stylistic preference or cosmetic refactoring.
* **DO NOT create duplicate controllers, services, routes, or components** when existing ones can be extended.
* **MODIFY existing code ONLY** when there is a demonstrable architectural violation, security vulnerability, data integrity flaw, race condition, or broken contract.

---

## 2. SYSTEM OVERVIEW & ARCHITECTURAL PRINCIPLES

### 2.1 Topology
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PLATFORM CONTROL PLANE                             │
│                     MongoDB Database: [hotel_platform]                      │
│                                                                             │
│  Collections:                                                               │
│   • accounts                    • hotels (applications & operational reg)   │
│   • subscriptions               • platform_settings                         │
│   • platform_audit_logs         • platform_transactions                     │
│   • support_tickets             • support_ticket_messages                   │
│   • notifications                                                           │
│                                                                             │
│  Authority: Global control plane, commercial agreements, tenant registry    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      Cross-Database Provisioning Saga
                      & Request-Time Entitlement Gate
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TENANT DATA PLANE                                │
│                   Independent MongoDB Database-Per-Hotel                    │
│               Database Name Pattern: [hotel_<hotelId>]                      │
│                                                                             │
│  Collections per Tenant:                                                    │
│   • _provisioning_marker (audit)• rooms & room_types                        │
│   • _provisioning_attempts      • reservations & folios                     │
│   • guests & payments           • housekeeping                              │
│   • hotel_profiles              • tenant_settings                           │
│   • staff_profiles              • tenant_departments                        │
│                                                                             │
│  Physical Isolation: Strict 1:1 database isolation per hotel tenant         │
│  Shared Operational Collections: PROHIBITED                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Architectural Principles
1. **Physical Tenant Isolation:** Zero operational PMS collections are co-mingled in a shared database. Physical isolation is maintained 1:1 per hotel in `hotel_<hotelId>`.
2. **Deterministic Database Naming:** Tenant database names are derived exclusively from platform-verified identity: `hotel_<hotelId>`. Client input cannot specify database names.
3. **Control-Plane Authority:** Hotel lifecycle, ownership, subscription lifecycle, provisioning authority, and platform security remain controlled by the platform database `hotel_platform`.
4. **Tenant Business Authority:** Hotel operational PMS data resides strictly inside that hotel's dedicated tenant database.
5. **No Distributed Two-Phase Commit (2PC):** Cross-database operations execute via a **Recoverable Cross-Database Provisioning Saga** paired with atomic, local platform transactions. MongoDB transactions operate strictly within single database boundaries.
6. **Backend Authority:** Frontend state is never the authority for authorization, lifecycle states, entitlement, or ownership.
7. **Fail-Closed Entitlement:** Missing, corrupted, or unverified commercial subscription records result in immediate operational mutation lockdown (`HTTP 403 Forbidden`).

---

## 3. DOMAIN LIFECYCLE STATE MACHINES

### 3.1 Account Lifecycle (Identity Domain)
```
       ┌────────────────────────┐
       │   PENDING (Identity)   │
       └───────────┬────────────┘
                   │ Identity Verification Completed (Email OTP / Link)
                   ▼
       ┌────────────────────────┐      Security Suspension / Admin Lock
       │   ACTIVE (Identity)    ├──────────────────────────────────────────┐
       └───────────┬────────────┘                                          │
                   │ Account Suspension                                    │
                   ▼                                                       ▼
       ┌────────────────────────┐      Administrative Reinstatement   ┌──────────┐
       │       SUSPENDED        ├────────────────────────────────────►│  ACTIVE  │
       └───────────┬────────────┘                                     └──────────┘
                   │ Permanent Fraud / Legal Ban
                   ▼
       ┌────────────────────────┐
       │    BANNED (Terminal)   │
       └───────────┬────────────┘
```

#### Authoritative Rules:
* `PENDING`: Identity unverified. Zero access to platform or tenant APIs.
* `ACTIVE`: Identity verified. Permitted to authenticate. Tenant PMS access additionally requires target-hotel ownership or staff membership.
* `SUSPENDED`: Identity locked. Active sessions revoked via `tokenVersion++`. Authentication blocked.
* `BANNED`: Terminal lockout. Credentials permanently revoked.
* **Decoupling Invariant:** Hotel approval **never** activates an account. Hotel rejection, suspension, or archival **never** deactivates or suspends an account. Multi-property ownership ($1:N$) is natively supported.

---

### 3.2 Hotel Lifecycle (Property Application & Operational Domain)
```
       ┌─────────────┐
       │  SUBMITTED  ├──────────────────────────────────┐
       └──────┬──────┘                                  │
              │ Assign Reviewer                         │
              ▼                                         │
       ┌──────────────┐                                 │
       │ UNDER_REVIEW ├─────────────────────────────────┤
       └──────┬───────┘                                 │
              │                                         │
   Deficiency │ Action Required                         │ Direct Rejection
    Requested │                                         │
              ▼                                         │
     ┌─────────────────┐   Resubmit (Opaque Token)      │
     │ ACTION_REQUIRED ├────────────────────────────────┤
     └─────────────────┘                                │
              │ Resubmitted                             │
              ▼                                         ▼
       ┌─────────────┐                          ┌────────────┐
       │  SUBMITTED  │                          │  REJECTED  │ (Releases Name)
       └──────┬──────┘                          └────────────┘
              │ Approve & Provision
              ▼
       ┌──────────────┐   Rollback on Safe Cleanup
       │ PROVISIONING ├─────────────────────────► UNDER_REVIEW
       └──────┬───────┘   (Quarantine retains PROVISIONING)
              │ Phase D Multi-Doc Commit
              ▼
       ┌──────────────┐
       │    ACTIVE    │ (Requires Exactly 1 Current Subscription Agreement)
       └──────┬───────┘
              │
    Suspended │ Reinstated
              ▼
       ┌──────────────┐
       │  SUSPENDED   │ (Blocks Tenant Staff Gateway)
       └──────┬───────┘
              │ Decommission
              ▼
       ┌──────────────┐
       │   ARCHIVED   │ (Terminal; Evicted from Persistent Pool; Retains Name)
       └──────────────┘
```

#### Authoritative Rules:
* `SUBMITTED → UNDER_REVIEW`: Reviewer claimed.
* `UNDER_REVIEW → ACTION_REQUIRED`: Deficiency flagged. Issues 256-bit capability token; sets `actionTokenHash`.
* `ACTION_REQUIRED → SUBMITTED`: Resubmission consumes capability token atomically via `findOneAndUpdate`.
* `SUBMITTED / UNDER_REVIEW → REJECTED`: Rejection drops document from the partial unique index, immediately releasing normalized name for new applications. Terminal historical record.
* `SUBMITTED / UNDER_REVIEW → PROVISIONING`: Approval triggers Phase A saga reservation. Requires owner `Account.status === ACTIVE`.
* `PROVISIONING → UNDER_REVIEW`: Permitted **only** after verified safe cleanup of tenant database.
* `PROVISIONING → ACTIVE`: Committed inside Phase D platform transaction. Stamps immutable `approvedAt`.
* `ACTIVE → SUSPENDED` / `SUSPENDED → ACTIVE`: Gateway blocks/unblocks tenant staff. Does not alter account `tokenVersion`.
* `SUSPENDED → ARCHIVED`: Permanent property offboarding. Evicted from persistent connection pool. Retains name reservation. Terminal state.

---

### 3.3 Subscription Lifecycle (Commercial Entitlement Domain)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIPTION LIFECYCLE STATES                         │
│                                                                             │
│   ACTIVE ──────────► EXPIRING ──────────► GRACE_PERIOD ──────────► EXPIRED  │
│     │                   │                      │                     │      │
│     └───────────────────┴──────────────────────┴─────────────────────┘      │
│                                   │                                         │
│                                   ▼ (Explicit Administrative/Commercial)     │
│                              CANCELLED (Terminal & Immutable)               │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Authoritative Rules:
* `isCurrent: true`: Designates the hotel's current commercial agreement record used as the authoritative agreement for entitlement evaluation. It does **not** mean currently entitled.
* `isCurrent: false`: Designates historical or superseded agreements. It does **never** imply `CANCELLED`.
* **The "Exactly One" Invariant:** An `ACTIVE` operational hotel **must possess exactly one** Subscription agreement where `isCurrent === true`. Non-operational states permit zero.
* **Date Contract (UTC Half-Open `[startDate, endDate)`):**
  $$\begin{array}{lll}
  \text{If } \text{current.status} = \text{'CANCELLED'} & \implies \mathbf{CANCELLED} & (\text{Operational Access Blocked: HTTP 403}) \\
  \text{Else if } \text{now} < \text{startDate} & \implies \mathbf{UNACTIVATED} & (\text{Fail Closed: HTTP 403}) \\
  \text{Else if } \text{startDate} \le \text{now} < (\text{endDate} - \text{expiringWindow}) & \implies \mathbf{ACTIVE} & (\text{Full Operational Read/Write}) \\
  \text{Else if } (\text{endDate} - \text{expiringWindow}) \le \text{now} < \text{endDate} & \implies \mathbf{EXPIRING} & (\text{Full Operational Read/Write + Warning}) \\
  \text{Else if } \text{endDate} \le \text{now} < (\text{endDate} + \text{gracePeriod}) & \implies \mathbf{GRACE\_PERIOD} & (\text{Full Operational Read/Write + Overdue Notice}) \\
  \text{Else if } \text{now} \ge (\text{endDate} + \text{gracePeriod}) & \implies \mathbf{EXPIRED} & (\mathbf{Strict\ Read-Only\ PMS:\ HTTP\ 403\ on\ Mutations})
  \end{array}$$
* **Scheduled Cancellation (`cancelAtPeriodEnd = true`):** Controls renewal generation only. The agreement completes its full lifecycle through `GRACE_PERIOD` and `EXPIRED`.
* **Immediate Cancellation:** Sets `status = 'CANCELLED'`, `cancelledAt = now`. Retains `isCurrent = true` until superseded by a replacement agreement. Immediately blocks all operational tenant access.

---

## 4. CROSS-LIFECYCLE INVARIANTS & DECOUPLING MATRIX

| Domain Interaction | Invariant Coupling Rule | Architectural Rationale & Enforcement |
| :--- | :--- | :--- |
| **Account ↔ Hotel** | **Completely Decoupled.** $Account.status \neq Hotel.status$. | Hotel rejection, suspension, or archival never alters Account status. Account suspension never alters Hotel status. Owner suspension blocks owner identity; other authorized staff continue PMS operations. |
| **Account ↔ Tenant DB** | **Mediated via Ownership / Membership.** | Account has zero direct database credentials. Access requires verified ownership (`Hotel.ownerId === Account._id`) or verified active staff record in tenant `staff_profiles`. |
| **Account ↔ Subscription** | **Completely Decoupled.** | Subscription expiry or cancellation never alters Account status. |
| **Hotel ↔ Subscription** | **Independent Lifecycles.** | An `ACTIVE` hotel requires exactly one current agreement. Subscription expiry makes PMS read-only; it never suspends the hotel. Hotel suspension blocks access; it never cancels the subscription. |
| **Hotel ↔ Tenant DB** | **Strict 1:1 Mapping.** | Tenant database is named `hotel_<hotelId>` and must contain matching `_provisioning_marker`. |
| **Subscription ↔ Tenant DB**| **Entitlement Mediation.** | Subscription state mediates operational write capabilities within the tenant DB via gateway middleware. |
| **Provisioning ↔ All** | **Saga Preconditions.** | Phase A and Phase D require `owner.status === ACTIVE`. Phase D commits hotel activation and initial subscription atomically. |

---

## 5. AUTHORIZATION & TENANT GATEWAY PIPELINE

Every incoming request targeting tenant PMS operational routes (`/api/v1/hotel/*`) passes through an eight-gate authorization pipeline:

```
[Incoming Request: /api/v1/hotel/*]
                │
                ▼
[1. Authentication Gate] ──► Validates JWT signature; checks Account.tokenVersion
                │
                ▼
[2. Account Status Gate] ──► Asserts Account.status === 'ACTIVE'
                │
                ▼
[3. Target Hotel Resolution] ──► Resolves hotelId from verified route parameter
                │
                ▼
[4. Target Hotel Lifecycle Gate] ──► Asserts Hotel.status === 'ACTIVE'
                │
                ▼
[5. Tenant Maintenance Mode Gate] ──► If maintenance enabled, return HTTP 503
                │
                ▼
[6. Membership / Ownership Gate] ──► Verifies Hotel.ownerId === Account._id OR
                │                   Account._id exists in tenant staff_profiles
                ▼
[7. Subscription Entitlement Gate] ──► If EXPIRED, block mutations (HTTP 403)
                │
                ▼
[8. Tenant RBAC Permission Gate] ──► Validates granular permissions on endpoint action
                │
                ▼
[Tenant Controller Execution]
```

### 5.1 Platform Admin Tenant Inspection Gateway
Platform Admin inspection is exposed exclusively on `/api/v1/platform/tenants/:hotelId/inspect/*`.
* **Read Inspection:** Requires authenticated `PLATFORM_ADMIN` and capability `TENANT_INSPECTION_READ`. Connects via dedicated MongoDB read-only credentials (`read` role only). Permitted on `ACTIVE`, `SUSPENDED`, and `ARCHIVED` hotels.
* **Archived Isolation:** Archived tenant connections are transient, hold bounded lifetimes, and are closed immediately. Purged databases return `HTTP 410 TENANT_DATA_PURGED`.
* **Emergency Mutation:** Requires `PLATFORM_ADMIN` + capability `TENANT_EMERGENCY_MUTATE` + target in `ACTIVE` or `SUSPENDED` + route in immutable allowlist + header `X-Platform-Admin-Reason` ($\ge 10$ chars) + CRITICAL audit log with before/after diff. Document-level optimistic locking enforced. **Mutations on ARCHIVED hotels are strictly prohibited.**

---

## 6. MONGODB INDEX & DATABASE CONTRACT

### 6.1 Platform Database Indexes (`hotel_platform`)
All partial index definitions utilize engine-supported operators (`$in` or boolean equality; `$nin` and `$ne` are structurally excluded):

```javascript
// 1. HARD INVARIANT: Unique property name per city across all non-rejected lifecycles
db.hotels.createIndex(
  { normalized_city: 1, normalized_name: 1 },
  {
    unique: true,
    name: "idx_hotels_unique_city_property_name",
    partialFilterExpression: {
      status: {
        $in: [
          "SUBMITTED",
          "UNDER_REVIEW",
          "ACTION_REQUIRED",
          "PROVISIONING",
          "ACTIVE",
          "SUSPENDED",
          "ARCHIVED"
        ]
      }
    }
  }
);

// 2. HARD INVARIANT: Global uniqueness for human identities
db.accounts.createIndex(
  { normalizedEmail: 1 },
  { unique: true, name: "idx_accounts_normalized_email_unique" }
);

// 3. HARD INVARIANT: AT MOST ONE current subscription per hotel
db.subscriptions.createIndex(
  { hotelId: 1, isCurrent: 1 },
  {
    unique: true,
    name: "idx_subscriptions_single_current_per_hotel",
    partialFilterExpression: { isCurrent: true }
  }
);

// 4. HARD INVARIANT: Operation-scoped subscription idempotency
db.subscriptions.createIndex(
  { hotelId: 1, operationType: 1, idempotencyKey: 1 },
  {
    unique: true,
    name: "idx_subscriptions_idempotency_unique",
    partialFilterExpression: {
      idempotencyKey: { $type: "string" }
    }
  }
);

// 5. PERFORMANCE: Audit log query by target and severity
db.platform_audit_logs.createIndex({ targetId: 1, timestamp: -1 }, { name: "idx_audit_target_timestamp" });
db.platform_audit_logs.createIndex({ severity: 1, timestamp: -1 }, { name: "idx_audit_severity_timestamp" });
```

### 6.2 Tenant Database Markers & Attempt Telemetry (`hotel_<hotelId>`)
* **Permanent Ownership Marker (`_provisioning_marker`):**
  ```javascript
  {
    _id: "TENANT_OWNERSHIP_MARKER",
    hotelId: ObjectId("..."),
    tenantProvisioningId: "...",
    databaseName: "hotel_...",
    createdAt: ISODate("..."),
    seedVersion: "1.0.0",
    seedManifestVersion: "1.0.0"
  }
  ```
  Immutable. Created once during initial provisioning; never replaced or overwritten on retries.
* **Attempt Telemetry (`_provisioning_attempts`):**
  Unique index on `{ provisioningAttemptId: 1 }`. Records worker attempt executions, heartbeats, and status (`IN_PROGRESS`, `COMPLETED`, `FAILED`, `STALE`, `QUARANTINED`).

---

## 7. PROVISIONING SAGA & INFRASTRUCTURE RECOVERY

### 7.1 Saga Execution Pipeline
```
Phase A: Platform Reservation
  • Precondition: owner Account.status === 'ACTIVE'
  • Atomic update: SUBMITTED/UNDER_REVIEW -> PROVISIONING
  • Generates tenantProvisioningId (stable) & currentProvisioningAttemptId (volatile)

Phase B: Tenant Database Initialization
  • Connect to hotel_<hotelId>
  • Write permanent ownership marker (_provisioning_marker)
  • Append attempt telemetry record (_provisioning_attempts)
  • Idempotently seed baseline collections strictly per approved Seed Manifest

Phase C: Verification Engine & Worker Fencing
  • Verify database name strictly matches hotel_<hotelId>
  • Verify marker matches expected hotelId and tenantProvisioningId
  • Assert workerAttemptId === Hotel.currentProvisioningAttemptId
  • Assert zero human records or collections outside the Seed Manifest

Phase D: Platform Activation Transaction
  • Prerequisite: MongoDB Replica Set or Sharded Cluster
  • Multi-document transaction session on hotel_platform
  • Re-verify owner Account.status === 'ACTIVE' (Abort if SUSPENDED/BANNED)
  • Commit Hotel.status = 'ACTIVE', approvedAt = approvedAt || now
  • Create initial current Subscription (isCurrent = true, unique idempotencyKey)
```

### 7.2 Baseline Seed Manifest Allowlist
Approved collections during provisioning: `_provisioning_marker`, `_provisioning_attempts`, `hotel_profiles`, `roles`, `tenant_settings`, `room_types`, `staff_profiles` (initial admin binding). Any collection or document created outside this manifest is classified as **human/operational data**.

### 7.3 Safe Deletion vs. Quarantine Predicate
Automatic database deletion (`db.dropDatabase()`) during rollback is permitted **only** when all fifteen (15) criteria are proven:
1. Database name strictly equals `hotel_<hotelId>`.
2. Marker `_provisioning_marker` exists.
3. Marker matches expected `hotelId`.
4. Marker matches expected `tenantProvisioningId`.
5. `Hotel.status === 'PROVISIONING'`.
6. Worker attempt matches `Hotel.currentProvisioningAttemptId`.
7. Attempt is definitively failed.
8. No newer attempt exists.
9. Worker is demonstrably active and fenced.
10. `Hotel.status !== 'ACTIVE'`.
11. Database contains **only** approved baseline seed artifacts.
12. Zero human-created tenant records exist.
13. Zero operational records exist (zero documents in `reservations`, `folios`, `guests`).
14. Ownership is unambiguous.
15. Platform state explicitly authorizes rollback.

**Quarantine Invariant:** If any criterion cannot be proven, **DATABASE DROP IS STRICTLY FORBIDDEN**. The system sets `provisioning.recoveryState = 'QUARANTINED'` and `requiresManualReconciliation = true`. `Hotel.status` remains `PROVISIONING`. Automatic re-approval is blocked until an administrator investigates.

---

## 8. SECURITY & AUDIT ARCHITECTURE

### 8.1 Lossless 64-Bit `tokenVersion`
* **Database Storage:** BSON `Long` (`Int64`). Initialized to `Long(1)`.
* **Application Layer:** Managed via native `BigInt` / `mongodb.Long`. Increments execute atomically via `$inc: { tokenVersion: Long.fromInt(1) }`.
* **JWT Claims:** Serialized losslessly as a decimal string (`"1"`). Compared via `BigInt(jwt.tokenVersion) === BigInt(account.tokenVersion)`.
* **Overflow Protection:** If `tokenVersion` reaches $2^{63}-1$, the system fails closed, blocks increments, and raises a critical security alert.
* **Triggers:** Incremented on password reset, password change, account suspension, MFA reset, and refresh-token reuse. Never decremented or reset during ordinary operations.

### 8.2 Capability Token URL Hardening
* Generated via `crypto.randomBytes(32)` (256-bit entropy).
* Persisted strictly as `SHA-256(rawToken)` in `Hotel.intake.actionTokenHash`.
* Consumed atomically via conditional `findOneAndUpdate`. Viewing does not consume the token.
* Intake routes enforce `Referrer-Policy: no-referrer`, scrub tokens from URL history via `window.history.replaceState()`, exclude third-party scripts, and redact query parameters from access logs.
* Possesses zero login rights, cannot activate accounts, and grants zero access to PMS APIs.

### 8.3 Immutable, Bounded Audit Architecture
* **Metadata Ceiling:** Audit metadata is strictly capped at $16\text{ KB}$.
* **Recursive Redaction Policy:** Recursively scrubs: `password`, `token`, `accessToken`, `refreshToken`, `actionToken`, `mfaSecret`, `otp`, `authorization`, `cookie`, `cardNumber`, `cvv`, `pan`, `accountNumber`, raw identity document blobs.
* **Database RBAC:** Platform application connects using credentials partitioned into:
  * **Audit Writer:** Holds strictly `insert` privilege on `platform_audit_logs`. `update`, `delete`, and `drop` are structurally denied.
  * **Audit Reader:** Holds strictly `find` privilege.
* **Durability Classification:** Security-critical administrative mutations fail closed if audit cannot be persisted. Local in-memory buffers are classified as best-effort operational telemetry, not durable audit.

---

## 9. COMPLETE SYSTEM INVENTORY & EXISTING FEATURE MATRIX

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ MASTER FEATURE & REPOSITORY INVENTORY MATRIX                                                                           │
├────────────────────┬──────────────────┬───────────────────────┬──────────────────────────┬─────────────────────────────┤
│ Module             │ Repository Status│ Frontend Component    │ Backend Endpoint         │ Classification & Action     │
├────────────────────┼──────────────────┼───────────────────────┼──────────────────────────┼─────────────────────────────┤
│ 1. Authentication  │ EXISTING — PARTIAL│ SuperAdmin/Login.jsx  │ /api/v1/auth/login       │ EXISTING — FIX (MFA, Long)  │
│ 2. Dashboard       │ EXISTING — KEEP  │ Dashboard/Dashboard   │ /api/v1/hotels/stats     │ EXISTING — KEEP             │
│ 3. Applications    │ EXISTING — PARTIAL│ Approvals/Approvels   │ /api/v1/hotels (status)  │ EXISTING — FIX (Decouple)   │
│ 4. Active Hotels   │ EXISTING — KEEP  │ Hotels/Hotels.jsx     │ /api/v1/hotels           │ EXISTING — KEEP             │
│ 5. Users / Identity│ EXISTING — PARTIAL│ Users/User.jsx        │ /api/v1/users            │ EXISTING — FIX (normalized) │
│ 6. Subscriptions   │ EXISTING — PARTIAL│ Subscriptions/Subs    │ /api/v1/subscriptions    │ EXISTING — FIX (isCurrent)  │
│ 7. Finance         │ EXISTING — PARTIAL│ Revenue/Revenue.jsx   │ /api/v1/finance          │ EXISTING — COMPLETE (Phase6)│
│ 8. Audit Logs      │ EXISTING — PARTIAL│ AuditLogs/AuditLogs   │ /api/v1/audit-logs       │ EXISTING — FIX (Redaction)  │
│ 9. Notifications   │ EXISTING — KEEP  │ Notifications/Notifs  │ /api/v1/notifications    │ EXISTING — KEEP             │
│ 10. Support        │ EXISTING — KEEP  │ Support/SupportTicket │ /api/v1/support (mock)   │ EXISTING — COMPLETE (Phase8)│
│ 11. Settings       │ EXISTING — PARTIAL│ Settings/Settings.jsx │ /api/v1/settings (mock)  │ EXISTING — COMPLETE (Phase9)│
│ 12. Admin Profile  │ EXISTING — KEEP  │ Profile/Profile.jsx   │ /api/v1/profile (mock)   │ EXISTING — KEEP             │
│ 13. Tenant Inspect │ MISSING          │ None                  │ None                     │ MISSING — BUILD (Phase 10)  │
│ 14. Provisioning   │ CONFLICTING      │ None (Direct approve) │ /api/v1/provisioning     │ CONFLICTING — FIX (Phase 4) │
│ 15. Connection Mgr │ EXISTING — PARTIAL│ None (Backend only)   │ connectionManager.js     │ EXISTING — FIX (LRU, Bound) │
│ 16. RBAC Gateway   │ EXISTING — PARTIAL│ ProtectedRoutes.jsx   │ hotelContext.middleware  │ EXISTING — FIX (8-Gate pipe)│
└────────────────────┴──────────────────┴───────────────────────┴──────────────────────────┴─────────────────────────────┘
```

---

## 10. PHASE DEPENDENCY GRAPH

```
[Phase 1: Foundation & Identity Security]
                   │
                   ▼
[Phase 2: Hotel Application Intake & Action-Required Gateway]
                   │
                   ▼
[Phase 3: Administrative Review & Governance]
                   │
                   ▼
[Phase 4: Recoverable Provisioning Saga & Tenant Isolation]
                   │
                   ▼
[Phase 5: Commercial Subscriptions & Request-Time Entitlement]
                   │
                   ▼
[Phase 6: Platform Finance & Revenue Settlement]
                   │
                   ▼
[Phase 7: Immutable Audit & Compliance Engine]
                   │
                   ▼
[Phase 8: Platform Support & Notifications System]
                   │
                   ▼
[Phase 9: Platform Settings, Maintenance Mode & Operations]
                   │
                   ▼
[Phase 10: Tenant Inspection & Emergency Remediation]
                   │
                   ▼
[Phase 11: System-Wide Integration, Verification & Production Hardening]
```

---

## 11. PHASE IMPLEMENTATION MASTER PLANS

---

### PHASE 1 — FOUNDATION & IDENTITY SECURITY

#### 1. Business Objective
Establish canonical, attack-resilient human identity management across the platform control plane. Enforce case-insensitive email uniqueness via canonical normalization, lossless 64-bit session revocation counters, and mandatory Multi-Factor Authentication (MFA) for platform administrators.

#### 2. Why This Phase Exists
Without canonical email normalization, account collisions occur across casing and whitespace variations. Without lossless 64-bit session counters, JavaScript IEEE-754 precision issues compromise session invalidation. Identity security must be hardened before multi-property applications or financial privileges can be granted.

#### 3. Prerequisites
* Existing `Account` model and auth routes in `Server/src/modules/platform/auth`.
* MongoDB Replica Set deployment initialized.

#### 4. Existing Functionality To Preserve
* Password hashing with bcrypt (cost factor 12).
* JWT signing and cookie transport routines in `auth.service.js`.
* Super Admin login screen layout and visual theming in `SuperAdmin/src/Pages/Login.jsx`.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** `Account.email` uses `{ unique: true, lowercase: true }`, but missing explicit `normalizedEmail` field causes potential NFKC Unicode collisions.  
  * *Fix:* Add `normalizedEmail` field; enforce index `{ normalizedEmail: 1, unique: true }`.
* **Defect:** `Account.tokenVersion` is defined as `{ type: Number, default: 0 }`. In Node.js, `Number` is IEEE-754 double precision (safe integer limit $2^{53}-1$).  
  * *Fix:* Migrate to BSON `Long` (`Int64`), initialized to `Long(1)`. Manage via `BigInt` in Node.js; serialize as decimal string in JWT claims.
* **Defect:** Account status defaults to `active` upon registration, bypassing email verification.  
  * *Fix:* Default new registrations to `status: 'pending'`. Transition to `active` exclusively upon successful email verification token redemption.

#### 6. Missing Functionality
* TOTP-based MFA enrollment, verification, and recovery code generation for `PLATFORM_ADMIN`.
* Account-level session revocation API (`POST /api/v1/auth/revoke-sessions`).

#### 7. Database Work
* **Platform DB Collections:** `accounts`.
* **Fields to Add:**
  * `normalizedEmail`: String, required, lowercase, NFKC normalized, trimmed.
  * `tokenVersion`: BSON `Long`, default `Long.fromInt(1)`.
  * `mfaSecret`: String, select: false.
  * `mfaEnabled`: Boolean, default false.
  * `mfaRecoveryCodes`: Array of Strings (hashed), select: false.
* **Indexes:** `db.accounts.createIndex({ normalizedEmail: 1 }, { unique: true, name: "idx_accounts_normalized_email_unique" })`.

#### 8. Backend Work
* **Routes:** `POST /api/v1/auth/mfa/setup`, `POST /api/v1/auth/mfa/verify`, `POST /api/v1/auth/revoke-sessions`.
* **Middleware:** Enforce `BigInt(jwt.tokenVersion) === BigInt(account.tokenVersion)` in `authenticate.middleware.js`.
* **Validation:** Joi/Zod schemas validating email formatting, strong passwords, and 6-digit TOTP tokens.
* **Audit:** Emit `USER_AUTHENTICATED`, `MFA_ENABLED`, `SESSIONS_REVOKED` to `platform_audit_logs`.

#### 9. Frontend Work
* **Pages:** `SuperAdmin/src/Pages/Login.jsx` (updated to prompt for 2FA OTP when required), `SuperAdmin/src/Pages/Profile/Profile.jsx` (MFA setup tab).
* **State:** Handle `requiresMfa` challenge state in `AuthService.js`.
* **Error States:** Map `TOKEN_VERSION_STALE`, `MFA_INVALID` to actionable UI messages.

#### 10. Acceptance Criteria
* **AC-1-01:** Given two registration requests with `admin@hotel.com` and `Admin@Hotel.com`, When submitted, Then the second request fails with `HTTP 409 Conflict: EMAIL_ALREADY_EXISTS`.
* **AC-1-02:** Given an active account with issued JWTs, When `revoke-sessions` is invoked, Then `tokenVersion` increments as a BSON `Long`, and existing JWTs receive `HTTP 401 TOKEN_VERSION_STALE`.
* **AC-1-03:** Given a `PLATFORM_ADMIN` account, When MFA is enabled, Then login without valid TOTP is rejected with `HTTP 403 MFA_REQUIRED`.

#### 11. Testing Requirements
* Unit tests for email normalization and `BigInt` token comparison.
* Integration tests for login, MFA challenge, and session revocation.
* Concurrency tests verifying atomic `$inc` on `tokenVersion`.

---

### PHASE 2 — HOTEL APPLICATION INTAKE & ACTION_REQUIRED GATEWAY

#### 1. Business Objective
Deliver a secure, concurrency-safe hotel application intake flow that prevents property name collisions, isolates unverified identities, and enables applicants to correct deficient applications via single-use opaque capability tokens.

#### 2. Why This Phase Exists
Property name collisions must be prevented at the database level. Deficient applications need a structured, secure correction mechanism without granting applicants premature platform login rights or exposing URLs to token leakage.

#### 3. Prerequisites
* Phase 1 completed (canonical identity verification established).

#### 4. Existing Functionality To Preserve
* Address, city, and province mappings in `hotelRegistry.service.js`.
* Multi-field search and filtering in `SuperAdmin/src/Pages/Hotels/Hotels.jsx`.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** `hotels` collection lacks database-level uniqueness across property names, relying on advisory application checks.  
  * *Fix:* Add `normalized_city` and `normalized_name` fields; create MongoDB partial unique index `idx_hotels_unique_city_property_name`.
* **Defect:** Application rejection currently suspends the applicant's Account: `Account.findByIdAndUpdate(hotel.ownerId, { status: "suspended" })`.  
  * *Fix:* Remove Account suspension on hotel rejection. `Account.status` remains completely decoupled.

#### 6. Missing Functionality
* 256-bit opaque capability token generation (`crypto.randomBytes(32)`).
* `Hotel.intake` subdocument storing `actionTokenHash` (SHA-256) and `actionTokenExpiresAt`.
* Public intake resubmission API: `POST /api/v1/intake/resubmit/:hotelId`.

#### 7. Database Work
* **Platform DB Collections:** `hotels`.
* **Fields to Add:**
  * `normalized_city`: String, required, lowercase, trimmed.
  * `normalized_name`: String, required, lowercase, punctuation-stripped, whitespace-collapsed.
  * `normalizationVersion`: Number, default 1.
  * `intake.actionTokenHash`: String, select: false.
  * `intake.actionTokenExpiresAt`: Date.
  * `intake.deficiencyNotes`: String.
  * `intake.resubmittedAt`: Date.
* **Indexes:** Create partial unique index on `{ normalized_city: 1, normalized_name: 1 }` filtering `status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'PROVISIONING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'] }`.

#### 8. Backend Work
* **Routes:** `POST /api/v1/intake/apply`, `GET /api/v1/intake/deficiency/:hotelId`, `POST /api/v1/intake/resubmit/:hotelId`.
* **Security Controls:**
  * Capability token delivery over HTTPS only with `Referrer-Policy: no-referrer`.
  * Reverse proxy access-log redaction scrubbing query parameter `actionToken`.
  * Atomic conditional update on resubmission clearing token hash and setting status `SUBMITTED`.

#### 9. Frontend Work
* **Intake Portal:** Standalone public intake correction page extracting token, sanitizing browser history via `window.history.replaceState()`, and displaying deficiency notes.
* **Error Handling:** Generic error response (`HTTP 403 ACTION_TOKEN_INVALID_OR_EXPIRED`) on invalid, expired, or replayed tokens.

#### 10. Acceptance Criteria
* **AC-2-01:** Given two concurrent applications submitting identical normalized `(city, name)`, When processed, Then exactly one succeeds and the other receives `HTTP 409 PROPERTY_ALREADY_REGISTERED`.
* **AC-2-02:** Given a hotel in `ACTION_REQUIRED`, When the applicant resubmits with a valid capability token, Then `Hotel.status` transitions to `SUBMITTED`, the token hash is cleared, and replaying the token returns `HTTP 403`.
* **AC-2-03:** Given a rejected hotel application, When the rejection commits, Then the property name is immediately released for new registrations.

#### 11. Testing Requirements
* Concurrency test submitting duplicate property names simultaneously.
* Security test verifying that capability tokens cannot access `/api/v1/platform/*` or `/api/v1/hotel/*`.
* Unit test verifying NFKC Unicode normalization and deterministic punctuation stripping.

---

### PHASE 3 — ADMINISTRATIVE REVIEW & GOVERNANCE

#### 1. Business Objective
Provide Platform Administrators with an auditable application review queue, deficiency flagging interface, and rejection governance workflow that preserves audit trails without cascading side effects to applicant identities.

#### 2. Why This Phase Exists
Platform administrators require clear review workflows to verify documentation, inspect property details, request corrections, or reject applications with documented justifications.

#### 3. Prerequisites
* Phase 1 and Phase 2 completed.

#### 4. Existing Functionality To Preserve
* Approvals tab layout in `SuperAdmin/src/Pages/Approvals/Approvels.jsx`.
* Pagination, search, and drawer details in `SuperAdmin/src/Pages/Hotels/PendingHotels.jsx`.
* Status badge styling in `SuperAdmin/src/Components/Common/StatusBadge.jsx`.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** Approvals page checks only `status === 'PENDING'`, ignoring `UNDER_REVIEW` and `ACTION_REQUIRED`.  
  * *Fix:* Update filter options and query parameters to support full authoritative hotel lifecycle states (`SUBMITTED`, `UNDER_REVIEW`, `ACTION_REQUIRED`, `REJECTED`).
* **Defect:** Direct approval button triggers immediate database provisioning in an unverified manner.  
  * *Fix:* Decouple review claiming from provisioning. Approval routes through Phase 4 saga orchestration.

#### 6. Missing Functionality
* Administrative "Claim for Review" action (`POST /api/v1/platform/hotels/:id/claim-review`).
* Administrative "Request Action" modal with deficiency notes (`POST /api/v1/platform/hotels/:id/request-action`).

#### 7. Database Work
* **Platform DB Collections:** `hotels`.
* **Fields to Add:**
  * `reviewerId`: ObjectId, ref: 'Account'.
  * `reviewStartedAt`: Date.
  * `rejectionReason`: String.

#### 8. Backend Work
* **Routes:** `POST /api/v1/platform/hotels/:id/claim-review`, `POST /api/v1/platform/hotels/:id/request-action`, `POST /api/v1/platform/hotels/:id/reject`.
* **Authorization:** Enforce `PLATFORM_ADMIN` role check on all review endpoints.
* **Audit:** Emit `APPLICATION_CLAIMED`, `ACTION_REQUIRED_ISSUED`, `APPLICATION_REJECTED` with actor ID and target hotel ID.

#### 9. Frontend Work
* **Pages:** `SuperAdmin/src/Pages/Approvals/PendingApprovals.jsx` (updated to display reviewer claim buttons and action-required modal).
* **Modals:** Deficiency modal capturing correction notes; confirmation modal capturing rejection reasons.

#### 10. Acceptance Criteria
* **AC-3-01:** Given an application in `SUBMITTED`, When an admin claims it, Then `status` transitions to `UNDER_REVIEW` and `reviewerId` is set.
* **AC-3-02:** Given an application in `UNDER_REVIEW`, When admin requests action, Then `status` becomes `ACTION_REQUIRED`, a capability token is issued, and an email notification is dispatched.
* **AC-3-03:** Given an application in `UNDER_REVIEW`, When admin rejects it, Then `status` becomes `REJECTED`, the property name is unlocked, and the owner Account remains `ACTIVE`.

#### 11. Testing Requirements
* Integration tests for review claiming, action requesting, and rejection.
* Regression test asserting owner `Account.status` remains unchanged following rejection.

---

### PHASE 4 — RECOVERABLE PROVISIONING SAGA & TENANT ISOLATION

#### 1. Business Objective
Execute atomic, recoverable cross-database tenant database initialization. Enforce physical database-per-tenant isolation (`hotel_<hotelId>`), permanent ownership marker verification, worker attempt fencing, and safe quarantine protocols.

#### 2. Why This Phase Exists
Cross-database provisioning cannot use distributed 2PC. If provisioning fails midway, the system must recover safely without corrupting platform state, orphaning unverified databases, or destroying business data.

#### 3. Prerequisites
* Phases 1, 2, and 3 completed.

#### 4. Existing Functionality To Preserve
* Dynamic tenant connection resolution in `Server/src/database/connectionManager.js`.
* Tenant model factory in `Server/src/database/hotel/modelFactory.js`.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** `onboardHotel` in `provisioning.service.js` directly drops tenant databases via `dropHotelDatabase` without checking ownership markers or business collections.  
  * *Fix:* Enforce the 15-point Safe Tenant Database Drop Predicate. If any check fails, transition to `QUARANTINED` and block deletion.
* **Defect:** Provisioning activates hotels and owner accounts simultaneously without checking if the owner was suspended or banned during the saga.  
  * *Fix:* Phase D platform transaction strictly asserts `owner.status === 'ACTIVE'`. If owner is suspended or banned, activation aborts.

#### 6. Missing Functionality
* Phase A platform reservation (`tenantProvisioningId` and `currentProvisioningAttemptId`).
* Tenant permanent ownership marker collection `_provisioning_marker` and attempt telemetry collection `_provisioning_attempts`.
* Stale worker fencing engine comparing worker attempt ID against `Hotel.currentProvisioningAttemptId`.
* Background Saga Reconciler detecting stalled attempts (`PROVISIONING_STALL_TIMEOUT_MS`).

#### 7. Database Work
* **Platform DB Collections:** `hotels`.
* **Fields to Add:**
  * `tenantProvisioningId`: String (UUIDv4), required.
  * `currentProvisioningAttemptId`: String (UUIDv4), required.
  * `approvedAt`: Date, immutable after initial commit.
  * `provisioning.recoveryState`: String, enum: `['NONE', 'RETRYABLE', 'MANUAL_RECONCILIATION_REQUIRED', 'QUARANTINED']`.
  * `provisioning.requiresManualReconciliation`: Boolean, default false.
* **Tenant DB Collections:** `_provisioning_marker`, `_provisioning_attempts`.
* **Tenant DB Indexes:** `db._provisioning_attempts.createIndex({ provisioningAttemptId: 1 }, { unique: true })`.

#### 8. Backend Work
* **Service:** Refactor `provisioning.service.js` into Phase A (Reservation), Phase B (Tenant Init), Phase C (Verification), and Phase D (Activation Transaction).
* **Fencing:** Add heartbeat renewal and attempt validation before any tenant write or drop.
* **Reconciler Worker:** Background job inspecting stalled attempts and executing idempotent Phase D retries or safe cleanups.

#### 9. Frontend Work
* **UI Feedback:** Update `SuperAdmin/src/Pages/Approvals/Approvels.jsx` to show provisioning progress indicator and quarantine alert banner.
* **Reconciliation Controls:** Provide platform administrators with an explicit "Inspect Quarantined Database" view.

#### 10. Acceptance Criteria
* **AC-4-01:** Given two concurrent approval requests for the same hotel, When executed, Then exactly one reserves `PROVISIONING` and the other receives `HTTP 409 LIFECYCLE_CONFLICT`.
* **AC-4-02:** Given a failed provisioning attempt where unapproved collections exist in the tenant DB, When cleanup runs, Then the database is NOT dropped, `recoveryState` becomes `QUARANTINED`, and a critical alert is logged.
* **AC-4-03:** Given Phase D platform transaction failure after tenant seeding, When reconciler retries, Then Phase D commits idempotently without re-seeding the tenant DB.
* **AC-4-04:** Given an owner account that becomes `SUSPENDED` during provisioning, When Phase D runs, Then activation aborts safely and the hotel remains in `PROVISIONING`.

#### 11. Testing Requirements
* Crash-simulation tests during Phase B, Phase C, and Phase D.
* Concurrency test verifying stale worker fencing when a new attempt is generated.
* Automated verification that `approvedAt` is never overwritten on retries.

---

### PHASE 5 — COMMERCIAL SUBSCRIPTIONS & REQUEST-TIME ENTITLEMENT

#### 1. Business Objective
Implement commercial subscription agreements, request-time entitlement calculation, deterministic supersession, and operation-scoped idempotency. Enforce the strict read-only PMS boundary when subscriptions expire.

#### 2. Why This Phase Exists
Hotels operate under commercial agreements. Subscription expiration must be enforced deterministically at request time so that delayed background crons cannot grant unauthorized write access.

#### 3. Prerequisites
* Phases 1 through 4 completed.

#### 4. Existing Functionality To Preserve
* Plan tiers and pricing definitions in `subscription.model.js`.
* Subscription management table in `SuperAdmin/src/Pages/Subscriptions/Subscriptions.jsx`.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** `subscription.model.js` lacks `isCurrent` field, allowing multiple active agreements to co-exist without database constraints.  
  * *Fix:* Add `isCurrent: Boolean` and index `idx_subscriptions_single_current_per_hotel`.
* **Defect:** Entitlement logic previously treated `isCurrent === false` as `CANCELLED`.  
  * *Fix:* Decouple supersession from cancellation. `isCurrent === false` indicates historical/superseded status.
* **Defect:** Subscription status relies on background cron updates, leaving open a window for expired access if cron fails.  
  * *Fix:* Gateway middleware calculates effective entitlement at request time using UTC half-open intervals `[startDate, endDate)`.

#### 6. Missing Functionality
* Request-time entitlement evaluation middleware in `hotelContext.middleware.js`.
* Operation-scoped idempotency index `{ hotelId: 1, operationType: 1, idempotencyKey: 1 }`.
* Policy snapshot fields on subscription agreements (`expiringWindowSeconds`, `gracePeriodSeconds`).
* Renewal transaction protocol atomically superseding predecessor and activating successor.

#### 7. Database Work
* **Platform DB Collections:** `subscriptions`.
* **Fields to Add:**
  * `isCurrent`: Boolean, default false.
  * `operationType`: String, enum: `['PROVISIONING_INITIAL_SUBSCRIPTION', 'RENEW_SUBSCRIPTION', 'CANCEL_SUBSCRIPTION', 'REPLACE_SUBSCRIPTION']`.
  * `idempotencyKey`: String.
  * `requestFingerprint`: String.
  * `expiringWindowSeconds`: Number, default 604800 (7 days).
  * `gracePeriodSeconds`: Number, default 604800 (7 days).
  * `cancelAtPeriodEnd`: Boolean, default false.
  * `supersededAt`: Date.
  * `supersededBy`: ObjectId, ref: 'Subscription'.
* **Indexes:** Create partial unique index on `{ hotelId: 1, isCurrent: 1 }` filtering `{ isCurrent: true }`. Create unique index on `{ hotelId: 1, operationType: 1, idempotencyKey: 1 }`.

#### 8. Backend Work
* **Middleware:** Insert subscription entitlement gate into `hotelContext.middleware.js`. Enforce that `EXPIRED` blocks `POST`, `PUT`, `PATCH`, `DELETE` (`HTTP 403 SUBSCRIPTION_EXPIRED`).
* **Service:** Implement transactional renewal in `subscription.service.js`. Validate `successor.startDate >= predecessor.endDate`.

#### 9. Frontend Work
* **SuperAdmin UI:** Display effective entitlement status badges (`ACTIVE`, `EXPIRING`, `GRACE_PERIOD`, `EXPIRED`, `CANCELLED`) in `Subscriptions.jsx`.
* **Client PMS UI:** Render read-only warning banners when hotel entitlement evaluates to `EXPIRED`.

#### 10. Acceptance Criteria
* **AC-5-01:** Given an `ACTIVE` hotel, When inspected, Then exactly one Subscription document possesses `isCurrent === true`.
* **AC-5-02:** Given a hotel whose subscription has passed `endDate + gracePeriodSeconds`, When any operational mutation is attempted, Then the gateway returns `HTTP 403 SUBSCRIPTION_EXPIRED`.
* **AC-5-03:** Given a renewal request with an existing idempotency key and identical payload, When submitted, Then the existing subscription document is returned with `HTTP 200/201`.
* **AC-5-04:** Given a renewal request with an existing idempotency key but altered payload, When submitted, Then the request fails with `HTTP 409 IDEMPOTENCY_KEY_REUSE_CONFLICT`.

#### 11. Testing Requirements
* Concurrency test executing two renewal transactions simultaneously.
* Integration test verifying that GET requests succeed while POST requests fail when effective status is `EXPIRED`.
* Contract test verifying that `cancelAtPeriodEnd = true` does not bypass grace period.

---

### PHASE 6 — PLATFORM FINANCE & REVENUE SETTLEMENT

#### 1. Business Objective
Maintain an immutable, append-only financial transaction ledger tracking subscription billing, payout reconciliations, and platform revenue summaries.

#### 2. Why This Phase Exists
Financial records must be auditable and immutable. Subscription renewals and cancellations must never rewrite historical financial facts.

#### 3. Prerequisites
* Phase 5 completed.

#### 4. Existing Functionality To Preserve
* Revenue charts and financial statistics in `SuperAdmin/src/Pages/Revenue/Revenue.jsx`.
* Transaction listing in `SuperAdmin/src/Pages/Revenue/Transaction.jsx`.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** Financial summaries calculate monthly revenue using hardcoded plan constants instead of aggregating completed `platform_transactions`.  
  * *Fix:* Aggregate revenue directly from verified, completed transaction documents.

#### 6. Missing Functionality
* Operation-scoped idempotency keys on payment recordings.
* Immutability enforcement on completed `platform_transactions`.

#### 7. Database Work
* **Platform DB Collections:** `platform_transactions`.
* **Fields to Add:**
  * `idempotencyKey`: String, required.
  * `subscriptionId`: ObjectId, ref: 'Subscription'.
  * `amount`: Number, required, min: 0.
  * `currency`: String, default 'PKR'.
  * `status`: String, enum: `['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']`.
* **Indexes:** Create unique index on `{ idempotencyKey: 1 }`.

#### 8. Backend Work
* **Service:** Update `finance.service.js` to record immutable ledger entries upon subscription checkout or renewal.
* **Audit:** Emit `PAYMENT_RECORDED`, `PAYOUT_PROCESSED` with transaction references.

#### 9. Frontend Work
* **UI Updates:** Connect `Revenue.jsx` and `Transaction.jsx` to live aggregation endpoints in `finance.service.js`.

#### 10. Acceptance Criteria
* **AC-6-01:** Given a subscription renewal, When completed, Then a corresponding `platform_transactions` document is created with status `COMPLETED`.
* **AC-6-02:** Given a completed transaction document, When update or deletion is attempted, Then the database engine or service layer structurally denies the operation.

#### 11. Testing Requirements
* Integration tests for revenue aggregation.
* Test verifying financial record immutability during subscription cancellation.

---

### PHASE 7 — IMMUTABLE AUDIT & COMPLIANCE ENGINE

#### 1. Business Objective
Deliver an append-only, schema-enforced platform audit logging engine that redacts sensitive credentials, caps metadata at 16 KB, and enforces database-level write-only permissions.

#### 2. Why This Phase Exists
Regulatory compliance and administrative accountability require an unalterable audit log. Sensitive authentication tokens, passwords, and PII must never be serialized to audit storage.

#### 3. Prerequisites
* Phases 1 through 6 completed.

#### 4. Existing Functionality To Preserve
* Audit log viewer table in `SuperAdmin/src/Pages/AuditLogs/AuditLogs.jsx`.
* Search and severity filtering components.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** `platformAuditLog.model.js` allows arbitrary `metadata: Record<string, any>`, permitting unbounded secret logging.  
  * *Fix:* Enforce strict schema validation, recursive redaction, and a 16 KB payload ceiling.
* **Defect:** Application connects using a single database user with full CRUD privileges on audit collections.  
  * *Fix:* Configure dedicated `Audit Writer` database user holding strictly `insert` privilege (no `update`/`delete`).

#### 6. Missing Functionality
* Mandatory `AUDIT_REDACTION_POLICY` recursively scrubbing forbidden fields (`password`, `token`, `actionToken`, `mfaSecret`, `cardNumber`, `cvv`).
* Validated target registry (`HOTEL`, `ACCOUNT`, `SUBSCRIPTION`, `FINANCE`, `TENANT_DB`, etc.).

#### 7. Database Work
* **Platform DB Collections:** `platform_audit_logs`.
* **Fields to Add:**
  * `operationId`: String, required.
  * `actorType`: String, enum: `['USER', 'SYSTEM']`.
  * `targetType`: String, enum: `['HOTEL', 'ACCOUNT', 'SUBSCRIPTION', 'FINANCE', 'INVOICE', 'PAYMENT', 'SUPPORT_TICKET', 'SUPPORT_MESSAGE', 'NOTIFICATION', 'PLATFORM_SETTING', 'TENANT_DB', 'APPLICATION', 'SECURITY_EVENT']`.
  * `executionResult`: String, enum: `['SUCCESS', 'FAILED']`.
* **Indexes:** Indexes on `{ targetId: 1, timestamp: -1 }` and `{ severity: 1, timestamp: -1 }`.

#### 8. Backend Work
* **Middleware/Service:** Refactor `audit.service.js` to implement recursive sanitization and fail-closed durability for security-critical events.

#### 9. Frontend Work
* **UI Updates:** Connect `AuditLogs.jsx` to validated target registry filters; render sanitized diff view modals.

#### 10. Acceptance Criteria
* **AC-7-01:** Given an audit log call containing a password or access token in metadata, When processed, Then the forbidden fields are replaced with `"[REDACTED]"`.
* **AC-7-02:** Given an existing audit document, When an application update or delete query is executed, Then the database engine structurally rejects the command.

#### 11. Testing Requirements
* Unit test for recursive redaction of nested secret objects.
* Security test verifying that database credentials reject `db.platform_audit_logs.deleteMany()`.

---

### PHASE 8 — PLATFORM SUPPORT & NOTIFICATIONS SYSTEM

#### 1. Business Objective
Provide cross-tenant support ticket management and system notifications with bounded message schemas and independent auditability.

#### 2. Why This Phase Exists
Tenant hotels require structured support channels. Support messages must be modeled as discrete entities rather than unbounded single documents to prevent BSON document size overflow.

#### 3. Prerequisites
* Phases 1 through 7 completed.

#### 4. Existing Functionality To Preserve
* Support tickets UI layout in `SuperAdmin/src/Pages/Support/SupportTicket.jsx`.
* Notifications dropdown and drawer in `SuperAdmin/src/Pages/Notifications/Notifications.jsx`.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** Support tickets currently mock conversations in memory or component state.  
  * *Fix:* Back support tickets with persistent control-plane collections `support_tickets` and `support_ticket_messages`.

#### 6. Missing Functionality
* Discrete `support_ticket_messages` collection with pagination.
* Notification dispatch queues with idempotent delivery keys.

#### 7. Database Work
* **Platform DB Collections:** `support_tickets`, `support_ticket_messages`, `notifications`.
* **Indexes:** Create index on `{ ticketId: 1, createdAt: 1 }` on `support_ticket_messages`.

#### 8. Backend Work
* **Routes:** `GET /api/v1/platform/support/tickets`, `POST /api/v1/platform/support/tickets/:id/messages`, `PATCH /api/v1/platform/support/tickets/:id/status`.
* **Service:** Implement decoupled message persistence in `support.service.js`.

#### 9. Frontend Work
* **UI Integration:** Connect `SupportTicket.jsx` to live message thread APIs; implement message sending with optimistic UI updates.

#### 10. Acceptance Criteria
* **AC-8-01:** Given a support ticket with 100 messages, When fetched, Then messages are retrieved via paginated queries on `support_ticket_messages`.
* **AC-8-02:** Given a notification delivery failure, When retried, Then the notification delivery key prevents duplicate alerts.

#### 11. Testing Requirements
* Integration tests for support message posting and status transitions.

---

### PHASE 9 — PLATFORM SETTINGS, MAINTENANCE MODE & OPERATIONS

#### 1. Business Objective
Implement global platform configuration management and tenant operational maintenance mode. Enforce that maintenance mode blocks tenant operational APIs while keeping control-plane management online.

#### 2. Why This Phase Exists
Platform operators require the ability to toggle scheduled maintenance on tenant PMS operations without locking themselves out of the Super Admin control plane.

#### 3. Prerequisites
* Phases 1 through 8 completed.

#### 4. Existing Functionality To Preserve
* Platform settings page layout in `SuperAdmin/src/Pages/Settings/Settings.jsx`.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** Maintenance mode toggle does not affect backend request execution.  
  * *Fix:* Connect settings maintenance flag directly to Gate 5 of the tenant authorization pipeline in `hotelContext.middleware.js`.

#### 6. Missing Functionality
* Persistent `platform_settings` collection storing global policy configurations.
* Immediate `HTTP 503 MAINTENANCE_MODE` rejection on `/api/v1/hotel/*` during active maintenance.

#### 7. Database Work
* **Platform DB Collections:** `platform_settings`.
* **Fields:** `key`: String (unique), `value`: Mixed, `category`: String, `updatedBy`: ObjectId.

#### 8. Backend Work
* **Middleware:** Check cached maintenance flag at Gate 5 in `hotelContext.middleware.js`.
* **Exemptions:** Explicitly exempt `/api/v1/platform/*` and tenant inspection endpoints from maintenance blocks.

#### 9. Frontend Work
* **UI Integration:** Wire maintenance mode toggle switch in `Settings.jsx` to `PATCH /api/v1/platform/settings/maintenance`.

#### 10. Acceptance Criteria
* **AC-9-01:** Given maintenance mode is ENABLED, When a tenant staff user calls `/api/v1/hotel/reservations`, Then the gateway returns `HTTP 503 MAINTENANCE_MODE`.
* **AC-9-02:** Given maintenance mode is ENABLED, When a Platform Admin calls `/api/v1/platform/hotels`, Then the request succeeds with `HTTP 200 OK`.

#### 11. Testing Requirements
* Integration test verifying tenant API 503 response and control-plane 200 response during maintenance.

---

### PHASE 10 — TENANT INSPECTION & EMERGENCY REMEDIATION

#### 1. Business Objective
Deliver a secure control-plane interface allowing Platform Administrators to perform read-only inspections across all tenant databases and execute allowlisted emergency mutations under strict optimistic concurrency and audit logging.

#### 2. Why This Phase Exists
Platform operators need to inspect operational issues and perform disaster recovery (e.g., releasing stuck reservation locks) without impersonating tenant staff or writing unvetted raw database updates.

#### 3. Prerequisites
* Phases 1 through 9 completed.

#### 4. Existing Functionality To Preserve
* Super Admin layout and breadcrumb routing.

#### 5. Existing Functionality That Must Be Fixed
* **Defect:** Platform Admin inspection previously had no dedicated routes, risking exposure via client PMS routes.  
  * *Fix:* Expose inspection exclusively on `/api/v1/platform/tenants/:hotelId/inspect/*`.

#### 6. Missing Functionality
* Transient read-only tenant database connection manager using dedicated `read`-only MongoDB credentials.
* Emergency mutation allowlist with document version verification and mandatory reason headers ($\ge 10$ chars).

#### 7. Database Work
* **Tenant DB:** Enforce that emergency mutations evaluate `expectedVersion` or document `updatedAt` predicates.

#### 8. Backend Work
* **Routes:**
  * `GET /api/v1/platform/tenants/:hotelId/inspect/rooms`
  * `GET /api/v1/platform/tenants/:hotelId/inspect/reservations`
  * `GET /api/v1/platform/tenants/:hotelId/inspect/folios`
  * `POST /api/v1/platform/tenants/:hotelId/inspect/rooms/:roomId/release-lock`
  * `POST /api/v1/platform/tenants/:hotelId/inspect/reservations/:resId/force-unlock`
  * `PATCH /api/v1/platform/tenants/:hotelId/inspect/folios/:folioId/reconcile-balance`
* **Security:** Reject any mutation where target hotel is `ARCHIVED`. Reject any arbitrary update operators (`$set`, `$unset`) supplied directly by clients.

#### 9. Frontend Work
* **Pages:** New dedicated Super Admin view `SuperAdmin/src/Pages/Hotels/TenantInspection.jsx` providing tabbed read-only views of tenant rooms, bookings, and folios, with guarded emergency action buttons.

#### 10. Acceptance Criteria
* **AC-10-01:** Given an `ARCHIVED` hotel, When an admin performs read inspection, Then a transient read-only connection executes the query and terminates immediately.
* **AC-10-02:** Given an `ARCHIVED` hotel, When an admin attempts an emergency mutation, Then the request is rejected with `HTTP 403 EMERGENCY_MUTATION_DENIED`.
* **AC-10-03:** Given an emergency mutation request lacking header `X-Platform-Admin-Reason` or length $< 10$, When submitted, Then the request is rejected with `HTTP 403`.

#### 11. Testing Requirements
* Security test proving database engine rejects write commands executed through the inspection credential.
* Concurrency test verifying optimistic locking conflict (`HTTP 409`) on concurrent emergency mutations.

---

### PHASE 11 — SYSTEM-WIDE INTEGRATION, VERIFICATION & PRODUCTION HARDENING

#### 1. Business Objective
Execute full end-to-end integration across all eleven phases. Verify that cross-lifecycle invariants hold, run regression suites, validate MongoDB partial indexes, and confirm production deployment readiness.

#### 2. Why This Phase Exists
Individual phases must be validated holistically under production-like concurrency, network partitions, and edge-case loads to certify the entire platform before production deployment.

#### 3. Prerequisites
* Phases 1 through 10 completed.

#### 4. Existing Functionality To Preserve
* All functionality verified across Phases 1 through 10.

#### 5. Existing Functionality That Must Be Fixed
* Any latent regression discovered during full system integration testing.

#### 6. Missing Functionality
* Comprehensive automated smoke and regression test runner.

#### 7. Database Work
* Verify all indexes from Section 6 exist in the staging/production MongoDB cluster.
* Validate that `platform_audit_logs` contains zero unredacted secrets.

#### 8. Backend Work
* Run full backend test suite (`npm test`). Assert 100% pass rate.
* Verify bounded LRU tenant connection manager evicts idle connections cleanly.

#### 9. Frontend Work
* Execute SuperAdmin production build (`npm run build`). Verify zero compilation errors.
* Validate all loading, error, empty, and permission states across all thirteen Super Admin modules.

#### 10. Acceptance Criteria
* **AC-11-01:** Full end-to-end workflow passes: Applicant applies $\to$ Admin requests action $\to$ Applicant resubmits $\to$ Admin approves $\to$ Saga provisions $\to$ Hotel activates with subscription $\to$ PMS operates $\to$ Subscription expires to read-only $\to$ Renewal restores write access.
* **AC-11-02:** Zero cross-tenant data leaks under concurrent multi-tenant loads.
* **AC-11-03:** All 25 Global Acceptance Criteria (Section 12) pass.

#### 11. Testing Requirements
* Full end-to-end suite, load tests, and security penetration test suite.

---

## 12. GLOBAL ACCEPTANCE CRITERIA

| ID | Category | Objective Verification Statement | Compliance Status |
| :--- | :--- | :--- | :--- |
| **GAC-01** | **Identity** | `Account.status` transitions from `PENDING` to `ACTIVE` exclusively via identity verification. Hotel approval never activates an Account. | **FROZEN INVARIANT** |
| **GAC-02** | **Identity** | Index `idx_accounts_normalized_email_unique` enforces global email uniqueness across normalized email strings. | **FROZEN INVARIANT** |
| **GAC-03** | **Identity** | `Account.tokenVersion` is stored as BSON `Long` (`Int64`), managed via `BigInt`, and serialized as a string in JWT claims. Increments are atomic. | **FROZEN INVARIANT** |
| **GAC-04** | **Authorization** | An `ACTIVE` Account can own multiple hotels ($1:N$). Tenant PMS access mandates explicit ownership or verified membership in `staff_profiles`. | **FROZEN INVARIANT** |
| **GAC-05** | **Authorization** | Hotel suspension blocks tenant gateway access (`HTTP 403`) without altering Account status or mass-updating staff token versions. | **FROZEN INVARIANT** |
| **GAC-06** | **Property Index** | Index `idx_hotels_unique_city_property_name` enforces uniqueness using `$in` partial filter. `REJECTED` releases name; `ARCHIVED` retains name. | **FROZEN INVARIANT** |
| **GAC-07** | **Capability Token** | Capability tokens are 256-bit random bytes; stored strictly as `SHA-256(rawToken)`; consumed atomically via `findOneAndUpdate`. Viewing does not consume token. | **FROZEN INVARIANT** |
| **GAC-08** | **Provisioning** | Phase A and Phase D strictly mandate `owner.status === 'ACTIVE'`. | **FROZEN INVARIANT** |
| **GAC-09** | **Provisioning** | Provisioning uses `tenantProvisioningId` (stable) and `currentProvisioningAttemptId` (volatile). Stale workers matching older attempts abort immediately. | **FROZEN INVARIANT** |
| **GAC-10** | **Provisioning** | Phase D commits `Hotel → ACTIVE`, `approvedAt`, and initial subscription inside a MongoDB multi-document transaction (Replica Set required). | **FROZEN INVARIANT** |
| **GAC-11** | **Cleanup Safety** | Tenant DB drop executes only if the ownership marker matches the active failed attempt and all collections match the approved seed manifest. Ambiguity triggers quarantine. | **FROZEN INVARIANT** |
| **GAC-12** | **Subscription** | Index `idx_subscriptions_single_current_per_hotel` enforces at most one `isCurrent: true` subscription per hotel at the database level. | **FROZEN INVARIANT** |
| **GAC-13** | **Subscription** | An `ACTIVE` operational hotel requires exactly one Subscription agreement with `isCurrent === true`. Zero current agreements fails closed (`HTTP 403`). | **FROZEN INVARIANT** |
| **GAC-14** | **Subscription** | `isCurrent === false` denotes historical/superseded agreement; does not imply `CANCELLED`. | **FROZEN INVARIANT** |
| **GAC-15** | **Subscription** | Entitlement engine evaluates UTC half-open intervals `[startDate, endDate)`. Date engine is authoritative; stale cron updates fail closed. | **FROZEN INVARIANT** |
| **GAC-16** | **Subscription** | `cancelAtPeriodEnd = true` preserves full grace lifecycle. Immediate cancellation is an explicit administrative action. | **FROZEN INVARIANT** |
| **GAC-17** | **Subscription** | `EXPIRED` status strictly blocks all operational mutations (`HTTP 403`) while preserving authorized reads. | **FROZEN INVARIANT** |
| **GAC-18** | **Subscription** | Index `idx_subscriptions_idempotency_unique` prevents duplicate agreements during retries. Same key + altered payload returns `HTTP 409`. | **FROZEN INVARIANT** |
| **GAC-19** | **Inspection** | Platform Admin inspection is read-only by default. Emergency mutation requires `TENANT_EMERGENCY_MUTATE`, allowlisted route, and reason header ($\ge 10$ chars). | **FROZEN INVARIANT** |
| **GAC-20** | **Inspection** | Reason header is strictly an intent/audit requirement, never an authorization mechanism. Emergency mutations on `ARCHIVED` hotels are forbidden. | **FROZEN INVARIANT** |
| **GAC-21** | **Inspection** | Archived inspection connects via dedicated read-only database credentials; persistent connection pool evicted. | **FROZEN INVARIANT** |
| **GAC-22** | **Maintenance** | Maintenance mode returns `HTTP 503 MAINTENANCE_MODE` for `/api/v1/hotel/*` while keeping `/api/v1/platform/*` and Admin inspection fully operational. | **FROZEN INVARIANT** |
| **GAC-23** | **Audit** | Audit records are append-only. Metadata is schema-enforced, capped at 16 KB, and stripped of all sensitive credentials per `AUDIT_REDACTION_POLICY`. | **FROZEN INVARIANT** |
| **GAC-24** | **Audit** | Database role for audit writer strictly excludes `update` and `delete` privileges. | **FROZEN INVARIANT** |
| **GAC-25** | **Isolation** | Database names are strictly resolved from verified platform identity: `hotel_<hotelId>`. Client-supplied database names are rejected. | **FROZEN INVARIANT** |

---

## 13. ARCHITECTURAL DECISION RECORDS (ADRS)

### ADR-01: Physical Database-Per-Tenant Isolation
* **Context:** Hotel operational data contains highly sensitive guest records, financial folios, and inventory. Co-mingling records in a shared collection poses cross-tenant data leak risks via application query bugs.
* **Decision:** Every hotel receives an independent MongoDB database: `hotel_<hotelId>`.
* **Consequence:** Physical data isolation is absolute. Operational collections are never shared. Backup and restore operations can be executed per tenant.

### ADR-02: Recoverable Cross-Database Provisioning Saga Without Distributed 2PC
* **Context:** MongoDB multi-document transactions cannot span independent databases across the control plane and tenant data plane.
* **Decision:** Implement a 4-phase recoverable saga (Reservation $\to$ Initialization $\to$ Verification $\to$ Activation) with worker fencing and safe quarantine.
* **Consequence:** Safe, recoverable provisioning without distributed transaction locks. Ambiguous tenant states fail closed into quarantine.

### ADR-03: Decoupled Account Identity vs. Hotel Lifecycle
* **Context:** An applicant's hotel application may be rejected, or a hotel may be suspended for billing default.
* **Decision:** `Account.status` is strictly decoupled from `Hotel.status`. Accounts represent human identities and can own multiple hotels ($1:N$).
* **Consequence:** Rejecting a hotel application leaves the verified account active, allowing reapplication without duplicate account creation.

### ADR-04: Request-Time Entitlement Engine Over Cron Reliance
* **Context:** Delayed background cron jobs could allow tenants whose subscriptions have expired to continue executing PMS mutations.
* **Decision:** Gateway middleware evaluates contractual date intervals (`[startDate, endDate)`) at request time. Background crons merely synchronize operational dashboard caches.
* **Consequence:** Immediate, fail-closed enforcement of read-only status upon subscription expiration, independent of cron reliability.

### ADR-05: Lossless 64-Bit BSON Long for Session Revocation (`tokenVersion`)
* **Context:** JavaScript runtimes represent numbers as IEEE-754 double precision floats, losing precision above $2^{53}-1$.
* **Decision:** Represent `tokenVersion` as BSON `Long` (`Int64`) at the database layer, `BigInt` in application code, and decimal strings in JWT claims.
* **Consequence:** Zero precision loss; tamper-proof and overflow-safe session revocation.

---

## 14. DEFERRED BUSINESS & LEGAL POLICY REGISTER

The following items are business and legal operational choices. They do not block the architectural contract and are formally deferred to deployment/policy phases:

| Policy ID | Policy Description | Classification | Authoritative Source | Provisional Value | Architecture Impact |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **POL-01** | Multi-property ownership limit per Account | **Business Policy** | `platform_settings` | Unlimited ($1:N$) | **None** |
| **POL-02** | Subscription grace period duration | **Business Policy** | `platform_settings` | 7 Days (604,800 s) | **None** (Snapshotted) |
| **POL-03** | Subscription expiring warning window | **Business Policy** | `platform_settings` | 7 Days (604,800 s) | **None** (Snapshotted) |
| **POL-04** | Capability token expiration TTL | **Operational Config** | Environment (`.env`) | 72 Hours (259,200 s) | **None** |
| **POL-05** | Provisioning stall detection threshold | **Operational Config** | Environment (`.env`) | 5 Minutes (300,000 ms)| **None** |
| **POL-06** | Maximum persistent tenant connection pools | **Operational Config** | Environment (`.env`) | 100 Pools | **None** |
| **POL-07** | Tenant connection idle eviction timeout | **Operational Config** | Environment (`.env`) | 30 Minutes (1,800 s) | **None** |
| **POL-08** | Mandatory regulatory onboarding documents | **Business/Legal Policy**| `platform_settings` | None mandatory by default| **None** |
| **POL-09** | Rejection cooling-off duration | **Business Policy** | `platform_settings` | 0 Days (Immediate) | **None** |
| **POL-10** | Statutory audit log retention period | **Legal/Compliance** | Compliance Policy | 5 Years (Placeholder)| **None** |

---

## 15. LITERAL CONTRADICTION SCAN & FREEZE AUDIT

An exhaustive scan across all sections confirms zero internal contradictions:
* `isCurrent`: Consistently defined as the authoritative agreement selector. Never conflated with active entitlement.
* `CANCELLED`: Terminal commercial state. Immutable. Supersession metadata updates explicitly separated from lifecycle status.
* `EXPIRED`: Commercial state where dates have passed grace. Strict read-only PMS enforced. Does not trigger automatic cancellation.
* `Account.status`: Strictly independent of `Hotel.status`. Activation triggered solely by identity verification.
* `approvedAt`: Immutable timestamp set once upon initial transition to `ACTIVE`.
* `_provisioning_marker`: Permanent ownership marker, decoupled from volatile attempt telemetry.
* `Cleanup Safety`: Bounded strictly by the approved baseline seed manifest allowlist.
* `Inspection Security`: Enforced at MongoDB RBAC engine level via dedicated read-only credentials across all states.
* `Audit Durability`: Security mutations fail closed if audit cannot persist; in-memory buffer classified as operational telemetry.

---

## 16. FINAL VERDICT

# `READY FOR IMPLEMENTATION`

### Final Certification Statement:
The Super Admin platform control plane and multi-tenant data plane architecture for the **Explore Pakistan Hotel Management System** is completely reconciled, mathematically unambiguous, and frozen.

* All eleven vertical implementation phases are self-contained and dependency-ordered.
* Existing working functionality is fully cataloged and protected against regression.
* Real defects and architectural gaps are explicitly isolated with concrete remediation plans.
* Database, backend, frontend, security, and testing contracts are fully specified for every capability.

**`admin.md` is now the permanent, authoritative source of truth for all future implementation phases.**
