# Root Kernel Design System

## 1. Atmosphere & Identity

Root Kernel should feel like a warm technical command center: research-heavy, precise, and operated by a small team with unusually high execution leverage. The signature is warm-tech evidence: cream paper surfaces, teal operational signals, and diagram-like placeholders that read as future product proof rather than decoration.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|---|---|---:|---:|---|
| Background | `--bg` | `#fbf6ed` | n/a | Page background |
| Background alternate | `--bg-alt` | `#f3eadb` | n/a | Alternating bands |
| Surface | `--surface` | `#fffdf8` | n/a | Cards and form panels |
| Surface strong | `--surface-strong` | `#ffffff` | n/a | Highest contrast panels |
| Text primary | `--text` | `#15202b` | n/a | Headlines, primary copy |
| Text muted | `--muted` | `#657080` | n/a | Body copy, captions |
| Border | `--line` | `#e2d7c7` | n/a | Card borders, dividers |
| Border strong | `--line-strong` | `#c9bba6` | n/a | Dashed placeholder borders |
| Accent primary | `--teal` | `#11736b` | n/a | Links, active states, operational proof |
| Accent hover | `--teal-2` | `#0f8f87` | n/a | Hover and secondary teal |
| Accent warm | `--orange` | `#c66a35` | n/a | Secondary emphasis |
| Status warning | `--amber` | `#b36b00` | n/a | Prelaunch or direction status |
| Status info | `--blue` | `#315ea8` | n/a | Patent/development status |
| Status operating | `--green` | `#247450` | n/a | Operating status |
| Status research | `--purple` | `#7057a8` | n/a | Research status |
| Status danger | `--danger` | `#a6493e` | n/a | Error or destructive states |

### Rules

- Teal is the main signal color for agent operations and evidence.
- Orange is secondary warmth, not a competing CTA color.
- The page should not drift into a purple-blue AI-gradient identity.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|---|---:|---:|---:|---:|---|
| Display | `clamp(2.6rem, 6vw, 5.4rem)` | 900 | 0.98 | `-0.06em` | Large page hero |
| Home display | `clamp(2.4rem, 5.5vw, 4.8rem)` | 900 | 1.1 | tight | Homepage hero |
| H2 | `clamp(2rem, 4.2vw, 3.4rem)` | 900 | 1.05 | `-0.05em` | Section headers |
| H3 | `1.34rem` | 850 | 1.18 | `-0.03em` | Card titles |
| Lead | `clamp(1.12rem, 2vw, 1.36rem)` | 400 | 1.55 | 0 | Hero lead copy |
| Body | inherited `1rem` | 400 | 1.65 | 0 | Default copy |
| Caption | `.76rem` to `.89rem` | 800-900 | 1.45 | positive for labels | Badges and captions |

### Font Stack

- Primary: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", Inter, system-ui, sans-serif`
- Mono: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`

### Rules

- Korean copy uses sentence-like headings; avoid slogan-heavy marketing phrasing.
- Technical labels can stay English when they are product/system names.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a 4px base. Existing CSS uses rem values that map to this rhythm.

| Token | Value | Usage |
|---|---:|---|
| Compact | `.5rem` / 8px | Inline groups, badges |
| Standard | `1rem` / 16px | Card internals |
| Comfortable | `1.5rem` / 24px | Section head gaps |
| Section | `clamp(2.2rem, 6vw, 4.5rem)` | Standard sections |
| Hero | `clamp(4rem, 8vw, 7.5rem)` | Homepage top spacing |

### Grid

- Max content width: `--max: 1120px`
- Common grids: 3-column cards on desktop, 2-column tablet, 1-column mobile.
- Breakpoints: 980px, 760px, 460px.

### Rules

- Keep the homepage scannable: lead claim, evidence strip, then deeper routes.
- Cards should support comparison, not decorative repetition.

## 5. Components

### Sticky Navigation

- **Structure**: `.site-header` containing `.nav-shell`, `.brand`, `.site-nav`, `.lang-switch`.
- **States**: active and hover states use muted teal surface.
- **Accessibility**: skip link and mobile menu button are present.

### Image Placeholder

- **Structure**: `<figure class="image-placeholder">` with `.placeholder-grid` and descriptive `figcaption`.
- **Purpose**: documents the image brief until final assets are available.
- **Rule**: captions must specify an evidence asset, diagram, product screen, or workflow artifact.

### Pillar Card

- **Structure**: `.pillar-card` with label, title, body, and text link.
- **Purpose**: top-level route explanation and proof-oriented navigation.
- **States**: text links shift from teal to orange on hover.

### Founder Dialog

- **Structure**: footer `.footer-founder` button opens a generated `.founder-dialog`.
- **Purpose**: quiet trust context for visitors who want to know the founder background without turning the site into a personal profile.
- **States**: footer button has hover/focus underline; dialog uses native focus trapping and a close affordance.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro | `120-160ms` | ease | Hover and active states |
| Reveal | `480ms` | ease | Scroll reveal |
| Standard | `200-300ms` | ease-in-out | Navigation and form states |

### Rules

- Animate only `transform`, `opacity`, color, and background shifts.
- Respect `prefers-reduced-motion`; reveal content must remain visible.

## 7. Depth & Surface

### Strategy

Mixed, but restrained: paper-like surfaces use borders and soft warm shadows; operational/detail workspaces use darker command-center panels.

| Token | Value | Usage |
|---|---|---|
| Soft shadow | `--shadow-soft` | Cards and panels |
| Strong shadow | `--shadow` | Detail workspace and prominent panels |
| Radius | `--radius` | Major cards and placeholders |
| Small radius | `--radius-sm` | Compact cards and nested elements |

### Rules

- Do not add more decorative shadows without a hierarchy reason.
- Placeholder boxes must feel like planned artifacts, not empty missing images.
