import type { Course } from '../types'
import { whatDataScienceIs } from './01-what-data-science-is'
import { whatWeWillBuild } from './02-what-we-will-build'

export const intro: Course = {
  id: 'intro',
  title: "Data science, and what we'll build",
  sections: [whatDataScienceIs, whatWeWillBuild],
}
