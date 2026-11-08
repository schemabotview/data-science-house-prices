import type { Code, Edge, Group, SceneModel, SceneNode, Tree, TreeEntry } from '@graphlearning/graphl-flow'
import { EXPLORER_W, FRAME_H, GAP, SIDE_W, WORK_W } from './grid'

// IDE frame v2 (python-expense-tracker's frame.ts, graphl-flow 0.10's shared grid, grid.ts):
//
//   [explorer] | editor (the rows the terminal leaves)        | side pane (STRICT: one diagram,
//              | terminal docked under it (its transcript)    | at most one table)
//
// 1344 × 756 at a 1% margin, the same fit as the notebook frame. Every column a FIXED width. The editor
// and terminal share ROWS rows: the terminal takes exactly its transcript's rows (at least
// MIN_TERMINAL), the editor the rest, so only the divider between them moves. The terminal is 72
// columns: the recorded 80-column sessions wrap here, at draw time, so the spine is untouched; the
// editor soft-wraps past column 71. A transcript or highlight that does not fit THROWS, naming the file.

const ROW = 24
const CHROME = 51
export { EXPLORER_W, FRAME_H, SIDE_W, WORK_W }
/** The terminal's width in columns, and the editor's soft-wrap point. */
export const COLS = 72
const EDITOR_WRAP = 71
/** Rows the editor and terminal share. */
export const ROWS = Math.floor((FRAME_H - GAP - 2 * CHROME) / ROW)
export const MIN_TERMINAL = 6
export const MIN_EDITOR = 8
const editorH = (rows: number) => rows * ROW + CHROME

export const trim = (text: string) => text.replace(/\n+$/, '')

/**
 * A spine session.txt as a terminal pane. graphl-flow draws `$ cmd` as a command and `! text` as an
 * error; the replay (scripts/spine.py) writes plain output, so a traceback is marked here: from its
 * header — `Traceback (most recent call last):`, or the `  File "…", line N` a SyntaxError starts
 * with — through the exception line that ends it. A line longer than the pane's 80 columns WRAPS at
 * COLS, as a real 72-column terminal wraps it; each wrapped piece is a row.
 */
export function terminal(session: string): string {
  const out: string[] = []
  let inError = false
  for (const line of trim(session).split('\n')) {
    if (line.startsWith('$ ') || line.startsWith('>>> ') || line.startsWith('... ') || line.startsWith('house-prices> ')) inError = false
    else if (!inError && (line === 'Traceback (most recent call last):' || /^ {2}File ".*", line \d+/.test(line))) inError = true
    const rows = line.match(new RegExp(`.{1,${COLS}}`, 'g')) ?? ['']
    if (inError) {
      out.push(...rows.map((row) => `! ${row}`))
      if (/^[A-Za-z_][\w.]*(Error|Exception|Warning|Interrupt|Exit)\b/.test(line)) inError = false
    } else out.push(...rows)
  }
  return out.join('\n')
}

export interface Editor {
  /** The tab label — the file's path in the project. */
  file: string
  /** The file's text, imported from the spine with `?raw`. */
  code: string
  show?: [number, number][]
  highlight?: number[]
  lang?: Code['lang']
}

export interface IdeFrame {
  /** The explorer's heading: the project folder. */
  project?: string
  tree: TreeEntry[]
  editor: Editor
  /** The step's session.txt, raw — marked for the terminal pane by `terminal()`. */
  session: string
  /** The side pane: a diagram (check-content fails a side pane with no edge, plot or table). */
  side: SceneNode[]
  /** Edges between nodes INSIDE the side pane. An edge between panes would widen a gap and move them. */
  edges?: Edge[]
}

// Fixed ids: a section's `focus` can name `editor.L12`, `terminal`, or any id in the side pane.
export const IDE_IDS = { explorer: 'explorer', editor: 'editor', terminal: 'terminal', side: 'side' } as const

const rowsOf = (lines: string[], a: number, b: number) =>
  lines.slice(a - 1, b).reduce((n, l) => n + Math.max(1, Math.ceil(l.length / EDITOR_WRAP)), 0)

/** A window of the file around lines first..last that fits `room` editor rows, folds included. */
function windowFor(code: string, first: number, last: number, room: number): [number, number][] | undefined {
  const lines = trim(code).split('\n')
  if (rowsOf(lines, 1, lines.length) <= room) return undefined
  const fits = (a: number, b: number) => rowsOf(lines, a, b) + (a > 1 ? 1 : 0) + (b < lines.length ? 1 : 0) <= room
  if (!fits(first, last)) throw new Error(`lines ${first}–${last} do not fit ${room} rows`)
  let a = first, b = last
  for (let grew = true; grew;) {
    grew = false
    if (a > 1 && fits(a - 1, b)) { a--; grew = true }
    if (b < lines.length && fits(a, b + 1)) { b++; grew = true }
  }
  return [[a, b]]
}

function rowsShown(lines: string[], ranges: [number, number][]): number {
  let rows = 0, next = 1
  for (const [a, b] of ranges) { if (a > next) rows++; rows += rowsOf(lines, a, b); next = b + 1 }
  return rows + (next <= lines.length ? 1 : 0)
}

/** Hand-picked ranges grown, a line at a time, until the editor is full; throws if they do not fit. */
function grow(code: string, ranges: [number, number][], room: number): [number, number][] {
  const lines = trim(code).split('\n')
  const merge = (rs: [number, number][]) => [...rs].sort((x, y) => x[0] - y[0]).reduce<[number, number][]>((out, [a, b]) => {
    const last = out[out.length - 1]
    if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b); else out.push([a, b])
    return out
  }, [])
  let r = merge(ranges.map(([a, b]) => [a, b] as [number, number]))
  if (rowsShown(lines, r) > room) throw new Error(`the shown ranges take ${rowsShown(lines, r)} rows; the editor holds ${room}`)
  for (let grew = true; grew;) {
    grew = false
    for (let i = 0; i < r.length && !grew; i++) for (const side of [1, 0] as const) {
      const t = r.map(([a, b]) => [a, b] as [number, number])
      if (side === 1 && t[i][1] < lines.length) t[i][1]++
      else if (side === 0 && t[i][0] > 1) t[i][0]--
      else continue
      const m = merge(t)
      if (rowsShown(lines, m) <= room) { r = m; grew = true; break }
    }
  }
  return r
}

export function ideFrame({ project = 'house-prices', tree, editor, session, side, edges = [] }: IdeFrame): SceneModel {
  const term = terminal(session)
  const rows = term.split('\n').length
  if (rows > ROWS - MIN_EDITOR) throw new Error(`ide.ts ${editor.file}: the transcript is ${rows} rows; a terminal shows at most ${ROWS - MIN_EDITOR}`)
  const editorRows = ROWS - Math.max(MIN_TERMINAL, rows)
  const code = trim(editor.code)
  const hl = editor.highlight ?? []
  let show: [number, number][] | undefined
  try {
    show = editor.show ? grow(code, editor.show, editorRows)
      : hl.length ? windowFor(code, Math.min(...hl), Math.max(...hl), editorRows) : windowFor(code, 1, 1, editorRows)
  } catch (e) { throw new Error(`ide.ts ${editor.file}: ${(e as Error).message}`) }
  const ed: Code = {
    type: 'code', id: IDE_IDS.editor, filename: editor.file, lang: editor.lang ?? 'python', code, highlight: hl, wrap: true,
    tone: 'ingest', fill: true, w: WORK_W, minH: editorH(editorRows), ...(show && { show }),
  }
  const tm: Code = { type: 'code', id: IDE_IDS.terminal, terminal: true, filename: `terminal — ${project}`, code: term, fill: true, w: WORK_W, minH: FRAME_H - GAP - editorH(editorRows) }
  const explorer: Tree = { type: 'tree', id: IDE_IDS.explorer, title: project, entries: tree, compact: true, fill: true, w: EXPLORER_W, minH: FRAME_H }
  const pane: Group = { type: 'group', id: IDE_IDS.side, bare: true, spread: true, w: SIDE_W, h: FRAME_H, children: side }
  return { dir: 'row', padding: 0.01, nodes: [explorer, { type: 'group', id: 'workbench', bare: true, children: [ed, tm] }, pane], edges }
}

/**
 * The 1-based number of the first line of `code` containing `text`, searching from line `from`.
 * Highlights and folds are found by TEXT, never typed as numbers: a file grows a line upstream and
 * a typed number silently highlights the wrong line (Course 3's did, three times). A missing text
 * throws, which check-render reports as a page error naming the scene.
 */
export function lineOf(code: string, text: string, from = 1): number {
  const lines = code.split('\n')
  for (let i = from - 1; i < lines.length; i++) if (lines[i].includes(text)) return i + 1
  throw new Error(`ide.ts: no line containing ${JSON.stringify(text)} from line ${from}`)
}

/** Every line number from the line containing `first` through the next line containing `last`. */
export function linesFrom(code: string, first: string, last = first): number[] {
  const a = lineOf(code, first), b = lineOf(code, last, a)
  return Array.from({ length: b - a + 1 }, (_, i) => a + i)
}

/** The last line number of `code` (ignoring a trailing newline). */
export const lastLine = (code: string) => trim(code).split('\n').length
