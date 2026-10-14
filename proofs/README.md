# Proof status

Live deployment and receipt links will be added after successful execution, finality and source/state verification. No distributed-consensus outcome is claimed by this initial source publication.

## Retained initial attempt

The [initial deployment](https://explorer-studio.genlayer.com/tx/0x239be49bf7f66d44a0cd50b65dc6c9cefa17c3e4b71be54e7131150aeda6c6bd) succeeded at `0x502d5eb847C3d7Ef5722376aDE440bB9743F9E51`, but its [activation](https://explorer-studio.genlayer.com/tx/0x4512890d32988339acaae23bd101efd9020db1b11a8dd5a6177410d5e6d11adb) finalized with ERROR / MAJORITY_DISAGREE (0 agree, 3 disagree, 2 idle). The parser rejected a cited paragraph for an UNKNOWN decision with `[LLM_ERROR] Unknown requires absence marker`. This is a rejected activation, not a successful policy compilation. [Original deployment receipt](rejected-initial/deployment-receipt.json) · [Rejected activation receipt](rejected-initial/activate-receipt.json) · [Failed workflow](https://github.com/mohammadisina1988-jpg/share-fuse/actions/runs/38524065890).

The corrected parser accepts a bounded source paragraph for explicit uncertainty, while requiring the full-source validator audit to substantively verify that anchor. Absence/contextual contradiction may use -1. Decisions still require exact independent agreement. Source changed, so the corrected contract requires a fresh deployment.
