import type { Course } from '../types'
import { distributions } from './01-distributions'
import { logScale } from './02-log-scale'
import { relationships } from './03-relationships'
import { comparingGroups } from './04-comparing-groups'
import { correlation } from './05-correlation'
import { honestCharts } from './06-honest-charts'

export const see: Course = {
  id: 'see',
  title: "See it",
  sections: [distributions, logScale, relationships, comparingGroups, correlation, honestCharts],
}
