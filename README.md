# dsh-cordis

`dsh-cordis` packages the DeepSeek Harness coding engine as a Cordis plugin.
It mounts the DSH base composition into the caller's existing Loader tree: native
agents, durable sessions, model adapters, tools, goals, plan mode, approvals,
and packaged agent presets.

It does not construct another Cordis root. Its Fiber owns the included DSH tree,
so disabling or replacing its Loader entry removes its live services and lets
consumers enter `PENDING` until another provider becomes available.

## Install

```sh
pnpm add dsh-cordis @deepseek-ai/cordis@4.0.1
```

## Compose

Use a stable Loader row in a host that already provides `loader`:

```yaml
- id: dsh-engine
  name: dsh-cordis
  config:
    telemetry: false
```

`telemetry` defaults to `false`. The host remains responsible for `DSH_HOME`,
credentials, model selection, UI, and any ACRYL engine-selection contract.

## Lifecycle

The package supplies native DSH service providers. A consumer should inject the
specific service it needs—for example `sessions`, `agents`, or `tools`—instead
of importing this package's implementation. Removing the `dsh-engine` row
withdraws those providers through normal Cordis lifecycle disposal.

## Engineering principles

`dsh-cordis` is deliberately small at its public boundary and substantial behind
it. The package carries the DSH engine composition; the host receives ordinary
Cordis services rather than an engine-specific global singleton.

- **Stable capability boundaries.** Consumers ask for `sessions`, `agents`,
  `tools`, and other service contracts. They do not import a concrete DSH
  provider to obtain those capabilities.
- **Dependencies made explicit.** A plugin declares what it requires. Missing
  dependencies remain pending instead of being hidden behind startup ordering
  assumptions or timing retries.
- **One owner for every live contribution.** Loader entries, service providers,
  listeners, timers, subprocesses, and subscriptions belong to a Fiber. The
  owner also owns their cleanup.
- **Reversible runtime changes.** Removing the engine entry withdraws its live
  DSH services and registrations. A replacement can activate against the same
  host without retained provider references or duplicate contributions.
- **Configuration is composition.** Stable Loader IDs select the engine and its
  configuration. Changing a deployment choice does not require scattering
  provider switches through application code.
- **Durable facts stay durable.** Sessions and replay-critical work are owned
  by the DSH session model. Live events coordinate a running process; they are
  not treated as the only record of work.
- **Complexity stays at the edge.** The package absorbs DSH composition,
  dependency resolution, and lifecycle mechanics, leaving callers with a
  smaller service-oriented surface.
- **Replacement is tested, not assumed.** The release tests cover missing
  dependencies, real Loader activation, provider removal, and repeated
  activation with the host still alive.

These are practical constraints on the package, not slogans: the source and
tests are organized around them so an engine can be installed, used, removed,
and replaced without changing the rest of the host's architecture.

## Source and provenance

The repository includes `deepseek-harness/` as a pinned Git submodule from
<https://github.com/deepseek-ai/deepseek-harness>. It is the source reference
for the wrapped engine. `pnpm run upstream:sync` restores its recorded pin;
`pnpm run upstream:update` deliberately advances it to upstream and leaves the
new gitlink for review and commit. Published DSH dependencies stay version-pinned
until that source update has been tested and released in a new `dsh-cordis`
version. The extracted composition, presets, licenses, and exact source records
are in [`provenance.json`](./provenance.json).

The submodule is not loaded as a second runtime. `dsh-cordis` wraps the matching
published DeepSeek Harness packages as one Cordis plugin in the host's existing
plugin tree.

This is the first DSH engine package for ACRYL's future selectable engine host.
It does not yet provide Pi integration, engine switching commands, or
cross-engine session translation.
