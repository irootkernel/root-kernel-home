# Root Kernel Home — Design System

「점등 / Ember Circuit」. A dark, integer-pixel site whose one visual idea is a circuit:
an ember leaves the origin, travels a declared route, and lights a brazier at every
anchor it reaches. Everything else — colour, type, motion, images — serves that one
mechanic and stays on a whole-cell grid.

The HTML in this repository is **generated**. Pages are emitted from the approved
manuscript blocks plus a registered micro-copy table; do not hand-edit
`ko/**/index.html`, `en/**/index.html`, `404.html`, `index.html` or `sitemap.xml`.
Edit the generator and re-run it. `assets/css/site.css` and `assets/js/rk.js` are
hand-written and are the only two files that carry behaviour.

---

## 1. Rulebook

The site has one grammar. Anything outside this list does not happen anywhere.

1. **Input.** Scroll, `↑`/`↓` (previous/next anchor), `↵` (open the detail page, or
   approve at an approval gate), `Esc` (back to the top), `R` (rotate mirror M3 on the
   home page). Nothing is dragged, hovered-to-reveal, or timed out.
2. **Public verb: lighting.** A port lights when the reader *reaches* it. Two places
   ask for a press instead: the approval gate on the control page, and the submit port
   on the contact form. Nothing else in the site needs a click to be readable.
3. **Tick law.** One tick is 1/12 s. State is a pure function of `tickCount`; CSS
   transitions use `steps()` only; there is no easing, no duration expressed in ms in
   the markup, and no animation that is not a whole number of ticks long.
4. **Reach test.** A port is reached when its marker crosses the reading line. The
   *semantic* event fires at that moment; the ember arriving later is only the
   expression of it. That split is what makes the reduced-motion run produce the same
   event sequence as the animated run.
5. **Actors.** The flying embers — one per launch, drawn together on one
   viewport-windowed canvas as the rail's round sparkling sprite recoloured per orb,
   each sampling a speed at launch and patrolling at that speed until reload (R13).
6. **Log.** Every state change appends one event: launch, `<id>` lit, approved,
   sent. The event log remains engine-internal in the state snapshot; the
   flight status exposes only aggregate ember and text-colour counts.
7. **Flight status.** The viewport-fixed bottom instrument reports total and
   per-colour ember counts plus visible text colour percentages. Its top edge is the
   playfield's lower wall, so embers reflect from it. Its `clear` button removes only
   flying embers and re-enables launchers, preserving paint, lit receivers, hero state,
   scroll, and shot order. Launch totals update immediately; text percentages sample
   at most four times per second in fixed-width fields.
8. **Page variation.** One machine everywhere (R13 `flight`): launcher pads on the
   page's H2s, braziers in the sections, obstacle plinths, and text paint — a
   passing ember colours the words in its own orb hue, last one wins. Two extras
   survive from the wire era: the home hero's AI-SPARK pipeline board with its
   human-approval gate, and the contact page's mailto form circuit. On mobile, the
   hero transcript keeps its 75-cell height and follows new messages by scrolling
   internally, so its animation never shifts the launcher geometry below it.
9. **No** audio, scanlines, CRT curvature, glow, gradients, blur, or drop shadows.

---

## 2. Tokens

### 2.1 Palette (13 colours, all of them named)

| Token | Hex | Role |
|---|---|---|
| `--ash0` | `#121110` | page ground |
| `--ash1` | `#1C1A18` | plates, HUD ground, obstacle plinths |
| `--ash2` | `#2E2B28` | rules, plate borders |
| `--ash3` | `#4A4541` | unlit outlines, spent launcher frame |
| `--dim` | `#8E8880` | secondary text, unlit labels |
| `--bone` | `#EDE9E7` | body text, white orb |
| `--teal` | `#10C4BE` | links, focus ring |
| `--teal2` | `#0B7E7A` | link underline |
| `--ember1` | `#FFC14A` | flame highlight, lit chip ground |
| `--ember2` | `#F27B2A` | ember body, lit dot |
| `--ember3` | `#B23A18` | sling band, lit underline |
| `--iron` | `#5C5852` | brazier body |
| `--iron2` | `#7C776F` | launcher cradle, port rings, dot borders |

Text is only ever drawn in one of these pairs: bone on ash0/ash1 (15.6/14.4), dim on
ash0/ash1 (5.4/4.9), teal on ash0/ash1 (8.7/8.0), ember1/ember2 on ash0 (11.7/6.9),
and the inverted chips ash0 on ember1/dim/bone. `--dim` on `--ash2` is 4.0 and is
therefore forbidden. `ember3`, `teal2`, `iron`, `ash3` are decoration only — never
text. Focus ring is teal on ash0 at 8.7, one cell wide with a one-cell offset.

### 2.1b Orb palette (R13)

The four launcher embers. White is `--bone`, so only three hues join. Orb colours
mark the flying ember, its launcher, its sling-aim rule — and the text blocks the
ember paints as it passes (they are the one exception to "never text": a painted
block is an event receipt, not a sentence, and a later ember repaints it). A
flying ember is the retired rail's round sparkling sprite recoloured: a diamond
body in the orb hue with four frames of highlight pixels that make it sparkle
(the white orb sparkles in `--ash3`).

| Token | Hex | Role |
|---|---|---|
| `--orb-b` | `#7EA6D8` | blue ember |
| `--orb-g` | `#7FA653` | green ember |
| `--orb-r` | `#D96A4A` | red ember |

### 2.2 The cell

```css
:root                      { --px: 3px; --w: calc(400 * var(--px)); }  /* >=1280 */
@media (max-width:1279px)  { :root { --px: 2px; --w: calc(360 * var(--px)); } }
@media (max-width: 767px)  { :root { --w: calc(180 * var(--px)); } }
```

`--px` is the pixel. **Every** length in `site.css` is `calc(n * var(--px))` — widths,
heights, padding, borders, gaps, line-heights, SVG stroke widths, animation offsets.
No percentages in anything that has to land on the grid, no `em`, no `rem`.

The container snaps its left margin down to a whole cell so an arbitrary viewport
width cannot push the grid off by a fraction:

```css
.wrap { width: var(--w); margin: 0 auto; }
@supports (margin-left: round(down, 1px, 1px)) {
  .wrap { margin: 0 0 0 round(down, calc((100% - var(--w)) / 2), var(--px)); }
}
```

Spacing scale, in cells: 1 2 3 4 6 8 10 12 16 20 24 28 32 40 48 56 64. Borders are one
cell. Section spacing is 40 cells (28 on mobile) between home anchors, 24 between
detail sections.

### 2.3 Type

Five self-hosted Galmuri faces for display, HUD and labels; the system stack for body
text. **Korean body copy is never set in a pixel face.**

| Style | Face | Size | Line |
|---|---|---|---|
| H1 | Galmuri11 Bold | 24 cells (36px fixed at <=767) | 26 cells (40px at <=767) |
| H2, page label | Galmuri11 Bold | 12 cells | 16 cells |
| Declaration, H3 | Galmuri11 | 12 cells | 18 cells |
| Label, group | Galmuri9 | 10 cells | 12 cells |
| HUD, chip, nav, repository name | Galmuri7 | 8 cells | 10 cells |
| Tick, coordinate, log number | GalmuriMono9 | 10 cells | 12 cells |
| Body | system stack | 18 / 17 / 16px | 10 / 13 / 13 cells |

The faces have units-per-em 1200 / 1200 / 1000 / 800 / 1000, so their pixel grids are
12 / 12 / 10 / 8 / 10px per em. **Only integer multiples of that em grid are allowed**
— which is why the sizes above are written in cells that work out to those multiples.
Latin and space advances are then whole numbers of pixels too, so a run of text cannot
drift off the grid mid-line.

Korean is cut at word boundaries everywhere: `word-break: keep-all; overflow-wrap:
anywhere`. The H1 is the one place with a manual line cut, at 390 only.

Body font stack: `-apple-system, "Apple SD Gothic Neo", Pretendard, "Noto Sans KR",
"Malgun Gothic", "Segoe UI", Roboto, sans-serif`.

---

## 3. Engine (`assets/js/rk.js`)

Vanilla JS, no dependencies, ~37KB. It is a layer on top of a complete document: with
JavaScript off every block is visible, every link works, there are no launchers,
no paint, and every brazier renders lit.

**R13 — the flight system.** The scroll-driven wire circuit and its rail are retired.
Every engine page is now one flight board, selected as `machine:"flight"` in `#rk-cfg`:

- **Launcher pads.** One pad per `<h2>` of `<main>` (plus one on any brazier section
  without an H2 — the contact form), injected by the engine so a no-JS page shows no
  dead control. Every pad sits in the left flight gutter. Initial hero state is
  rendered before pad and collision geometry are measured. A pointer/touch tap launches
  at a random resolved angle and speed; slingshot input releases opposite the drag,
  while Enter/Space fires the canonical shot. Pads reload instantly
  and fire again up to **64 embers on desktop input devices, or 32 on coarse-pointer,
  no-hover mobile and tablet devices**. The cap is independent of responsive layout,
  so narrowing a desktop window cannot lock an active flight. At the active cap every
  pad stays visible with its neutral shell unchanged while only the inset turns black;
  the control is disabled and has no sling tug. Colours cycle the four orbs in
  document order, and an active pad runs a three-frame sling tug to invite the pull.
- **Flight.** The sling angle sets direction; pull length only has to clear the
  three-cell launch threshold. Every accepted launch independently samples a uniform
  speed in hundredth-cell steps from 4.01 through 10.00 cells per tick. Each collision
  perturbs the specular angle by at most 20°, keeps the
  departing path at least 15° clear of surface grazing, and multiplies speed by a
  uniform 0.85–1.15 before clamping it to the launch range. A launched ember
  patrols the page until `clear` removes the flight or the page reloads. The
  playfield is the visible slice of `<main>` — never the header, never the footer —
  recomputed on scroll and resize. Obstacles are the `[data-ob]` plinths (the pipeline
  board, repository lists, data tables, the aperture scene), every explanatory `.fig`
  frame, the Contact form's four single-line fields, message textarea, and mail-draft
  submit button, **every launcher pad**, and every H2's visible underline divider.
  Text and images sit on the plinths; embers bounce off each measured boundary. An
  ember's own launch pad is transparent to it only until it has fully escaped the
  launch pad. One viewport-windowed canvas draws
  every ember from a cache of four colours by four sparkle frames; physics remains
  per ember. Only the previous sprite rectangles are cleared per tick. Resizing the
  Contact message box remeasures the form and its collision geometry.
- **Text paint.** No fog, no dimming — the page starts bright. At init the engine
  splits the text of `<main>`'s paintable blocks (`p`, `h1`–`h4`, `li`, `td`, `th`;
  links, `[aria-hidden]` and `.sr` excluded) into one span per letter, and an ember
  colours the letters inside its paint radius (12 cells) in its orb hue
  (`#main .pc.c0…c3`) — the trail reads character by character, and a later ember
  repaints. `textContent` never changes, so screen readers and the copy-provenance
  gate see the same sentences. Assignments are per-letter state, so the snapshot
  carries them and the same captured flight state repaints identically. A layout-time
  spatial index limits each flight tick to letters in the ember's neighbouring buckets,
  and every touched letter receives at most one DOM class write per tick after
  last-ember-wins resolves.
- **Braziers.** One per marked engine section, hung in the section's own corner. On
  the stacked mobile cut, section braziers occupy a separate row after the copy. The
  Principles declarations carry no braziers; its three explanatory sections do.
  Company carries one in each of its six H2-led body sections, including the three
  data table sections; its heading-free introduction carries neither a launcher nor
  a brazier. An ember within the ignition radius (24 cells) lights the bowl for good;
  the containing section (and the home index dot) follows.
- **H2 markers.** Every H2 is numbered in document order with a page-local A1–An
  badge and carries the same two-cell `--ember3` underline. The badge starts dim and
  turns `--ember1` when its brazier section is lit; an H2 in a section without a
  brazier keeps the dim badge. H1 and lower-level headings are not numbered.

Still true from the wire engine:

- **Accumulator.** `requestAnimationFrame` accumulates elapsed time and runs whole
  ticks; a stall is caught up at most 12 ticks at a time, so a slow frame cannot
  desynchronise the machine.
- **State transition.** Launch is the only stochastic boundary. Once its sampled
  velocity and collision PRNG state are stored on the ember, `step()` and every
  collision are deterministic. Tests stub only launch randomness when exact
  snapshot replay is required.
- **Reduced motion.** `prefers-reduced-motion: reduce` goes passive: no pads, no
  paint, braziers lit — the no-JS paint, with the pipeline board and the contact
  form still working through the synchronous settle. `?rk-tick=0` instead keeps
  the full game active and settles every input immediately; it is a public feature
  and the determinism harness, not just a test hook.
- **Hook contract.** `window.RK` exposes `version`, `tick`, `reduced`, `stepTo(n)`,
  `reset()`, `input(name, payload)`, `snapshot()` and `states()`. Inputs are `launch`
  (pad index plus the sling pull in whole cells), `key`, `press` and `scroll`; the
  snapshot carries pad and brazier states, every ember's position and velocity, the
  per-element paint assignments and the event log. A page with no machine (the 404
  board) answers the same contract with the empty state.
- **No sentences in code.** Neither the JS nor the CSS contains a user-visible string;
  every word comes from `#rk-cfg`, which the generator fills from the copy table.

Reduced motion, no-JS and keyboard behaviour per surface:

| Surface | No JS | Reduced motion | Keyboard |
|---|---|---|---|
| Body, headings | all visible, unpainted | all visible, unpainted | standard |
| Braziers | rendered lit | rendered lit | — |
| Launcher pads | absent | absent | Tab then `↵`/Space fires the canonical shot |
| Flying embers | absent | absent | — |
| Pipeline approval | button hidden, stations render lit | needs the press, as it is an input | Tab, `↵`/Space |
| Form | direct mail link, submit hidden | same | standard form order |

---

## 4. Images

Two kinds, and nothing else.

1. **Sprites.** Hand-written bitmaps (rows of palette indices) compile to inline SVG
   `<symbol>`/`<rect>` at load for static sprites and to one shared canvas for flying
   ember frames. They scale by `--px` alone, so they are crisp at every breakpoint,
   and they are the fallback whenever a raster is missing.
   Three characters (`α`, `β`, `↵`) are drawn as sprites because no single Galmuri
   face carries all three; the literal character stays in the DOM in a visually hidden
   span, so screen readers and the copy checks still read the registered string.
2. **Pixel rasters** in `assets/images/px/`. Every one is quantised to the 13-colour
   palette on an exact integer scale (`@3`, and `@6` for the card background) — each
   `scale x scale` block is a single colour, alpha is 0 or 255, and the colours are
   literally in the palette. A raster is only allowed on the site after it passes that
   check and is registered in the raster allowlist. Display size is
   `art x scale` CSS pixels as-is; a raster wider than the body column drops exactly
   one whole scale step at <=767 rather than being resized to a fraction.
   `image-rendering: pixelated` everywhere.

The social card `assets/images/og-root-kernel.png` (1200x630) is rendered from a
template at `--px: 6` over the approved background raster: wordmark in Galmuri11 Bold
at 10 cells, one line of copy at 6 cells. It is one image, shared by both locales.
`404.html` uses the broken-wire raster with the sprite palette and no engine.

---

## 5. Pages and surfaces

Fourteen pages, seven per locale: `/{ko,en}/`, `/control/`, `/products/`,
`/open-source/`, `/principles/`, `/company/`, `/contact/`.

- The home hero links directly to Technology and Products. Its five anchors follow
  Technology, AI Harness, AI Agent, Products, Principles order and link out; the home
  page never carries a whole section of body copy.
- Detail pages carry the approved manuscript in order, verbatim, headings included.
- Six retired URLs per locale (`ai-spark`, `aipsr`, `ai-harness`, `ai-agent`,
  `agent-technologies`, `hermes-supports`) are redirect stubs: a meta refresh, a
  `location.replace`, `rel=canonical` pointing at the page that replaced them, and one
  line of copy. GitHub Pages cannot answer 301, so the canonical is what carries the
  move. Stubs are excluded from `sitemap.xml`.
- `/index.html` is a language stub: it sends a reader whose first accepted language is
  English to `/en/`, everyone else to `/ko/`, with a meta-refresh fallback. It is the
  only page allowed to declare `hreflang="x-default"`.
- `404.html` is bilingual, has no header and no machine, and every `href`/`src` on it
  is root-relative because it answers from any path.
- Per page: one unique `<title>` and description, `rel=canonical`, `hreflang` ko/en,
  the full Open Graph and Twitter card set with an absolute image URL, and exactly one
  `Organization` JSON-LD block.
- Contact never posts anywhere: it assembles a `mailto:` draft (1,500 character limit)
  and shows the assembled text as a fallback. There is no backend and no analytics.

Budget per page: <=500KB transferred, <=100KB document, <=40KB script, <=300KB font,
CLS <=0.001. The whole `assets/` tree is well under 4MB.

---

## 6. What every change has to keep true

Serve the repository root (`python3 -m http.server 8080`) and check, at 390 / 768 /
1440 / 1920, with reduced motion both on and off:

1. No horizontal overflow at any of the four widths.
2. With JavaScript disabled: every block of body copy visible, no button that does
   nothing, the contact page still offering a direct mail link.
3. `window.RK` present; with the random source stubbed to the same sequence, the same
   input sequence gives an identical snapshot and `?rk-tick=0` equals the final
   animated snapshot. Without a stub, every accepted launch samples a fresh speed.
4. Every box in the component list lands on a whole `--px` multiple — width, height
   and document position. A shrunk flex item is the usual way this breaks.
5. Every raster on the grid and inside the palette, and present in the allowlist.
6. Font subsets cover 100% of the glyphs the site actually renders; no tofu.
7. Every sentence on the page comes from the approved manuscript or the registered
   micro-copy table. No sentence is written in HTML, CSS or JS.
8. ko and en stay structurally identical: same heading counts, same external links in
   the same order, same code blocks, same numbers, same proper nouns.
9. Head metadata, `sitemap.xml` (16 URLs) and the stub canonicals stay in sync.
10. Every internal link resolves; every external link answers 200. A URL the
    manuscript itself marks as not yet published is printed as text, not linked.

---

## 7. Known limits

1. Fractional device pixel ratios (1.25, 1.5) and browser zoom can fringe cell edges;
   the grid is defined in CSS pixels and is not corrected for that.
2. macOS text rendering can leave a faint subpixel fringe on pixel faces even at
   integer sizes.
3. Browsers without CSS `round()` (Safari < 15.4) centre the container instead of
   snapping it, which can be up to 1px off the grid.
4. R13: an ember launched from a pad below the fold is clamped into the visible
   playfield before it flies; launches through `RK.input` are expected to aim from
   visible pads, as a visitor's pull always is.
5. Flight physics runs on the main thread. Outside a sling pull the accumulator catches
   up at most 12 ticks after a stall; during a pull it advances at most one tick per
   display frame so pointer expression stays responsive. Rendering stays on one canvas
   and text contact checks use a spatial index, so ember count does not expand the
   style tree.
6. One social card, in Korean, is shared by both locales.
9. English navigation labels are wider than the container at every breakpoint, so the
   header wraps to a second row in `/en/`. It does not shrink: a shrunk item would
   land on a fractional width and take the whole row off the grid. On phones
   (max-width:767px) the nav instead collapses behind a toggle button that rk.js
   injects next to the language flag, named after the current page; without JS the
   full row stays visible as before.
