import { Include } from '@deepseek-ai/cordis-plugin-include'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { z } from 'zod'
import { createEnginePatches } from './composition.mjs'

export const name = 'dsh-cordis'
export const inject = ['loader']
export const Config = z.object({
  patches: z.array(z.record(z.string(), z.unknown())).default([]),
  telemetry: z.boolean().default(false),
}).strict().transform(config => ({
  path: new URL('../composition/empty.json', import.meta.url).href,
  patches: createEnginePatches(config),
}))

// The packaged empty root is immutable. Persist configuration through the
// containing Loader row, never inside node_modules.
export default class DshCordis extends Include {
  static name = name
  static inject = inject
  static Config = Config

  constructor(ctx, config) {
    super(ctx.extend({ dshHomePath }), config)
  }

  write() { this.context.emit('loader/config-update') }
}
