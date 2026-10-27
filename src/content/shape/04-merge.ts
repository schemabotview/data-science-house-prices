import type { Section } from '../types'

export const merge: Section = {
  id: 'merge',
  title: "Merge: joining area facts, and the join that failed",
  scene: 'shape-merge',
  narration:
    "Some things that set a price are not in the sales file at all: how good the local school is, how far the centre is, whether the area floods. A second file, areas dot csv, now in the data folder, holds them, one row per area, and cell five shows all five. Joining them onto the sales is a merge on the area column. Cell six does it carefully. how equals left keeps every sale whether or not it finds a match. validate equals many to one checks that each area appears only once in the areas table, so a sale can never be silently duplicated. And indicator equals True adds a column saying where each row found its match. The count is the point: one thousand four hundred and thirty three sales matched both sides. Twenty matched nothing. Cell seven lists the areas behind those twenty, and there it is: Old town, small t. The side pane shows the keys. Old Town with a capital T finds its row in areas. Old town with a small one finds nothing, because a merge compares text exactly, like everything else. This is why I left it unfixed two courses ago: a join is where a spelling slip really bites. Cell nine fixes it with str dot title, merges for real, and the shape confirms it: fourteen hundred and fifty three sales, every one now carrying fourteen columns.",
}
