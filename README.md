# ShareFuse

Standalone GenLayer composition firewall for cumulative publication authorization. Independently evaluating validators interpret a fixed source policy. The resulting Boolean permission lattice governs an irreversible publication union with compare-and-swap updates.

Individually permitted fields can form a forbidden bundle. UNKNOWN combinations remain blocked. All audiences share one ledger. Minimal blockers and maximal safe completions expose cumulative restrictions before a gateway reserves additional fields.

- [Pinned contract](contracts/share_fuse.py)
- [Consensus and trust boundaries](docs/architecture.md)
- [Fields](config/fields.json) and [synthetic policy](policies/publication.json)
- [Direct tests](tests/direct/test_fuse.py)
- [Transaction proofs](proofs/README.md)

## Interface

| Method | Behavior |
| --- | --- |
| Constructor `(policy_url,policy_sha256,fields_json)` | Pin one policy and 2–4 fields; deployer becomes controller |
| `activate()` | Independently fetch/interpret policy; freeze agreed lattice |
| `quote(requested)` | Evaluate proposed fields together with current authorization |
| `reserve(expected_mask,requested)` | Controller atomically adds only a safe, fresh field union |
| `get_state()` | Full source, decisions, lattice, history and safe frontier |

```sh
python -m pip install -r requirements-dev.txt
genvm-lint download --version v0.2.16
genvm-lint check contracts/share_fuse.py --json
python -m pytest tests/direct -q
node scripts/check-proof-checker.cjs
```

45 direct tests pass, including explicit validator callback replay. A separate set-containment oracle checks closure, minimal blockers and every current-state frontier over all 2,187 three-field ternary tables plus 128 four-field samples. Offline verifier tests reject six forged states/quotes. Direct tests use mocked web/LLM operations; distributed consensus requires the live workflow.

## Live reproduction

Dispatch **StudioNet proofs** to intentionally create a fresh gasless deployment with a disposable encrypted CLI account. It performs activation, safe reservations, stale-state rejection, forbidden and unknown composition rejection, no-op rejection and immutable-policy rejection. All 15 bundle quotes are read at three stages. A separate verifier checks fresh receipts, source bytes and final state. Only sanitized proofs are uploaded; signing material and journals are excluded. Keep the controller's encrypted account for continued local use. A disposable CI controller cannot be recovered after its runner is deleted; published proof deployments are demonstrations and intentionally have no further signing access.

For local use install CLI 0.39.2, select a dedicated unlocked account, set `GENLAYER_CLI_PATH` and `FUSE_ACCOUNT`, then run `node scripts/live-proof.cjs` and `node scripts/verify-proofs.cjs`. The runner journals known transaction hashes, and aborts ambiguous sends rather than blindly retrying. Partial recovery needs the original controller account and exact prior hashes; do not rerun a deleted CI account against an old deployment. Downloaded complete proof sets can be checked with `node scripts/verify-proofs.cjs --offline`.

This authorizes a cooperating publication gateway. It does not enforce out-of-band behavior, transmit private fields, or establish real privacy. Fixtures are synthetic; hashes prove document bytes. Policies must use monotone combination restrictions. See the architecture for irreversible reservation and gateway assumptions.

Generic CLI and test compatibility scaffolding is reused transparently. The contract and lattice mechanism are purpose-built; no prior receipt or contract is reused.
