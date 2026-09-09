import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { load } from 'js-yaml'
import { applyEntryPatches, entryListSchema } from '@deepseek-ai/cordis-plugin-include'

const require = createRequire(import.meta.url)
const base = load(readFileSync(new URL('../composition/base.patch.yml', import.meta.url), 'utf8'), { schema: entryListSchema })

/** Copy of ACRYL's coding composition, with package-local shipped presets. */
export function createEnginePatches({ patches = [], telemetry = false } = {}) {
  const defaults = [
    { id: 'system-prompt', config: { persona: 'You are a coding agent powered by the {{model}} model. Your working directory is {{cwd}}.' } },
    { id: 'session-telemetry-otel', disabled: !telemetry },
    { insert: [
      { id: 'agent-presets', name: '@deepseek-ai/dsh-agent-presets', config: {
        default: 'standard',
        roots: [{ path: fileURLToPath(new URL('../presets/', import.meta.url)), trust: 'system' }],
        includeShippedRoot: false, includeUserRoot: true,
      } },
      { id: 'session-stats', name: '@deepseek-ai/dsh-session-stats' },
      { id: 'authorization', name: '@deepseek-ai/dsh-authorization' },
    ] },
  ]
  const rows = applyEntryPatches([], [...base, ...defaults, ...patches], (message) => {
    throw new Error(`dsh-cordis: unmatched composition patch: ${message}`)
  })
  // Preserve Cordis config expressions; resolve module locations only. This
  // also works when the Loader lives in a different isolated pnpm package.
  function resolveRows(entries) {
    return entries.map(row => ({
      ...row,
      name: row.name.startsWith('cordis:') || row.name.startsWith('file:')
        ? row.name : pathToFileURL(require.resolve(row.name)).href,
      ...(row.group && Array.isArray(row.config) ? { config: resolveRows(row.config) } : {}),
    }))
  }
  return [{ insert: resolveRows(rows) }]
}
