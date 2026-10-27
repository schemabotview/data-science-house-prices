import type { SceneModel } from '@graphlearning/graphl-flow'
import { setupVenv } from './venv'
import { setupNotebook } from './notebook'
import { setupFirstCells, setupDataframe, setupStale, setupNumpy } from './cells'

export const setupScenes: Record<string, SceneModel> = {
  'setup-venv': setupVenv,
  'setup-notebook': setupNotebook,
  'setup-first-cells': setupFirstCells,
  'setup-dataframe': setupDataframe,
  'setup-stale': setupStale,
  'setup-numpy': setupNumpy,
}
