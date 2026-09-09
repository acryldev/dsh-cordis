# DSH Cordis extraction

Date: 2026-09-09. Authorized copy-only extraction from ACRYL, followed by GitHub,
npm and ACRYL Store publication. DSH 0.1.5-alpha.1, Cordis 4.0.1.

## Capability and plugin boundary

Package the DSH base engine composition and ACRYL coding defaults as one normal
Cordis plugin. Copy base YAML and preset assets with provenance. Keep upstream
implementation in pinned npm dependencies. ACRYL source and all three surfaces
remain intact. This package is the DSH provider contribution; ACRYL's future
engine-neutral service/swap contract and pi-cordis are separate integration work.

## Provides and consumes

Hard inject loader. Mount an owned Include subtree in the supplied Context,
providing native agents, sessions, tools, llm, goals and related DSH capabilities.
Consumers inject native service contracts; no private engine registry or new root.
The host owns DSH_HOME, credentials, model selection and terminal/browser UI.

## Effects and disposal

Cordis owns the child Include Fiber and its child plugins. Include disposes the
tree; each DSH provider owns its existing effects. No boot(), process handlers,
environment mutation, hidden timers, or detached root. Verify repeated disposal,
consumer reactivation and actual prompt cancellation before publication.

## Configuration and composition

Validated config provides an array of ordinary Include patches and an explicit
telemetry opt-in (default false). Stable Loader id dsh-engine. Preserve upstream
ids inside the subtree. Resolve imported packages against this package, not a
global node_modules. Configuration changes use Fiber restart and parent Loader
reconciliation. Do not modify packaged composition files during runtime.

## Events and durability

Reuse native DSH typed/live events and durable session persistence. No duplicate
event bus, writer, or transcript. Unload releases live effects, not saved history.
No claim of cross-engine session translation or provider cache-hit guarantees.

## Verification and release

Test missing Loader/PENDING, real Loader activation, native services/tools,
prompt via a mock LLM, cancellation, unload/reactivation, malformed config,
package-relative resolution and clean tarball install. Package metadata must
validate against ACRYL discovery. Inspect npm pack files before public publish.
Push main; publish npm dsh-cordis; refresh and verify Store catalog discovery.
