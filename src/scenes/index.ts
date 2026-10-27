import type { SceneModel } from '@graphlearning/graphl-flow'
import { setupScenes } from './setup'
import { selectScenes } from './select'
import { cleanScenes } from './clean'
import { shapeScenes } from './shape'
import { seeScenes } from './see'
import { measureScenes } from './measure'
import { featuresScenes } from './features'
import { modelScenes } from './model'

// Scene registry. Sections reference scenes by id; scenes are grouped by course (one folder each,
// mirroring src/content). Ids are globally unique: a duplicate THROWS rather than shadowing.
const GROUPS: Record<string, SceneModel>[] = [setupScenes, selectScenes, cleanScenes, shapeScenes, seeScenes, measureScenes, featuresScenes, modelScenes]

export const SCENES: Record<string, SceneModel> = {}
for (const group of GROUPS)
  for (const [id, scene] of Object.entries(group)) {
    if (id in SCENES) throw new Error(`scene id "${id}" is registered twice`)
    SCENES[id] = scene
  }

export function getScene(id: string): SceneModel | undefined {
  return SCENES[id]
}
