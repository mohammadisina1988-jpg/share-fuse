# Proof status

Prior deployments succeeded, but all retained activation attempts below were rejected. The latest source has 51 direct tests and awaits accepted activation and reservation proofs. A finalized deployment alone does not establish a usable active policy.

## Current deployment: activation pending

The corrected source at commit `978b0c6d548d810831cf6c554e834f5aaa2add7b` deployed to **`0x865378335f88bbe0FaF97f7825be72DDaa0eef75`** on gasless StudioNet (chain 61999). [Deployment transaction](https://explorer-studio.genlayer.com/tx/0xb787b80e35f24a5c14cf93a2879487933b915059d434cc5dbd45c252bf427bd5) finalized with SUCCESS / MAJORITY_AGREE, 5 agree and no dissent or idle votes. The downloaded contract bytes exactly match local source SHA-256 `d7cd606ce81bd7815c4f4654cdbb719d26c7eff1d832ed3a92299e6ec866882b`.

[Deployment metadata](deployment.json) · [Full receipt](deployment-receipt.json) · [Initial onchain state](initial-state.json).

Activation transaction `0x7a32131f317ccadd3e6cedd44624fd79ccf04bc35e09436fc30f66cb12ef5862` is pending. Successful activation and reservation proofs are not yet claimed.

## Retained batched-version attempts

Source commit `c23faae11ce6a354fbd174ab8dac7769175dfefa` deployed successfully through both CLI paths:

- Local contract `0x73D5a6B7312cAf0Cdb65eE209432aA226e3ca818`: [deployment](https://explorer-studio.genlayer.com/tx/0x77d486c4e440d4fe6676aee980e63ff1809225df168b8aebe1bd7f60dbf1f2a6), [rejected activation](https://explorer-studio.genlayer.com/tx/0x3bbb9533a190a1e93265d1ca813a80dcf023f4016786c02ed8496d17df4b8281), [full receipt](rejected-local-77d486c4/activate-receipt.json).
- [Workflow 38782865870](https://github.com/mohammadisina1988-jpg/share-fuse/actions/runs/38782865870), contract `0xB673eEb63E32F50Bbd4F49B1A497812e182bE218`: [deployment](https://explorer-studio.genlayer.com/tx/0x220ceaebd564dd2c79365b6e13f414140cc994cf79ae43f16a845f0f38260573), [rejected activation](https://explorer-studio.genlayer.com/tx/0xb197b7082d90bf661ee132cc55a0ef67533a084cc5a7ee6256ce205edc992a7b), [full receipt](rejected-38782865870/activate-receipt.json).

Both activations finalized with MAJORITY_DISAGREE (0 agree, 3 disagree, 2 idle). Diagnostics show independent misclassification of field combinations 9, 10, 13 and 14; one cloud validator also rejected the material-anchor audit. The next source supplies identical classification prompts to both phases and exhaustive field-ID lists, with definitions separately available to classification and audit. Exact agreement and substantive audit remain required. These records are diagnostic failures, not successful activation proofs.

## Retained initial attempt

The [initial deployment](https://explorer-studio.genlayer.com/tx/0x239be49bf7f66d44a0cd50b65dc6c9cefa17c3e4b71be54e7131150aeda6c6bd) succeeded at `0x502d5eb847C3d7Ef5722376aDE440bB9743F9E51`, but its [activation](https://explorer-studio.genlayer.com/tx/0x4512890d32988339acaae23bd101efd9020db1b11a8dd5a6177410d5e6d11adb) finalized with ERROR / MAJORITY_DISAGREE (0 agree, 3 disagree, 2 idle). The parser rejected a cited paragraph for an UNKNOWN decision with `[LLM_ERROR] Unknown requires absence marker`. This is a rejected activation, not a successful policy compilation. [Original deployment receipt](rejected-initial/deployment-receipt.json) · [Rejected activation receipt](rejected-initial/activate-receipt.json) · [Failed workflow](https://github.com/mohammadisina1988-jpg/share-fuse/actions/runs/38524065890).

The corrected parser accepts a bounded source paragraph for explicit uncertainty, while requiring the full-source validator audit to substantively verify that anchor. Absence/contextual contradiction may use -1. Decisions still require exact independent agreement. Source changed, so the corrected contract requires a fresh deployment.

## Retained second attempt

[Workflow 38525142705](https://github.com/mohammadisina1988-jpg/share-fuse/actions/runs/38525142705) deployed `0x3E7114876Efb196ABAb49a1d36814F88d28F3384`, but [activation](https://explorer-studio.genlayer.com/tx/0x73e5886e9cfdce11e9f4d1bb855f7901c2c01ed6c17d1bf113012599652ef313) finalized with MAJORITY_DISAGREE (0 agree, 3 disagree, 2 idle). The leader completed its evaluation; that does not establish accepted consensus. The receipt did not identify which validator check rejected the result. [Deployment receipt](rejected-38525142705/deployment-receipt.json) · [Activation receipt](rejected-38525142705/activate-receipt.json). The next version retains exact independent decision comparison and adds public-source diagnostics to distinguish shape, decision and anchor-audit failures.

## Retained diagnostic activation

[Workflow 38716792538](https://github.com/mohammadisina1988-jpg/share-fuse/actions/runs/38716792538) passed 48 direct tests and lint. Its [activation](https://explorer-studio.genlayer.com/tx/0xce267797ec2a3ad43700eda89e7906f5fc28de379af8255a40fac3bba0124ba3) nevertheless finalized with MAJORITY_DISAGREE (0 agree, 3 disagree, 2 idle). [Validator diagnostics](rejected-38716792538/activate-receipt.json) identify independent decision mismatches on masks 6 (contact/location) and 10 (contact/shift), before the anchor audit. The corrected version classifies batches of at most five bundles, explicitly applies general permission when no complete overriding combination matches, and retains exact comparison and full-source audit. Regression tests reject disagreements on both observed masks. This rejected receipt is not an accepted activation proof.

## Retained shell argument failure

A separate [CLI deployment attempt](https://explorer-studio.genlayer.com/tx/0x31fff2061345685258d1b231a92f3ac45a2416121df10c84875b4af6362bb871) finalized with ERROR / MAJORITY_AGREE (3 agree, 0 disagree, 2 idle). Shell argument splitting corrupted the constructor arguments. It is a failed constructor, not a working deployment, regardless of the CLI's success banner. [Receipt](rejected-direct-deployment/deployment-receipt.json). The proof runner passes arguments as a process argument array to avoid that shell failure.
