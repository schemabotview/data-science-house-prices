import type { Section } from '../types'

export const copyOnWrite: Section = {
  id: 'copy-on-write',
  title: "Copy-on-Write: change the frame, not a copy",
  scene: 'select-copy-on-write',
  narration:
    "One last rule about selecting, and it is about changing data rather than reading it. Somewhere in this data is a house with twelve bedrooms, and it is a typo. Fixing it properly is a job for the cleaning course, so here we practise on a copy called demo. Cell eighteen tries the natural looking line: select the rows where beds is twelve, then their beds column, and set it to two. pandas warns, with a chained assignment error, and the maximum is still twelve. Nothing changed. The side pane shows why. demo, square brackets, mask, is a new object, and in pandas three it always behaves as a copy. That rule is called Copy-on-Write. Setting beds on it changes the copy, which is then thrown away, so the original never sees the edit. Older versions of pandas sometimes changed the original and sometimes did not, and printed a vague warning either way. pandas three made it one simple rule: a chain like this never changes the original. Cell nineteen does it in one step: demo dot loc, with the row condition and the column name inside the same brackets, equals two. Now the maximum is six. So whenever you change values in a DataFrame, use loc with both the rows and the column at once. That is how the cleaning course will fix this typo for real.",
}
