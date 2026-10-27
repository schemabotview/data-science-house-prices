import type { Section } from '../types'

export const dates: Section = {
  id: 'dates',
  title: "Dates: two formats, one column",
  scene: 'select-dates',
  narration:
    "The sold column is text, and dates as text cannot be sorted by time or grouped by month. Cell fifteen does the obvious thing, pd dot to datetime, and it fails. pandas looked at the first value, saw year, month, day, assumed every row was written that way, and then met eight, slash, oh one, twenty twenty one, written by a different agent. The error even suggests passing format mixed and letting pandas guess each row. Do not. Eight oh one could be the eighth of January or the first of August, and a guess that is wrong for some rows produces dates that look fine and are not. We know the two formats, so cell sixteen says so. It parses the column twice. Once as year, month, day, and once as day, month, year, each time with errors equals coerce, which turns anything that does not match into NaT, Not a Time, instead of failing. The side pane follows two real rows through it. Each format parses its own rows and leaves the other's as NaT, and fillna fills the gaps of the first with the second. The check that matters is underneath: zero missing dates, and a real datetime type. Now the dates behave like dates. Cell seventeen takes the year of every sale with dot dt dot year, and counts them. The chart shows a steady market, about two hundred and fifty sales a year, with twenty twenty six lower only because the data stops in September.",
}
