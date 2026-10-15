# Proof status

Live deployment and receipt links will be added after successful execution, finality and source/state verification. No distributed-consensus outcome is claimed by this initial source publication.

## Retained initial attempt

The [initial deployment](https://explorer-studio.genlayer.com/tx/0x239be49bf7f66d44a0cd50b65dc6c9cefa17c3e4b71be54e7131150aeda6c6bd) succeeded at `0x502d5eb847C3d7Ef5722376aDE440bB9743F9E51`, but its [activation](https://explorer-studio.genlayer.com/tx/0x4512890d32988339acaae23bd101efd9020db1b11a8dd5a6177410d5e6d11adb) finalized with ERROR / MAJORITY_DISAGREE (0 agree, 3 disagree, 2 idle). The parser rejected a cited paragraph for an UNKNOWN decision with `[LLM_ERROR] Unknown requires absence marker`. This is a rejected activation, not a successful policy compilation. [Original deployment receipt](rejected-initial/deployment-receipt.json) · [Rejected activation receipt](rejected-initial/activate-receipt.json) · [Failed workflow](https://github.com/mohammadisina1988-jpg/share-fuse/actions/runs/38524065890).

The corrected parser accepts a bounded source paragraph for explicit uncertainty, while requiring the full-source validator audit to substantively verify that anchor. Absence/contextual contradiction may use -1. Decisions still require exact independent agreement. Source changed, so the corrected contract requires a fresh deployment.

## Retained second attempt

[Workflow 38525142705](https://github.com/mohammadisina1988-jpg/share-fuse/actions/runs/38525142705) deployed `0x3E7114876Efb196ABAb49a1d36814F88d28F3384`, but [activation](https://explorer-studio.genlayer.com/tx/0x73e5886e9cfdce11e9f4d1bb855f7901c2c01ed6c17d1bf113012599652ef313) finalized with MAJORITY_DISAGREE (0 agree, 3 disagree, 2 idle). The leader completed its evaluation; that does not establish accepted consensus. The receipt did not identify which validator check rejected the result. [Deployment receipt](rejected-38525142705/deployment-receipt.json) · [Activation receipt](rejected-38525142705/activate-receipt.json). The next version retains exact independent decision comparison and adds public-source diagnostics to distinguish shape, decision and anchor-audit failures.

## Retained diagnostic activation

[Workflow 38716792538](https://github.com/mohammadisina1988-jpg/share-fuse/actions/runs/38716792538) passed 48 direct tests and lint. Its [activation](https://explorer-studio.genlayer.com/tx/0xce267797ec2a3ad43700eda89e7906f5fc28de379af8255a40fac3bba0124ba3) nevertheless finalized with MAJORITY_DISAGREE (0 agree, 3 disagree, 2 idle). [Validator diagnostics](rejected-38716792538/activate-receipt.json) identify independent decision mismatches on masks 6 (contact/location) and 10 (contact/shift), before the anchor audit. The corrected version classifies batches of at most five bundles, explicitly applies general permission when no complete overriding combination matches, and retains exact comparison and full-source audit. Regression tests reject disagreements on both observed masks. This rejected receipt is not an accepted activation proof.

## Retained shell argument failure

A separate [CLI deployment attempt](https://explorer-studio.genlayer.com/tx/0x31fff2061345685258d1b231a92f3ac45a2416121df10c84875b4af6362bb871) finalized with ERROR / MAJORITY_AGREE (3 agree, 0 disagree, 2 idle). Shell argument splitting corrupted the constructor arguments. It is a failed constructor, not a working deployment, regardless of the CLI's success banner. [Receipt](rejected-direct-deployment/deployment-receipt.json). The proof runner passes arguments as a process argument array to avoid that shell failure.
