import type { Course } from '../types'
import { notebookToModule } from './01-notebook-to-module'
import { tests } from './02-tests'
import { trainAndSave } from './03-train-and-save'
import { aCommand } from './04-a-command'
import { batch } from './05-batch'
import { aWebApi } from './06-a-web-api'
import { whereNext } from './07-where-next'

export const ship: Course = {
  id: 'ship',
  title: "From notebook to tool",
  sections: [notebookToModule, tests, trainAndSave, aCommand, batch, aWebApi, whereNext],
}
