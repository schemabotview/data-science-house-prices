import type { Course } from '../types'
import { groupby } from './01-groupby'
import { severalStatistics } from './02-several-statistics'
import { pivotTables } from './03-pivot-tables'
import { merge } from './04-merge'
import { fourJoins } from './05-four-joins'
import { time } from './06-time'
import { longAndWide } from './07-long-and-wide'

export const shape: Course = {
  id: 'shape',
  title: "Group, combine, reshape",
  sections: [groupby, severalStatistics, pivotTables, merge, fourJoins, time, longAndWide],
}
