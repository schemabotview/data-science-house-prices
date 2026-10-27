import { setup } from './setup'
import type { Course, Section } from './types'

// Course registry, in syllabus order. One course per chapter of COURSE-PLAN.md; a course is
// registered here only once it is authored.
export const COURSES: Record<string, Course> = {
  [setup.id]: setup,
}

export type { Course, Section }

// The slug rule (`<courseId>-<sectionId>`) is the shell's: part of the route contract.
export { slugOf, allSections } from '@graphlearning/shell'

export function getCourse(id: string): Course | undefined {
  return COURSES[id]
}
