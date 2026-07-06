# Offline-First Work Order Enhancement Tickets

## Goal

Enable a sales representative to generate, submit, upload, and initiate e-sign for a Work Order even when the Project was created offline and does not yet have `itemIdFromServer`.

The work is split so two developers can contribute independently:

- Developer A owns Work Order generation/submission behavior and deferred business actions.
- Developer B owns sync queue infrastructure, blocked commit unblocking, and background recovery.

## Delivery Strategy

Phase 1 should avoid backend changes. Keep current server-generated `itemIdFromServer` behavior, but make downstream Work Order actions durable until the Project receives that server ID.

Phase 2 can introduce client-generated UUIDs with backend support. That is intentionally separated because it changes API identity semantics.

---

## Epic 1: Work Order Offline Submission Flow

Owner: Developer A

### Ticket WO-1: Add Work Order Submit Mode

Priority: P1

Problem:
The Work Order flow currently behaves as online/offline blocked. Offline should not stop the workflow; it should switch to deferred submission.

Scope:
- Add `WorkOrderSubmitMode` with:
  - `onlineImmediate`
  - `offlineDeferred`
- Replace the connectivity gate with mode-aware execution.
- Ensure online behavior remains unchanged when network and Project server ID are available.
- Ensure offline mode continues after local validation.

Acceptance Criteria:
- When online with `itemIdFromServer`, Work Order submits immediately.
- When offline or missing `itemIdFromServer`, Work Order continues in deferred mode.
- No user-facing flow exits early only because connectivity is unavailable.
- UI messaging clearly says the Work Order is saved locally and will sync later.

Test Scope:
- Unit test mode selection for online, offline, and missing server ID.
- Widget/integration test for tapping Work Order while offline.
- Regression test for existing online immediate submission.

---

### Ticket WO-2: Split Contract Generation From Submission

Priority: P1

Problem:
Generation, upload, and e-sign are currently coupled. A missing server ID blocks downstream steps and can prevent durable sync tasks from being created.

Scope:
- Split current workflow into:
  - `generateWorkOrderContract()`
  - `submitWorkOrderContract(mode)`
- Persist generated PDF/contract metadata locally before upload is attempted.
- Make generation a pure local operation.
- Make submission responsible only for queueing/upload/e-sign behavior.

Acceptance Criteria:
- Contract/PDF generation succeeds without connectivity.
- Generated contract metadata is saved locally before any network call.
- Upload failure does not invalidate or delete the locally generated contract.
- Existing online path still generates and uploads in one user flow.

Test Scope:
- Unit test generation does not require `itemIdFromServer`.
- Local persistence test for generated contract metadata.
- Failure test: upload unavailable, generated contract remains available locally.

---

### Ticket WO-3: Queue Deferred Contract Upload

Priority: P1

Problem:
When Project server ID is missing, contract upload currently skips or returns no requests. This can mark work as complete while nothing was uploaded.

Scope:
- When contract upload cannot execute because parent Project has no `itemIdFromServer`, create a deferred commit instead of returning an empty request list.
- Store:
  - deferred commit type: `contractUpload`
  - `blockedOnParentIsarId`
  - local contract/PDF reference
  - status: `blocked`
  - retry metadata
- Ensure upload resumes when the deferred commit is promoted by sync infrastructure.

Acceptance Criteria:
- Missing Project server ID creates a durable blocked upload commit.
- The commit is not marked complete until upload succeeds.
- Contract upload eventually executes after Project sync provides server ID.
- Failed upload remains visible/retriable and does not silently disappear.

Test Scope:
- Unit test `collectRequests()` creates blocked commit when parent ID is missing.
- Integration test Project created offline -> Work Order generated -> upload commit blocked.
- Integration test Project sync success -> upload commit promoted -> upload request executes.

---

### Ticket WO-4: Queue Deferred E-Sign Initiation

Priority: P1

Problem:
E-sign initiation is skipped when Project server ID is missing, so customers may never receive signing requests.

Scope:
- Introduce a committable/deferred task like `PendingESignInitiate`.
- Persist all e-sign initiation payload data locally.
- Block the task on parent Project server ID.
- Execute automatically after the parent Project syncs and contract upload prerequisites are satisfied.

Acceptance Criteria:
- E-sign initiation creates a durable pending task when Project server ID is missing.
- The task is not discarded if offline.
- E-sign initiates automatically after required IDs are available.
- User can see that e-sign is pending/deferred.

Test Scope:
- Unit test pending e-sign task serialization and persistence.
- Integration test offline Work Order with e-sign selected.
- Integration test unblocked Project triggers e-sign request after sync.

---

### Ticket WO-5: Offline Work Order Preflight Behavior

Priority: P2

Problem:
Server reconciliation/preflight should not block offline Work Order generation. Offline mode can only rely on local validation.

Scope:
- In `offlineDeferred` mode, skip server reconciliation calls such as `ContractPdfSync`.
- Run only deterministic client-side validation.
- Keep online preflight behavior intact until deterministic pricing work is complete.
- Show clear UI state that server reconciliation will happen during sync.

Acceptance Criteria:
- Offline mode does not call server preflight endpoints.
- Offline mode can generate and persist the contract after local validation passes.
- Online mode still performs existing reconciliation.
- User receives a non-blocking sync-pending message.

Test Scope:
- Unit test offline mode does not call network preflight service.
- Integration test offline Work Order completion with local validation only.
- Regression test online preflight still runs.

---

## Epic 2: Deferred Commit Queue Infrastructure

Owner: Developer B

### Ticket SYNC-1: Extend Commit Model With Blocked Status

Priority: P1

Problem:
The queue needs a first-class state for work that is valid but cannot execute until a parent entity receives a server ID.

Scope:
- Add `CommitStatus.blocked`.
- Add `blockedOnParentIsarId`.
- Ensure deferred commits store:
  - local ID
  - status
  - parent local ID
  - type
  - payload/reference
  - retry/error fields
- Update queue queries to exclude blocked commits from normal execution.

Acceptance Criteria:
- Blocked commits persist across app restarts.
- Blocked commits are not executed by the normal queue processor.
- Existing `inQueue`, `inProgress`, `done`, and `failed` behavior is unchanged.
- Migration/backward compatibility is handled for existing queue rows.

Test Scope:
- Model serialization/deserialization test.
- Migration/default-value test for old commit records.
- Queue selection test excludes blocked commits.

---

### Ticket SYNC-2: Add Blocked Commit Queries And Atomic Promotion

Priority: P1

Problem:
Deferred commits must be discoverable and safely promoted when their parent Project becomes sync-ready.

Scope:
- Add `findBlockedByParent(parentIsarId)`.
- Add `findUnblockableCommits()` for safety scanning.
- Add atomic status transition:
  - only `blocked -> inQueue`
  - no-op if status already changed
- Ensure duplicate push/pull promotion cannot enqueue the same commit twice.

Acceptance Criteria:
- Query returns only blocked commits for the requested parent.
- Promotion is idempotent.
- Race between push hook and pull scanner does not duplicate queue execution.
- Promoted commits wake or notify the queue processor.

Test Scope:
- Unit test `findBlockedByParent`.
- Unit test atomic blocked-to-inQueue promotion.
- Race/idempotency test: promote same item twice.

---

### Ticket SYNC-3: Add Post-Project-Sync Promotion Hook

Priority: P1

Problem:
After Project sync succeeds and `itemIdFromServer` is saved, blocked child commits must be promoted immediately.

Scope:
- In sync result handling, after Project POST/PUT success writes `itemIdFromServer`, call a hook like `unblockDeferredItems(parentIsarId)`.
- Promote all blocked child commits for that Project.
- Notify queue processor to resume processing.
- Log promotion result for debugging.

Acceptance Criteria:
- Project sync success immediately promotes blocked child commits.
- Contract upload/e-sign commits blocked on that Project move to `inQueue`.
- Queue processor runs without waiting for the next manual action.
- If Project sync fails, child commits remain blocked.

Test Scope:
- Integration test Project sync success promotes child commits.
- Failure test Project sync error leaves children blocked.
- Multi-project test only promotes children for the matching parent.

---

### Ticket SYNC-4: Add Pull Scanner Safety Net

Priority: P1

Problem:
The push hook may be missed if the app is killed, lifecycle changes occur, or a bug interrupts promotion.

Scope:
- Implement `scanAndUnblockDeferred()`.
- Run scanner:
  - on app foreground resume
  - before each sync cycle starts
  - optionally every 30-60 seconds while app is active
- Query blocked commits whose parent now has `itemIdFromServer`.
- Promote them atomically.

Acceptance Criteria:
- Blocked commits recover on next app resume if push hook was missed.
- Scanner is cheap and only checks blocked commits.
- Scanner can run repeatedly without duplicate promotion.
- Queue is notified when scanner promotes work.

Test Scope:
- Unit test scanner finds unblockable commits.
- Integration test app restart/resume recovers blocked upload.
- Idempotency test scanner repeated runs do not duplicate work.

---

### Ticket SYNC-5: Failed Commit Visibility And Recovery

Priority: P2

Problem:
4xx failures can mark commits failed forever while records remain unsynced and the user is unaware.

Scope:
- Add visible failed-sync state for Work Order-related deferred commits.
- Persist failure reason and last attempted time.
- Provide retry action or automatic retry rules where safe.
- Avoid marking failed commits as complete.

Acceptance Criteria:
- Failed contract upload/e-sign commits remain visible in local state.
- User or support can see failure reason.
- Safe retry path exists.
- Unsynced records are not silently stranded.

Test Scope:
- Unit test 4xx stores failure reason.
- Integration test failed upload appears as failed/pending resolution.
- Retry test moves failed commit back to queue when allowed.

---

## Epic 3: Pricing And Preflight Stabilization

Owner: Developer A, can start after WO-5

### Ticket PRICE-1: Define Deterministic Project Amount Calculator Contract

Priority: P2

Problem:
The 3-pass PDF preflight exists because local and server amounts drift. The long-term fix is a single deterministic calculation path.

Scope:
- Define a single calculator interface for Project totals, tax, add-ons, discounts, and down payment.
- Document all required inputs.
- Produce one `ProjectAmounts` result from the same inputs every time.
- Identify and mark current partial recalculation call sites.

Acceptance Criteria:
- Calculator contract is documented and testable.
- All amount fields needed for Work Order/PDF are included.
- Known existing partial recalculation paths are listed for replacement.

Test Scope:
- Golden test fixtures for common pricing scenarios.
- Edge case tests for add-ons, payment type change, tax rate change, and rounding tolerance.

---

### Ticket PRICE-2: Replace Work Order Amount Calculation With Deterministic Calculator

Priority: P2

Scope:
- Use the deterministic calculator before Work Order generation.
- Persist calculated `ProjectAmounts` locally.
- Reduce dependency on repeated server preflight retries.

Acceptance Criteria:
- Work Order PDF uses locally calculated deterministic amounts.
- Same inputs always generate same totals.
- Existing server tolerance check remains only as online safety validation.

Test Scope:
- PDF amount fixture tests.
- Regression tests for add-on and payment type changes.

---

## Epic 4: Future Identity Model

Owner: Backend + Client, separate phase

### Ticket ID-1: Backend Support For Client-Generated Project UUID

Priority: P3

Scope:
- Add API support for client-generated UUID as stable Project identity.
- Make Project creation idempotent by UUID.
- Return same server record for duplicate UUID submission.

Acceptance Criteria:
- Client can create Project UUID offline and sync it later.
- Repeated POST with same UUID is idempotent.
- Downstream contract/e-sign APIs can reference UUID or mapped server identity.

Test Scope:
- Backend API tests for duplicate UUID POST.
- Contract upload by UUID/mapped ID tests.

---

### Ticket ID-2: Client Migration To UUID-Based Identity

Priority: P3

Scope:
- Generate UUID for Project at local creation time.
- Store UUID alongside current IDs during transition.
- Update downstream deferred tasks to reference UUID where supported.
- Maintain compatibility with old records.

Acceptance Criteria:
- Offline-created Projects have stable identity immediately.
- Existing Projects continue to sync.
- Contract upload/e-sign no longer depend on waiting for server-generated ID once backend support is available.

Test Scope:
- Migration test for old Project records.
- Offline Project creation test verifies UUID exists immediately.
- End-to-end retry/idempotency test.

---

## Suggested Two-Developer Sprint Split

### Developer A: Work Order Flow

Start with:
- WO-1 Add Work Order Submit Mode
- WO-2 Split Contract Generation From Submission
- WO-5 Offline Work Order Preflight Behavior

Then:
- WO-3 Queue Deferred Contract Upload
- WO-4 Queue Deferred E-Sign Initiation

Independent Test Harness:
- Mock connectivity service.
- Mock Project with and without `itemIdFromServer`.
- Mock local PDF/contract persistence.
- Assert generated local artifacts and deferred task creation.

### Developer B: Sync Infrastructure

Start with:
- SYNC-1 Extend Commit Model With Blocked Status
- SYNC-2 Add Blocked Commit Queries And Atomic Promotion

Then:
- SYNC-3 Add Post-Project-Sync Promotion Hook
- SYNC-4 Add Pull Scanner Safety Net
- SYNC-5 Failed Commit Visibility And Recovery

Independent Test Harness:
- Isar/local DB test with fake commit records.
- Fake Project sync result writer.
- Fake queue processor notification.
- Assert blocked -> inQueue promotion and idempotency.

## Integration Checkpoints

### Checkpoint 1: Contract Upload Deferred

Prerequisites:
- WO-2, WO-3
- SYNC-1, SYNC-2

Scenario:
1. Create Project offline.
2. Generate Work Order.
3. Verify contract upload commit is `blocked`.

### Checkpoint 2: Project Sync Unblocks Contract Upload

Prerequisites:
- WO-3
- SYNC-3

Scenario:
1. Start with Project and blocked contract upload.
2. Simulate Project sync success and server ID write.
3. Verify contract upload moves to `inQueue`.
4. Verify queue processor is notified.

### Checkpoint 3: App Restart Recovery

Prerequisites:
- SYNC-4

Scenario:
1. Create blocked upload/e-sign commits.
2. Simulate parent Project now has server ID.
3. Run scanner on app resume.
4. Verify blocked commits promote to `inQueue`.

### Checkpoint 4: Full Offline Work Order Completion

Prerequisites:
- WO-1 through WO-5
- SYNC-1 through SYNC-4

Scenario:
1. Create Project offline.
2. Generate Work Order offline.
3. Queue contract upload and e-sign as blocked.
4. Reconnect.
5. Project sync gets server ID.
6. Upload and e-sign execute automatically.
7. User sees completed/synced state.

## Definition Of Done For P1

- Offline Work Order generation is not blocked by connectivity or missing Project server ID.
- Contract upload is durably deferred when parent Project ID is missing.
- E-sign initiation is durably deferred when parent Project ID is missing.
- Blocked commits are promoted by push hook after Project sync.
- Pull scanner recovers missed promotions.
- No deferred Work Order action is marked complete without actually executing.
- P1 has unit tests for mode selection, deferred task creation, blocked queries, promotion, and scanner recovery.
- P1 has at least one end-to-end offline-to-online Work Order sync test.
