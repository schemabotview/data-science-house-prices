// The ONE grid every GraphL frame shares since graphl-flow 0.10 (its `ide-frame` study): 1344 × 756
// at a 1% margin, ≈ 2.8× at 4K, so 15px code reads ≈ 42px. Columns are python-expense-tracker's frame
// v2: compact explorer 175 | work column 715 (72 columns) | side pane 434. A frame without an explorer
// gives its column to the work column (NB_W: the notebook, which needs the width for DataFrames).
export const GAP = 10
export const FULL_W = 1344
export const FRAME_H = Math.round(FULL_W / (16 / 9))
export const SIDE_W = 434
export const WORK_W = 715
export const EXPLORER_W = FULL_W - (WORK_W + GAP + SIDE_W) - GAP
export const NB_W = FULL_W - SIDE_W - GAP
/** A plot in the side pane: the pane less its borders and padding. */
export const SIDE_PLOT_W = SIDE_W - 34
