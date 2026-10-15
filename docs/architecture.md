# ShareFuse architecture

A publication gateway deploys one contract for one fixed dataset, pinning a full prose policy URL/SHA-256 and 2–4 field definitions. The deployer is the immutable controller. Anyone can activate the pinned policy; only the controller can reserve additional publication fields. No policy replacement, reset, recipient-specific ledger, certificate, or graph proposal exists.

## Consensus boundary

Activation fetches the complete UTF-8 JSON document from a full commit-pinned raw GitHub URL. It checks HTTP status, byte size, SHA-256, duplicate keys and bounded source shape. The leader evaluates every nonempty subset of the configured fields. Each decision is ALLOW, DENY or UNKNOWN, with a material paragraph index for definite decisions. UNKNOWN may cite an explicit unresolved-permission clause; -1 denotes absence or unresolved contextual contradiction. Validators independently re-fetch and derive all decisions without the leader's answer in their extraction prompt. Every exact decision must match. A separate full-source audit checks every candidate paragraph anchor and every uncertainty decision, including substantive relevance of explicit UNKNOWN anchors. No confidence tolerance can cross the authorization threshold. Malformed LLM output never becomes policy. Known external failures require exact error agreement; transient failures may agree only with other transient failures; model errors force disagreement.

Storage is read into plain memory before nondeterminism. All state writes occur after the accepted result returns. The contract follows GenLayer's [nondeterministic execution boundary](https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism).

Classification uses batches of at most five bundles with the complete policy repeated in each prompt. Masks are row identifiers; explicit field membership determines which restrictions apply. General permission remains applicable when no overriding combination restriction matches. Batching reduces simultaneous classification load without relaxing exact validator agreement. The final table still requires every mask in order, and the separate full-source audit still checks the entire candidate table together.

Leader and validators receive byte-identical classification prompts, without phase or role labels. Each bundle lists exhaustive `published_field_ids`; definitions appear separately, so fields missing from a bundle cannot be mistaken for members. The independent anchor audit receives those definitions and the complete source as well. Live diagnostics from the earlier batched version exposed false restrictions on masks 9, 10, 13 and 14. Both its local and cloud rejection receipts are retained. Identical prompts improve task consistency; they do not replace independent execution, exact decision comparison or material-anchor verification.

## Composition algebra

The contract supports monotone risk policies. Every DENY decision blocks all supersets. Every UNKNOWN blocks all supersets unless a definite DENY applies. No extra disclosure can repair an earlier violation. The effective table is a conservative upward closure; a minimal blocker antichain and maximal safe frontier expose the composition boundary. If an UNKNOWN minimal blocker contains a larger definite prohibition, quotes retain an additional DENY witness. Exceptions that require publishing an extra field to make a forbidden subset safe are outside this monotone model.

Its consequential state is the irreversible union of authorized fields. Codename and contact are individually permitted. Reserving codename changes a later contact request to DENY because the cumulative union contains the forbidden pair. Reserving location then makes shift UNKNOWN under the unresolved pair rule.

## State and concurrency

`quote(requested)` evaluates the union with current authorization, returning masks, exact status and blockers. `reserve(expected_mask,requested)` requires the fixed controller, exact current-mask equality, at least one new field, and ALLOW. It then atomically advances the union and appends the authorization record. Every accepted update adds a field, so at most four updates can exist. Compare-and-swap prevents clients using approvals against obsolete state. Quote is a preview, never a reservation. All audiences and publisher addresses share one cumulative mask.

## Trust and scope

The registry authorizes a cooperating external publication gateway. It does not publish private content, prevent out-of-band disclosure, prove publication occurred, authenticate policy authors, or establish real privacy/anonymity. A gateway must wait for finalized successful reservation before publishing, and serialize its outputs with this ledger. Crashes after reservation can leave conservative over-accounting; there is deliberately no rollback. Unregistered contracts do not inherit enforcement automatically.

Policy and fixtures are public synthetic statements. SHA-256 and commit pins bind bytes, not truth or authority. The deployer chooses the trusted policy and field meanings; requesters cannot substitute a policy during activation. Exact model agreement may stall on ambiguous prose. The table is exponential and capped at four fields. Policy text has at most 12 paragraphs of 600 characters each within 10,000 source bytes. No funds or assets are held or transferred.

## Provenance

Contract state machine, lattice analysis, fixtures and tests are written for this primitive. Boolean subset closure and compare-and-swap are established techniques. Generic CLI process transport, ephemeral account bootstrap and Windows direct-test compatibility reuse operational scaffolding from ProbeMinimax; no earlier contract, solver or transaction proof is reused.
