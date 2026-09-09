import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { Loader } from '@deepseek-ai/cordis-plugin-loader'
import DshCordis, { Config } from '../src/index.mjs'
import { createEnginePatches } from '../src/composition.mjs'

test('rejects malformed configuration before activation', () => {
  assert.ok(Config['~standard'].validate({ telemetry: 'yes' }).issues)
  assert.ok(Config['~standard'].validate({ patches: 'bad' }).issues)
  assert.ok(Config['~standard'].validate({ unknown: true }).issues)
})

test('preserves base capabilities and resolves all installed entry modules', () => {
  const rows = createEnginePatches({}).flatMap(p => p.insert ?? [])
  for (const id of ['agent', 'agent-loop', 'session', 'tools', 'goal', 'plan-mode', 'agent-presets']) {
    assert.ok(rows.some(row => row.id === id), id)
  }
  for (const row of rows) assert.match(row.name, /^file:/)
})

test('engine waits for a Loader without creating another root', async () => {
  const ctx = new Context()
  try {
    const fiber = ctx.plugin(DshCordis, {})
    await fiber
    assert.equal(ctx.get('agents'), undefined)
  } finally {
    await ctx.fiber.dispose()
  }
})

test('native services mount through real Loader and leave the host alive on removal', async () => {
  const ctx = new Context()
  await ctx.plugin(Loader)
  // Exercise the real engine export and real native services; leave external
  // storage, credentials and network providers disabled in this unit scenario.
  const keep = new Set(['session', 'llm', 'tools', 'system-prompt', 'commands', 'typert', 'agent'])
  const patches = createEnginePatches({}).flatMap(p => p.insert ?? [])
    .filter(row => !keep.has(row.id)).map(row => ({ id: row.id, disabled: true }))
  let activations = 0
  let disposals = 0
  const consumer = ctx.plugin({
    inject: ['sessions', 'tools', 'agents'],
    apply(owner) { activations++; owner.effect(() => () => { disposals++ }) },
  })
  try {
    await consumer
    assert.equal(activations, 0)
    for (let i = 0; i < 3; i++) {
      await ctx.loader.create({ id: 'dsh-engine', name: new URL('../src/index.mjs', import.meta.url).href, config: { patches } })
      await ctx.loader.await()
      await consumer
      assert.equal(activations, i + 1)
      assert.ok(ctx.get('sessions'))
      assert.ok(ctx.get('tools'))
      await ctx.loader.remove('dsh-engine')
      await consumer
      assert.equal(disposals, i + 1)
      assert.equal(ctx.get('sessions'), undefined)
      assert.equal(ctx.get('tools'), undefined)
      assert.ok(ctx.get('loader'))
    }
    assert.equal(activations, 3)
    assert.equal(disposals, 3)
  } finally {
    await ctx.fiber.dispose()
  }
})
