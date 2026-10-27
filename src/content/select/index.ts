import type { Course } from '../types'
import { locAndIloc } from './01-loc-and-iloc'
import { booleanMasks } from './02-boolean-masks'
import { sorting } from './03-sorting'
import { newColumns } from './04-new-columns'
import { textAndCategories } from './05-text-and-categories'
import { dates } from './06-dates'
import { copyOnWrite } from './07-copy-on-write'

export const select: Course = {
  id: 'select',
  title: "Ask the table questions",
  sections: [locAndIloc, booleanMasks, sorting, newColumns, textAndCategories, dates, copyOnWrite],
}
