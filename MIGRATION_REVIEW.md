# Shared MongoDB migration review

Status: incomplete. Backend verification passed; source-data preservation and full frontend integration are unverified.

## Existing migration inspected

The working tree already changed the default URI to `mongodb://localhost:27017/explore_pakistan`, reused the default Mongoose connection, added required ObjectId ownership to hotel schemas, added compound unique indexes, and changed hotel services/controllers to filter on server tenant context. Existing frontend changes were preserved.

The existing migration script copied platform and hotel collections using unconditional replacements, checked only counts, then immediately dropped both sources. Those source databases were already absent when this session first inspected MongoDB. It cannot be established from current data whether every original document survived.

## Fixes in this session

- Removed legacy connection configuration fallback and hotel database-name metadata from provisioning/schema; removed that obsolete metadata from the existing Hotel document.
- Restricted application connection names and protected the test connection from production database use.
- Restricted test teardown to exactly `test_explore_pakistan`; unrelated databases are never enumerated for deletion.
- Fixed compound guest identity indexes to use partial filters. Compound sparse indexes incorrectly indexed missing identities because hotelId exists.
- Made index initialization propagate failures; provided ownership indexes for all 54 hotel schemas.
- Rejected authenticated accounts whose Hotel no longer exists.
- Validated reservation-group ownership and operational employee reassignment before room side effects.
- Replaced dangling reservation rate-plan fallback IDs with a real hotel-owned base RatePlan, resolving rate plans before acquiring booking locks.
- Serialized concurrent check-in through atomic reservation and room claims, with compensation on failure.
- Replaced the migration script with a read-only audit by default; `--apply` inserts missing documents only, refuses conflicting records, verifies inserted contents, writes a BSON-preserving backup, and never deletes sources. Backup files are git-ignored.
- Updated database-per-tenant test assertions for shared data scope and added real MongoDB regression checks.

## Verified evidence

- Complete backend suite: **119 passed, 0 failed, 0 skipped, 0 todo** (`Server/test-results.json`).
- All 54 hotel schemas: required ObjectId hotel ownership and hotel-prefixed ownership/unique indexes verified against real MongoDB.
- Two onboarded hotels both create room 101; both directions of unauthorized reads/updates/deletes return 404; request hotelId injection cannot change ownership.
- Concurrent check-in creates one stay; duplicate guest, overlapping bookings, cancellation release, checkout boundary, and concurrent overpayment checks remain real MongoDB tests.
- Running application on port 7000: all 16 authenticated reads checked returned 200 (`Server/runtime-smoke.json`). These used a short-lived server-signed token for the existing account; no production account credentials were changed. Login lifecycle was verified in the isolated backend integration suite.
- Current seven application documents pass shared ownership/reference audit (`Server/shared-database-audit.json`).
- Frontend build succeeds. Frontend tests: **258 passed, 3 failed**. Existing failures concern dashboard day boundaries and invoice event propagation; tests were not weakened.
- Dedicated test database is absent after teardown (`Server/final-databases.json`). No legacy or unrelated databases were deleted in this session.

## Data audit and outstanding migration evidence

| Database | Collection/data | Count | Migration status |
| --- | --- | ---: | --- |
| explore_pakistan | accounts | 1 | Current target record exists |
| explore_pakistan | hotels | 1 | Current target record exists |
| explore_pakistan | hotelprofiles | 1 | Valid hotel ownership |
| explore_pakistan | hotelpolicies | 1 | Valid hotel ownership |
| explore_pakistan | roomtypes | 1 | Valid hotel ownership |
| explore_pakistan | amenities | 1 | Valid hotel ownership |
| explore_pakistan | departments | 1 | Valid hotel ownership |
| explore_pakistan_platform | Source unavailable | Unknown | Already absent; requires backup/audit comparison |
| hotel_6ac0e125598170846576df1b | Source unavailable | Unknown | Already absent; requires backup/audit comparison |
| hotel_pms_platform | accounts | 0 | Empty; preserved pending complete migration verification |

Rooms, guests, reservations, stays, invoices, payments and operational collections currently contain zero production documents. Their original counts cannot be reconstructed from the absent databases. Do not claim complete data migration or remove remaining legacy databases without resolving this evidence gap.

## Outstanding frontend work

The existing guest list uses the API, but complete frontend compatibility is not established. Login still accepts the hardcoded admin account/local approval records. Dashboard, room inventory, reservations, check-in/out, billing and housekeeping still call browser-local stores. Staff services also seed mock data. API service files exist but are not wired into these operational flows. The API client's default port is 5000 while this application's configured backend port is 7000.

Finish API integration while retaining existing layouts, and replace browser-only authentication. Then verify each requested frontend workflow against shared database records; a successful build alone is insufficient. No frontend PASS is claimed.

The missing source backup/audit path was requested from the user. Overall status remains **FAIL** until data preservation and frontend workflows are actually verified.
