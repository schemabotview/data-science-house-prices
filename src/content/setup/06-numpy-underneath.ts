import type { Section } from '../types'

export const numpyUnderneath: Section = {
  id: 'numpy-underneath',
  title: 'NumPy underneath: why columns are fast',
  scene: 'setup-numpy',
  narration:
    "After a restart and run all, the counts run in order, and len big now says thirty eight. One more idea finishes the setup, and it explains why the rest of this course writes code the way it does. Cell seven takes the sqft column out of pandas as a NumPy array, with to numpy. Its type is numpy dot n d array, its d type int sixty four, and it occupies eleven thousand, six hundred and eighty bytes: exactly fourteen sixty numbers times eight bytes each. The side pane shows why that matters. A NumPy array stores its numbers side by side, raw, all of one type. A Python list stores pointers, and each pointer leads to a separate integer object somewhere else in memory, with its own type and bookkeeping. Now the same job done both ways: convert every size from square feet to square metres, by dividing by ten point seven six four. Cell eight does it with a Python loop, one number at a time, and the percent timeit magic runs it many times and reports the average. Cell nine divides the whole array at once: sizes divided by ten point seven six four, no loop in sight. The timing table compares them. The exact times vary on every run and every machine, but the gap does not: the array is hundreds of times faster. The loop runs in Python, checking each object's type as it goes. The array runs one tight loop in compiled code, over numbers it already knows the type of. pandas columns are NumPy arrays underneath, so the habit for the whole course is: operate on whole columns, never loop over rows.",
}
