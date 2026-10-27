#!/usr/bin/env node
// The YouTube thumbnail for the single full-course film (scripts/out/film.mp4).
//
// Not the shell's `graphl-thumb`: that template is a PER-COURSE poster (58% scene + panel), and a
// cropped 16:9 video frame turns to mush at the ~168px the mobile feed actually renders. A film
// cover needs poster grammar — few elements, enormous type, one focal object.
//
// The card is REAL: the command, the headline price and every row are cut out of a spine
// session.txt — the same replayed output the scenes use — so the thumbnail cannot promise a
// valuation the course does not produce. An unparsable line is a hard error, never a guess.

import { mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, dirname, isAbsolute } from 'node:path'
import { execFile } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const repoDir = process.cwd()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg'].find(existsSync) ?? 'ffmpeg'

const SCALE = 2
const W = 1280 * SCALE
const H = 720 * SCALE

// ── the real output ─────────────────────────────────────────────────────────────────────────────
const SESSIONS = {
  value: join(repoDir, 'spine', 'ship', '04-command', 'session.txt'),
  batch: join(repoDir, 'spine', 'ship', '05-batch', 'session.txt'),
}
// The canonical data-science picture — a cloud of sales with a line through it — is not drawn for
// the cover: it is the figure the kernel really produced in §9.2, read back from matplotlib by
// run_notebook.py and stored in the step's cells.json. Same points, same line, same axes.
const FIT_CELLS = join(repoDir, 'spine', 'model', '02-line', 'cells.json')

const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/**
 * Cut the fitted line out of §9.2: the scatter the cell drew, the red line it drew over it, and the
 * `(intercept, slope, error)` the cell before it printed. One step, one model — the slope on the
 * cover is the slope of the line on the cover.
 */
function realFit() {
  const cells = JSON.parse(readFileSync(FIT_CELLS, 'utf8'))
  const figCell = cells.find((c) => c.figure?.length)
  if (!figCell) throw new Error(`no figure in ${FIT_CELLS}`)
  const f = figCell.figure[0]

  const points = f.points?.[0]
  if (!points?.length) throw new Error('no scatter points in the §9.2 figure')
  const fit = f.lines?.find((l) => l.x?.length > 1)
  if (!fit) throw new Error('no fitted line in the §9.2 figure')

  // `(77035, np.float64(131.1), 32648)` — intercept, £ per sq ft, mean absolute error
  const statCell = cells.filter((c) => c.cell < figCell.cell).reverse()
    .find((c) => /line\.intercept_/.test(c.source ?? ''))
  if (!statCell) throw new Error('no cell printing line.intercept_ before the figure')
  const text = statCell.outputs?.find((o) => o.text)?.text ?? ''
  const m = text.match(/\((\d+),\s*np\.float64\(([\d.]+)\),\s*(\d+)\)/)
  if (!m) throw new Error(`unparsed (intercept, slope, error) output: "${text.trim()}"`)

  const code = (statCell.source ?? '').split('\n').find((l) => /LinearRegression\(\)\.fit/.test(l))
  if (!code) throw new Error('no LinearRegression().fit line in the source')

  return {
    code: code.trim(), intercept: +m[1], slope: +m[2], mae: +m[3],
    n: points.length, points, fit,
    xlim: f.xlim, ylim: f.ylim, xlabel: f.xlabel, ylabel: f.ylabel,
  }
}

/**
 * Cut the `house-prices value` session apart: each command with the answer it actually produced.
 * Both outcomes the course teaches are kept — a price, and a refusal — because the refusals are
 * half the point of Course 11 (a model that knows what it has never seen).
 */
function realValue() {
  const lines = readFileSync(SESSIONS.value, 'utf8').split('\n').map((l) => l.trimEnd())
  const rows = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\$ house-prices value (.+)$/)
    if (!m) continue
    const flags = m[1]
    const area = flags.match(/--area\s+(\S+)/)?.[1]
    const sqft = flags.match(/--sqft\s+(\d+)/)?.[1]
    if (!area || !sqft) throw new Error(`no --area/--sqft in: ${lines[i]}`)

    const answer = lines[i + 1] ?? ''
    // `£383,000 (likely £350k–£417k)`  or  `house-prices: no valuation: …`
    const priced = answer.match(/^£([\d,]+)\s*\(likely\s*(£[\d.]+k)[–-](£[\d.]+k)\)$/)
    const refused = answer.match(/^house-prices: no valuation: (.+)$/)
    if (!priced && !refused) throw new Error(`unparsed answer after "${lines[i]}": "${answer}"`)

    rows.push(priced
      ? { cmd: lines[i].replace(/^\$ /, ''), area, sqft: +sqft, price: +priced[1].replace(/,/g, ''),
          low: priced[2], high: priced[3] }
      : { cmd: lines[i].replace(/^\$ /, ''), area, sqft: +sqft, refused: refused[1] })
  }
  if (!rows.length) throw new Error(`no "house-prices value" commands in ${SESSIONS.value}`)

  const hero = rows.find((r) => r.price)
  if (!hero) throw new Error('no priced answer in the session')
  const top = Math.max(...rows.filter((r) => r.price).map((r) => r.price))
  return { cmd: hero.cmd, hero, rows: rows.map((r) => ({ ...r, pct: r.price ? Math.round((r.price / top) * 100) : 0 })) }
}

/** Cut the `house-prices batch` session apart: the command, the count, and the valued rows. */
function realBatch() {
  const lines = readFileSync(SESSIONS.batch, 'utf8').split('\n').map((l) => l.trimEnd())
  const cmdLine = lines.find((l) => /^\$ house-prices batch /.test(l))
  if (!cmdLine) throw new Error(`no "house-prices batch" command in ${SESSIONS.batch}`)
  const cmd = cmdLine.replace(/^\$ /, '')

  // `valued 20 houses → valued.csv`
  const head = lines.find((l) => /^valued \d+ houses/.test(l))
  if (!head) throw new Error('no "valued N houses" line in the batch session')
  const houses = head.match(/valued (\d+) houses/)[1]
  const file = head.match(/→\s*(\S+)$/)?.[1] ?? 'valued.csv'

  // `3001,Riverside,1239,303000,270000,337000`
  const rows = lines.flatMap((l) => {
    const m = l.match(/^(\d+),([A-Za-z ]+),(\d+),(\d+),(\d+),(\d+)$/)
    return m ? [{ area: m[2], sqft: +m[3], price: +m[4] }] : []
  })
  if (!rows.length) throw new Error('no valued rows in the batch session')
  const top = Math.max(...rows.map((r) => r.price))
  return { cmd, houses, file, rows: rows.map((r) => ({ ...r, pct: Math.round((r.price / top) * 100) })) }
}

// ── the page ────────────────────────────────────────────────────────────────────────────────────
const fontFace = (fam, weight, file) => {
  const b64 = readFileSync(join(repoDir, 'node_modules', '@fontsource', fam, 'files', file)).toString('base64')
  return `@font-face{font-family:'${fam === 'ibm-plex-mono' ? 'IBM Plex Mono' : 'IBM Plex Sans'}';`
    + `font-weight:${weight};font-style:normal;font-display:block;`
    + `src:url(data:font/woff2;base64,${b64}) format('woff2')}`
}

// Jupyter orange (--brand in src/theme.css) is the repo's colour, so the cover matches the site.
const THEMES = {
  dark:  { badgeInk: '#14100d', bg: '#14100d', card: '#1f1711', ink: '#ffffff', accent: '#f8903a',
           rule: 'rgba(255,255,255,.13)', glow: 'radial-gradient(125% 115% at 10% 8%, #3d2110 0%, #14100d 62%)' },
  amber: { badgeInk: '#14100d', bg: '#130c08', card: '#261a11', ink: '#ffffff', accent: '#ffb24d',
           rule: 'rgba(255,255,255,.12)', glow: 'radial-gradient(130% 110% at 86% 14%, #74330c 0%, #130c08 60%)' },
  light: { badgeInk: '#ffffff', bg: '#f7f4f0', card: '#1c1510', ink: '#17110c', accent: '#c4521a',
           rule: 'rgba(0,0,0,.12)', glow: 'radial-gradient(120% 120% at 10% 8%, #ffffff 0%, #ece5dc 70%)' },
}

/**
 * The pandas mark — the real one, `public/vendor/pandas_mark_white.svg`, the white variant pandas
 * ships for dark backgrounds. It is usable here because the pandas logo is BSD-3-Clause (© 2008
 * AQR Capital Management, LLC, Lambda Foundry, Inc. and PyData Development Team; full notice in
 * public/vendor/LICENSE-pandas.txt), which permits redistribution with the notice retained.
 *
 * The Python and Apache Spark marks in the sister repos are NOT equivalent: those are trademark
 * questions, and both foundations reserve the uses that would apply here. Unmodified and used only
 * to name the library the course teaches, this claims no endorsement by pandas — the BSD notice's
 * third clause — and the course's own identity stays in the GraphL wordmark and badge.
 */
function markSvg(theme) {
  // pandas ships both: the white-body mark for dark grounds, the navy one for light. Picking by
  // theme rather than recolouring keeps the asset unmodified — and a white mark on the light
  // theme's near-white background would simply be invisible.
  const file = theme === 'light' ? 'pandas_mark.svg' : 'pandas_mark_white.svg'
  const raw = readFileSync(join(repoDir, 'public', 'vendor', file), 'utf8')
  const body = raw.slice(raw.indexOf('>', raw.indexOf('<svg')) + 1, raw.lastIndexOf('</svg>'))
  return `<svg class="logo" viewBox="0 0 210.21 280.43" role="img" aria-label="pandas"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${body}</svg>`
}

/** The §9.2 figure as SVG: every point and the line, mapped through the axes the cell really had. */
function fitSvg(fit, t) {
  const VW = 1000, VH = 520
  const PAD = { l: 8, r: 8, t: 10, b: 8 }
  const [x0, x1] = fit.xlim, [y0, y1] = fit.ylim
  const px = (x) => PAD.l + ((x - x0) / (x1 - x0)) * (VW - PAD.l - PAD.r)
  const py = (y) => VH - PAD.b - ((y - y0) / (y1 - y0)) * (VH - PAD.t - PAD.b)

  const dots = fit.points
    .map(([x, y]) => `<circle cx="${px(x).toFixed(1)}" cy="${py(y).toFixed(1)}" r="6.5"/>`).join('')
  const [lx0, lx1] = fit.fit.x, [ly0, ly1] = fit.fit.y
  return `<svg class="plot" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg">
    <g fill="#5aa9e6" opacity=".62">${dots}</g>
    <line x1="${px(lx0).toFixed(1)}" y1="${py(ly0).toFixed(1)}"
          x2="${px(lx1).toFixed(1)}" y2="${py(ly1).toFixed(1)}"
          stroke="${t.accent}" stroke-width="9" stroke-linecap="round"/>
  </svg>`
}

function pageHtml({ fit, value, batch, theme, head1, head2, badge }) {
  const t = THEMES[theme]
  const src = batch ?? value
  const nRows = src?.rows.length ?? 0
  const fonts = [
    fontFace('ibm-plex-sans', 700, 'ibm-plex-sans-latin-700-normal.woff2'),
    fontFace('ibm-plex-sans', 600, 'ibm-plex-sans-latin-600-normal.woff2'),
    fontFace('ibm-plex-mono', 600, 'ibm-plex-mono-latin-600-normal.woff2'),
    fontFace('ibm-plex-mono', 400, 'ibm-plex-mono-latin-400-normal.woff2'),
  ].join('')

  // One grid for the table, so every column lines up and nothing can collide.
  const cells = (src?.rows ?? []).map((r, i) => {
    const hot = !batch && r.price === Math.max(...src.rows.filter((x) => x.price).map((x) => x.price))
    const refused = !!r.refused
    const barCol = hot ? t.accent : '#5aa9e6'
    const bar = refused
      ? `<span class="bar none"></span>`
      : `<span class="bar"><i style="width:${r.pct}%;background:${barCol}"></i></span>`
    const val = refused
      ? `<span class="val no">refuses</span>`
      : `<span class="val"${hot ? ` style="color:${t.accent}"` : ''}>£${esc(group(r.price))}</span>`
    return `<span class="area${hot ? ' hot' : ''}${refused ? ' dim' : ''}">${esc(r.area)}</span>`
      + `<span class="sqft">${esc(group(r.sqft))} ft²</span>${bar}${val}`
  }).join('')

  return `<style>
  ${fonts}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${t.bg};background-image:${t.glow};
       font-family:'IBM Plex Sans',system-ui,sans-serif;color:${t.ink};
       display:flex;align-items:stretch;gap:${40 * SCALE}px;padding:${46 * SCALE}px ${50 * SCALE}px}

  .left{flex:0 0 auto;max-width:${540 * SCALE}px;display:flex;flex-direction:column;justify-content:center}
  /* The pandas mark is portrait (210×280) and stands on the background unaltered — no tile behind
     it, no recolour: a cropped or restyled logo is a worse logo, and a derivative nobody asked for. */
  .logo{height:${124 * SCALE}px;width:auto;display:block;margin-bottom:${24 * SCALE}px;
        align-self:flex-start}   /* else the stretched SVG centres its own contents in the column */
  .h{font-weight:700;line-height:.85;letter-spacing:-.05em;font-size:${116 * SCALE}px;white-space:nowrap}
  .h2{color:${t.accent}}
  .badge{align-self:flex-start;margin-top:${26 * SCALE}px;padding:${11 * SCALE}px ${24 * SCALE}px;
         background:${t.accent};border-radius:${12 * SCALE}px;
         font-weight:700;font-size:${34 * SCALE}px;letter-spacing:.06em;color:${t.badgeInk}}

  .card{flex:1;min-width:0;background:${t.card};border:${1 * SCALE}px solid ${t.rule};
        border-radius:${18 * SCALE}px;padding:${26 * SCALE}px ${30 * SCALE}px ${24 * SCALE}px;
        display:flex;flex-direction:column;box-shadow:0 ${22 * SCALE}px ${64 * SCALE}px rgba(0,0,0,.5)}
  .dots{display:flex;gap:${9 * SCALE}px;margin-bottom:${16 * SCALE}px}
  .dots i{width:${13 * SCALE}px;height:${13 * SCALE}px;border-radius:50%}
  .cmd{font-family:'IBM Plex Mono',monospace;font-size:${25 * SCALE}px;color:rgba(255,255,255,.62);
       margin-bottom:${16 * SCALE}px;white-space:nowrap}
  .cmd b{color:#6ee787;font-weight:400}

  .stat{font-family:'IBM Plex Mono',monospace;font-weight:600;color:#fff;
        font-size:${40 * SCALE}px;letter-spacing:-.02em;white-space:nowrap}
  .stat em{font-style:normal;color:${t.accent}}
  .statsub{font-family:'IBM Plex Mono',monospace;font-size:${25 * SCALE}px;
           color:rgba(255,255,255,.55);margin-top:${6 * SCALE}px;white-space:nowrap}

  .rows{flex:1;display:grid;align-content:center;grid-template-columns:auto auto 1fr auto;
        column-gap:${12 * SCALE}px;row-gap:${(nRows <= 2 ? 34 : nRows <= 4 ? 22 : 16) * SCALE}px;
        font-family:'IBM Plex Mono',monospace;font-weight:600;
        font-size:${(nRows <= 2 ? 40 : nRows <= 4 ? 27 : 24) * SCALE}px;color:#fff}
  .area{letter-spacing:-.02em;color:rgba(255,255,255,.88)}
  .area.hot{color:${t.accent}}
  .area.dim{color:rgba(255,255,255,.45)}
  .sqft{color:rgba(255,255,255,.62);text-align:right;white-space:nowrap}
  .bar{height:${20 * SCALE}px;min-width:${110 * SCALE}px;border-radius:${10 * SCALE}px;
       background:rgba(255,255,255,.1);overflow:hidden;align-self:center}
  .bar.none{background:repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 ${7 * SCALE}px,
            transparent ${7 * SCALE}px ${14 * SCALE}px)}
  .bar i{display:block;height:100%;border-radius:${10 * SCALE}px}
  .val{text-align:right;white-space:nowrap;color:rgba(255,255,255,.9)}
  .val.no{color:#ff7a5c;font-weight:400}
  .plotwrap{flex:1;min-height:0;display:flex;margin:${14 * SCALE}px 0 ${10 * SCALE}px}
  .plot{width:100%;height:100%;display:block;overflow:visible}
  .axes{display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;
        font-size:${22 * SCALE}px;color:rgba(255,255,255,.38);margin-bottom:${8 * SCALE}px}
  .foot{font-family:'IBM Plex Mono',monospace;font-size:${23 * SCALE}px;white-space:nowrap;
        color:rgba(255,255,255,.4);letter-spacing:.04em}
</style>
<div class="left">
  ${markSvg(theme)}
  <div class="h">${esc(head1)}</div>
  ${head2.split(/\s+/).map((w) => `<div class="h h2">${esc(w)}</div>`).join('')}
  <div class="badge">${esc(badge)}</div>
</div>
<div class="card">
  <div class="dots"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
  ${fit
    ? `<div class="cmd"><b>${esc(fit.code)}</b></div>
       <div class="stat"><em>£${esc(fit.slope)}</em> per ft²</div>
       <div class="statsub">${esc(group(fit.n))} sales it had never seen · typical miss £${esc(group(fit.mae))}</div>
       <div class="plotwrap">${fitSvg(fit, t)}</div>
       <div class="axes"><span>${esc(group(Math.round(fit.xlim[0])))} ft²</span><span>${esc(group(Math.round(fit.xlim[1])))} ft²</span></div>
       <div class="foot">price against size · the line the data chose</div>`
    : `<div class="cmd">$ <b>${esc(src.cmd)}</b></div>
       ${batch
         ? `<div class="stat">valued <em>${esc(batch.houses)}</em> houses</div>
            <div class="statsub">→ ${esc(batch.file)}</div>`
         : `<div class="stat"><em>£${esc(group(value.hero.price))}</em></div>
            <div class="statsub">likely ${esc(value.hero.low)}–${esc(value.hero.high)} · ${esc(group(value.hero.sqft))} ft² in ${esc(value.hero.area)}</div>`}
       <div class="rows">${cells}</div>
       <div class="foot">${batch ? 'one command · a whole file of houses' : 'values what it knows · refuses what it does not'}</div>`}
</div>`
}

// ── render ──────────────────────────────────────────────────────────────────────────────────────
async function main() {
  const argv = process.argv.slice(2)
  const opt = { theme: 'dark', out: 'output/thumbnails/film.png', source: 'fit',
                head1: 'LEARN', head2: 'DATA SCIENCE', badge: 'FULL COURSE' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--theme') opt.theme = argv[++i]
    else if (a === '--out') opt.out = argv[++i]
    else if (a === '--head1') opt.head1 = argv[++i]
    else if (a === '--head2') opt.head2 = argv[++i]
    else if (a === '--badge') opt.badge = argv[++i]
    else if (a === '--source') opt.source = argv[++i]
    else { console.error(`unknown argument: ${a}`); process.exit(2) }
  }
  if (!THEMES[opt.theme]) { console.error(`unknown theme: ${opt.theme} (have: ${Object.keys(THEMES).join(', ')})`); process.exit(2) }
  if (!['fit', 'value', 'batch'].includes(opt.source)) {
    console.error(`unknown source: ${opt.source} (have: fit, value, batch)`); process.exit(2)
  }

  const fit = opt.source === 'fit' ? realFit() : null
  const batch = opt.source === 'batch' ? realBatch() : null
  const value = opt.source === 'value' ? realValue() : null
  if (fit) {
    console.log(`Real figure from spine §9.2: ${fit.code}`)
    console.log(`  intercept £${group(fit.intercept)} · slope £${fit.slope}/ft² · MAE £${group(fit.mae)}`)
    console.log(`  ${fit.n} scatter points, x ${fit.xlim.map(Math.round).join('–')} ${fit.xlabel}, `
      + `y ${fit.ylim.map(Math.round).join('–')} ${fit.ylabel}`)
    console.log(`  line (${Math.round(fit.fit.x[0])}, £${group(Math.round(fit.fit.y[0]))}) → `
      + `(${Math.round(fit.fit.x[1])}, £${group(Math.round(fit.fit.y[1]))})`)
  } else if (batch) {
    console.log(`Real batch run from spine: $ ${batch.cmd}`)
    console.log(`  valued ${batch.houses} houses → ${batch.file}`)
    for (const r of batch.rows) console.log(`  ${r.area.padEnd(12)} ${String(r.sqft).padStart(5)} ft²  £${group(r.price)} (${r.pct}%)`)
  } else {
    console.log(`Real command from spine: $ ${value.cmd}`)
    for (const r of value.rows) {
      console.log(`  ${r.area.padEnd(12)} ${String(r.sqft).padStart(5)} ft²  `
        + (r.price ? `£${group(r.price)} (likely ${r.low}–${r.high})` : `refuses: ${r.refused}`))
    }
  }

  const requireFromRepo = createRequire(join(repoDir, 'package.json'))
  const { default: puppeteer } = await import(pathToFileURL(requireFromRepo.resolve('puppeteer')).href)

  const browser = await puppeteer.launch({ headless: true,
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }, args: [`--window-size=${W},${H}`] })
  try {
    const page = await browser.newPage()
    await page.setContent(pageHtml({ fit, value, batch, ...opt }), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    // The real command must appear in full — never truncated — so fit it by shrinking, not cutting.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('.h,.cmd,.stat,.statsub,.foot')) {
        const room = el.clientWidth - 1        // the element's OWN content box
        if (el.scrollWidth <= room) continue   // already fits — leave it alone
        const px = parseFloat(getComputedStyle(el).fontSize)
        // one bounded step, never a loop: a loop can chase a width that moves with the font
        el.style.fontSize = `${Math.max(10, Math.floor(px * (room / el.scrollWidth) * 0.98))}px`
      }
    })
    await sleep(250)

    // A thumbnail that silently clips its own text is worse than one that fails loudly.
    const overflow = await page.evaluate(() => {
      const bad = []
      for (const sel of ['.rows', '.card', '.left', 'body']) {
        const el = document.querySelector(sel)
        if (el && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) {
          bad.push(`${sel} ${el.scrollWidth}x${el.scrollHeight} > ${el.clientWidth}x${el.clientHeight}`)
        }
      }
      for (const el of document.querySelectorAll('.area,.sqft,.val,.cmd,.h,.badge,.stat,.statsub')) {
        const r = el.getBoundingClientRect()
        if (r.right > window.innerWidth + 1 || r.bottom > window.innerHeight + 1) {
          bad.push(`clipped: "${el.textContent.trim().slice(0, 20)}" right=${Math.round(r.right)}`)
        }
      }
      return bad
    })
    if (overflow.length) throw new Error(`layout overflows:\n  ${overflow.join('\n  ')}`)

    const out = isAbsolute(opt.out) ? opt.out : join(repoDir, opt.out)
    mkdirSync(dirname(out), { recursive: true })
    const big = join(tmpdir(), `thumb-film-${Date.now()}.png`)
    await page.screenshot({ path: big })
    await run(FFMPEG, ['-y', '-loglevel', 'error', '-i', big, '-vf', 'scale=1280:720:flags=lanczos', out])
    rmSync(big, { force: true })
    console.log(`\n✅ ${out}  (${opt.theme})`)
  } finally {
    await browser.close()
  }
}

main().catch((e) => { console.error('\n✗', e.message); process.exit(1) })
