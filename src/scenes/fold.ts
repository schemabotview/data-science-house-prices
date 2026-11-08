import { lineOf, lastLine } from './ide'

/**
 * The region of a file a section is about, as `show` ranges: lines 1–`head` (the file's header; 0
 * leaves it out), then the line containing `first` through the line containing `last` (or just
 * `first`'s line). Found by TEXT, like every highlight. Frame v2's ideFrame then GROWS these ranges
 * until the editor is full (and throws, naming the file, if they cannot fit), so this only names
 * what must be on screen, never how much room there is.
 */
export function view(code: string, first: string, last?: string, head = 2): { show: [number, number][] } {
  const n = lastLine(code)
  const a = lineOf(code, first)
  const b = last ? lineOf(code, last, a) : a
  const keepHead = head > 0 && a > head + 1
  return { show: [...(keepHead ? [[1, head] as [number, number]] : []), [a, Math.min(b, n)]] }
}
