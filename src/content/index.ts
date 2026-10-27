import { setup } from './setup'
import { select } from './select'
import { clean } from './clean'
import { shape } from './shape'
import { see } from './see'
import { measure } from './measure'
import { features } from './features'
import { model } from './model'
import { trust } from './trust'
import { ship } from './ship'
import type { Course, Section } from './types'

// Course registry, in syllabus order. One course per chapter of COURSE-PLAN.md; a course is
// registered here only once it is authored.
export const COURSES: Record<string, Course> = {
  [setup.id]: setup,
  [select.id]: select,
  [clean.id]: clean,
  [shape.id]: shape,
  [see.id]: see,
  [measure.id]: measure,
  [features.id]: features,
  [model.id]: model,
  [trust.id]: trust,
  [ship.id]: ship,
}

export type { Course, Section }

// The slug rule (`<courseId>-<sectionId>`) is the shell's: part of the route contract.
export { slugOf, allSections } from '@graphlearning/shell'

export function getCourse(id: string): Course | undefined {
  return COURSES[id]
}
