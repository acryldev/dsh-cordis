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

## Source and provenance

The repository includes `deepseek-harness/` as a pinned Git submodule for
source inspection. Published DSH dependencies are pinned to `0.1.5-alpha.1`.
The extracted composition, presets, licenses, and exact source records are in
[`provenance.json`](./provenance.json).

This is the first DSH engine package for ACRYL's future selectable engine host.
It does not yet provide Pi integration, engine switching commands, or
cross-engine session translation.
