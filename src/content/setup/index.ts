import type { Course } from '../types'
import { aProject } from './01-a-project'
import { whatANotebookIs } from './02-what-a-notebook-is'
import { firstCells } from './03-first-cells'
import { dataframeAnatomy } from './04-dataframe-anatomy'
import { executionOrder } from './05-execution-order'
import { numpyUnderneath } from './06-numpy-underneath'

export const setup: Course = {
  id: 'setup',
  title: 'A notebook and the data',
  sections: [aProject, whatANotebookIs, firstCells, dataframeAnatomy, executionOrder, numpyUnderneath],
}
