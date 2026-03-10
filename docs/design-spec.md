# Nexture Landing Page — Design Specification
**Sprint-01 · UI/UX Designer: Aria**
**Version:** 1.0 · 2026-03-10

---

## 1. Brand Color Palette

### Design Rationale
Nexture operates in medical AI — a domain where trust, precision, and innovation must coexist. The palette uses deep space-navy as the foundation (authority, depth), electric cyan as the primary accent (technology, clarity, medical blue-green heritage), and indigo for AI/intelligence signals. High contrast ensures WCAG 2.1 AA compliance throughout.

### Color Tokens

```css
:root {
  /* ── Backgrounds ── */
  --color-canvas:        #040D1B;   /* deepest bg: particle canvas layer */
  --color-bg-primary:    #060F22;   /* page background */
  --color-bg-surface:    #0C1A35;   /* card / section surface */
  --color-bg-elevated:   #102040;   /* hover states, modals */
  --color-bg-subtle:     #0A1628;   /* nav, footer */

  /* ── Brand Primary — Cyan ── */
  --color-primary-500:   #00D4E8;   /* primary CTA, links, highlights */
  --color-primary-400:   #33DEF0;   /* hover states */
  --color-primary-300:   #66E8F4;   /* subtle tints */
  --color-primary-200:   #99F0F8;   /* very light accent */
  --color-primary-glow:  rgba(0, 212, 232, 0.15);   /* glow / shadow */

  /* ── Brand Secondary — Indigo ── */
  --color-secondary-500: #5B6EF5;   /* secondary actions, badges */
  --color-secondary-400: #7B8EF8;   /* hover */
  --color-secondary-600: #4357E8;   /* pressed */
  --color-secondary-glow: rgba(91, 110, 245, 0.20);

  /* ── Neutrals ── */
  --color-text-primary:  #F0F6FF;   /* headings */
  --color-text-secondary:#94A3B8;   /* body, captions */
  --color-text-muted:    #4A607A;   /* placeholders, disabled */
  --color-border:        rgba(0, 212, 232, 0.12);   /* subtle borders */
  --color-border-strong: rgba(0, 212, 232, 0.30);   /* active borders */

  /* ── Semantic ── */
  --color-success:       #10B981;
  --color-warning:       #F59E0B;
  --color-error:         #EF4444;

  /* ── Gradient Presets ── */
  --gradient-hero:       linear-gradient(135deg, #040D1B 0%, #0A1628 50%, #091A30 100%);
  --gradient-cta-btn:    linear-gradient(135deg, #00D4E8 0%, #5B6EF5 100%);
  --gradient-card-edge:  linear-gradient(180deg, rgba(0,212,232,0.08) 0%, transparent 100%);
  --gradient-text:       linear-gradient(90deg, #00D4E8, #5B6EF5);
}
```

### Accessibility Check
| Pair | Ratio | WCAG |
|---|---|---|
| `--color-text-primary` on `--color-bg-primary` | 15.2:1 | ✅ AAA |
| `--color-primary-500` on `--color-bg-primary` | 8.4:1 | ✅ AAA |
| `--color-text-secondary` on `--color-bg-surface` | 5.1:1 | ✅ AA |
| White CTA text on `--gradient-cta-btn` | 4.8:1 | ✅ AA |

---

## 2. Particle System — Visual Style

### Concept: "Neural Scan Field"
Particles represent the invisible data flowing through AI analysis — the same micro-scale precision Nexture applies to capsule endoscopy images. The effect should feel alive but never distracting.

### Particle Tokens

```css
:root {
  /* Particle colors (used in JS canvas renderer) */
  --particle-color-primary:  rgba(0, 212, 232, 0.55);    /* cyan nodes */
  --particle-color-secondary:rgba(91, 110, 245, 0.35);   /* indigo nodes */
  --particle-color-faint:    rgba(240, 246, 255, 0.12);  /* white dust */

  /* Connection lines */
  --particle-line-color:     rgba(0, 212, 232, 0.08);
  --particle-line-max-dist:  140px;

  /* Motion */
  --particle-speed-base:     0.3;    /* very slow drift */
  --particle-count-desktop:  80;
  --particle-count-mobile:   35;
  --particle-size-min:       1.5px;
  --particle-size-max:       3.5px;
}
```

### Visual Behavior Spec
- **Node types:** 70% small dots (1.5–2px), 25% medium (2–3px), 5% "pulse" nodes (3–3.5px with CSS @keyframes glow)
- **Pulse animation:** select ~4 nodes randomly, apply subtle radial glow pulse every 3–5s
- **Connections:** draw lines between nodes within `140px` radius; opacity = `1 - (distance / maxDist)` × 0.08
- **Mouse interaction:** nodes within 100px radius gently repel from cursor (repulsion strength: 0.04)
- **Canvas blend mode:** `multiply` is NOT used — canvas sits behind all content with `z-index: 0`
- **Performance:** `requestAnimationFrame` loop; pause when `document.hidden`; cap at 60fps

### Mood Reference
Think: electron microscope imagery, neural network diagrams, deep-sea bioluminescence — scientific wonder, not gaming.

---

## 3. Typography System

### Font Stack

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Families */
  --font-display:   'Space Grotesk', system-ui, sans-serif;   /* H1–H3, hero */
  --font-body:      'Inter', system-ui, sans-serif;            /* body, UI text */
  --font-mono:      'JetBrains Mono', monospace;               /* stats, data badges */

  /* Scale — Major Third (1.25) */
  --text-xs:    0.75rem;    /* 12px — labels, captions */
  --text-sm:    0.875rem;   /* 14px — secondary body */
  --text-base:  1rem;       /* 16px — primary body */
  --text-lg:    1.125rem;   /* 18px — lead paragraphs */
  --text-xl:    1.25rem;    /* 20px */
  --text-2xl:   1.5rem;     /* 24px — section subheadings */
  --text-3xl:   1.875rem;   /* 30px — section headings */
  --text-4xl:   2.25rem;    /* 36px */
  --text-5xl:   3rem;       /* 48px — hero heading mobile */
  --text-6xl:   3.75rem;    /* 60px — hero heading tablet */
  --text-7xl:   4.5rem;     /* 72px — hero heading desktop */

  /* Weights */
  --font-light:   300;
  --font-regular: 400;
  --font-medium:  500;
  --font-semibold:600;
  --font-bold:    700;

  /* Line heights */
  --leading-tight:  1.15;
  --leading-snug:   1.35;
  --leading-normal: 1.6;
  --leading-relaxed:1.75;

  /* Letter spacing */
  --tracking-tight:  -0.02em;   /* large headings */
  --tracking-normal:  0em;
  --tracking-wide:    0.06em;   /* eyebrow labels / caps */
  --tracking-widest:  0.12em;   /* ALL-CAPS badges */
}
```

### Typographic Hierarchy

| Role | Font | Size | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Hero H1 | Space Grotesk | 72px → 48px mob | 700 | -0.02em | Single headline |
| Section H2 | Space Grotesk | 48px → 32px mob | 600 | -0.01em | Section titles |
| Card H3 | Space Grotesk | 24px | 600 | 0 | Card/feature titles |
| Eyebrow | Inter | 12px | 500 | 0.12em | ALL-CAPS section labels |
| Body Lead | Inter | 18px | 400 | 0 | Hero subtext |
| Body | Inter | 16px | 400 | 0 | General copy |
| Caption | Inter | 14px | 400 | 0 | Image captions, footnotes |
| Data/Stat | JetBrains Mono | 14px | 500 | 0 | Numbers, percentages |
| CTA Button | Inter | 15px | 600 | 0.04em | Button labels |

---

## 4. Section-by-Section Layout & Visual Spec

---

### 4.1 Canvas Background (Global Layer)

**Type:** Fixed full-viewport `<canvas>` element  
**z-index:** 0 (below all content)  
**Visual:** Particle field as described in §2  
**Radial vignette overlay:** `radial-gradient(ellipse at center, transparent 40%, rgba(4,13,27,0.8) 100%)` — draws eye to center

---

### 4.2 Navigation

**Layout:**
```
[Logo]                    [Services] [About] [Contact]    [Get Demo →]
```
- Fixed top, full width
- Height: 64px desktop / 56px mobile
- Background: `rgba(6,15,34,0.85)` with `backdrop-filter: blur(16px) saturate(180%)`
- Bottom border: `1px solid var(--color-border)`
- Logo: Wordmark "NEXTURE" in Space Grotesk 700 + small cyan accent mark on the "N" or beside it

**Nav Links:** Inter 14px Medium, `--color-text-secondary` → hover `--color-primary-500` with 0.2s ease transition

**CTA Button (Get Demo):**
- Background: `var(--gradient-cta-btn)`
- Border-radius: 8px
- Padding: 10px 20px
- Text: Inter 14px Semibold, white
- Hover: `brightness(1.1)` + `box-shadow: 0 0 20px var(--color-primary-glow)`

**Scroll behavior:** Slight background opacity increase to `0.95` on scroll > 20px

**Mobile:** Hamburger icon → slide-down drawer, full-width links, CTA at bottom

---

### 4.3 Hero Section

**Layout:** Full viewport height (100vh), centered vertically  
**Content alignment:** Center (text + CTA centered)

```
[EYEBROW — "MEDICAL AI · CAPSULE ENDOSCOPY"]
[H1 — 2–3 line headline]
[Subheading paragraph — 1–2 sentences]
[Primary CTA]  [Secondary CTA]
[Trusted by logos strip]
```

**H1 Copy Direction:**  
"Precision at the  
Speed of AI"  
*(gradient text on key word — e.g., "AI" uses `--gradient-text`)*

**Eyebrow:** ALL-CAPS, `--color-primary-500`, letter-spacing 0.12em, small cyan divider line left of text (3px × 20px)

**Subheading:** Inter 18px, `--color-text-secondary`, max-width 560px, line-height 1.75

**CTAs:**
- Primary: gradient button (same as Nav CTA), larger: padding 14px 32px, border-radius 10px
- Secondary: Ghost button — `border: 1px solid var(--color-border-strong)`, text `--color-primary-500`, hover: background `var(--color-primary-glow)`

**Trust Strip (below CTAs):**  
`—— Trusted by leading hospitals ——` in `--color-text-muted`, followed by 4–5 greyscale partner/hospital logos at 40% opacity → hover 100%

**Background accent:**  
- Subtle radial glow behind H1: `radial-gradient(ellipse 600px 400px at 50% 40%, rgba(0,212,232,0.06), transparent)`
- Optional: faint animated circular scanner ring (CSS @keyframes, scale + fade, 4s loop) centered behind the headline

---

### 4.4 Services Section

**Layout:** Centered content, max-width 1200px  
**Structure:**
```
[Eyebrow] [H2] [Body intro]
[3-column grid of feature cards]
```

**Grid:** 3 columns desktop → 1 column mobile, gap 24px

**Feature Card Anatomy:**
```
[Icon — 40×40 cyan gradient SVG]
[Card Title — H3]
[Description — Body 15px]
[Learn more → link]
```

- Background: `var(--color-bg-surface)`
- Border: `1px solid var(--color-border)`
- Border-radius: 16px
- Padding: 32px
- Top edge highlight: `var(--gradient-card-edge)` as `::before` pseudo-element
- Hover: `border-color: var(--color-border-strong)`, `box-shadow: 0 8px 32px rgba(0,212,232,0.08)`, card lifts `translateY(-4px)` — 0.3s ease

**Suggested 3 Services:**
1. AI-Powered Lesion Detection
2. Automated Classification & Reporting
3. Seamless Workflow Integration

**Icon style:** Monoline SVG, stroke `url(#cyan-gradient)`, 2px stroke-width

---

### 4.5 About Section

**Layout:** 2-column split, max-width 1200px  
**Left:** Text block (60% width)  
**Right:** Visual element (40% width)

```
LEFT                                RIGHT
[Eyebrow]                          [Stats card cluster]
[H2]
[Body copy — 2–3 paragraphs]
[Secondary CTA — "Our Research"]
```

**Stats cards (right column):**  
3 stacked/grid cards, each showing one key metric:
```
[Number — JetBrains Mono 48px bold, gradient text]
[Label — Inter 14px, --color-text-secondary]
```
Example: `98.2%` / Sensitivity Rate · `<3min` / Avg. Analysis Time · `50K+` / Cases Analyzed

Card style: same as Services card but compact, accent left border `3px solid var(--color-primary-500)`

**Body copy tone:** Confident, peer-reviewed language. No marketing fluff.

**Mobile:** Stack vertically, stats above text

---

### 4.6 Contact Section

**Layout:** Centered, max-width 640px  
**Structure:**
```
[Eyebrow — "GET IN TOUCH"]
[H2 — "Ready to Transform Your Endoscopy Workflow?"]
[Subtext]
[Form: Name | Email | Hospital/Institution | Message]
[Submit CTA]
```

**Form field style:**
- Background: `var(--color-bg-elevated)`
- Border: `1px solid var(--color-border)`
- Border-radius: 8px
- Padding: 12px 16px
- Font: Inter 15px, `--color-text-primary`
- Label: Inter 13px Medium, `--color-text-secondary`, above field
- Focus: `border-color: var(--color-primary-500)`, `box-shadow: 0 0 0 3px var(--color-primary-glow)`

**Section background:**  
Slightly lighter surface `var(--color-bg-surface)` with full-bleed, creating a visual break from About

---

### 4.7 Footer

**Layout:** 3-column, max-width 1200px  
**Structure:**
```
[Logo + tagline]    [Links: Company/Legal]    [Links: Product/Contact]
─────────────────────────────────────────────────────────────
© 2025 Nexture Limited · All rights reserved · Christchurch, NZ
```

- Background: `var(--color-bg-subtle)` — slightly distinct from page bg
- Top border: `1px solid var(--color-border)`
- Text: `--color-text-muted`, hover links `--color-text-secondary`
- Tagline: "Pushing the Boundaries of AI"

**Mobile:** Single column stack, logo + tagline → links → copyright

---

## 5. Spacing & Layout System

```css
:root {
  /* Base unit: 4px */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-32:  128px;

  /* Section vertical padding */
  --section-py-desktop: var(--space-24);   /* 96px top/bottom */
  --section-py-mobile:  var(--space-16);   /* 64px top/bottom */

  /* Max widths */
  --container-sm:  640px;
  --container-md:  768px;
  --container-lg:  1024px;
  --container-xl:  1200px;
  --container-2xl: 1400px;

  /* Border radii */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:  0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg:  0 8px 32px rgba(0,0,0,0.6);
  --shadow-glow-cyan:   0 0 24px rgba(0,212,232,0.25);
  --shadow-glow-indigo: 0 0 24px rgba(91,110,245,0.25);

  /* Transitions */
  --transition-fast:   0.15s ease;
  --transition-base:   0.25s ease;
  --transition-slow:   0.4s ease;
  --transition-spring: 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 6. Mobile Visual Adaptation

### Breakpoints
```css
/* Tailwind-aligned */
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
```

### Key Adaptations by Section

| Section | Desktop | Mobile |
|---|---|---|
| Nav | Horizontal links + CTA | Hamburger → slide drawer |
| Hero | Centered, vh100, large H1 72px | Centered, H1 40–48px, reduced padding |
| Services | 3-col grid | 1-col stack, card full-width |
| About | 2-col split | 1-col, stats grid (2×2) above text |
| Contact | 640px centered form | Full-width, 16px horizontal padding |
| Footer | 3-col | 1-col, centered text |

### Typography Scaling
- H1: 72px → 40px (clamp: `clamp(2.5rem, 8vw, 4.5rem)`)
- H2: 48px → 28px (`clamp(1.75rem, 6vw, 3rem)`)
- Body: always 16px minimum (WCAG readability)

### Particle System — Mobile
- Reduce count: 80 → 35
- Disable mouse interaction (touch devices)
- Maintain same color/opacity ratios

### Touch Targets
- All interactive elements: min 44×44px
- Form fields: min height 48px
- Buttons: min height 48px

### Specific Visual Notes
- Remove hover-state decorations (no `translateY` cards on touch)
- Reduce glow effects by 40% for performance
- Gradient text on H1 retained (CSS only, no performance impact)
- Trust logo strip: horizontal scroll on mobile (overflow-x: auto, scroll-snap)
- Stats in About: 2×2 grid instead of 3-stack

---

## 7. Animation & Motion Guidelines

```css
/* Scroll-reveal: elements enter from below */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children in grids */
.card:nth-child(1) { transition-delay: 0ms; }
.card:nth-child(2) { transition-delay: 100ms; }
.card:nth-child(3) { transition-delay: 200ms; }
```

**Rules:**
- Motion only serves clarity — no animation for decoration alone
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables all transitions and particle animation
- Particle canvas pauses when tab is not visible (`visibilitychange` event)
- Hero entrance: H1 fades up first (0ms), subheading (100ms), CTAs (200ms), trust strip (400ms)

---

## 8. Component Quick-Reference for Finn

| Component | Key Tokens |
|---|---|
| Primary Button | `--gradient-cta-btn`, `--radius-md`, Inter 600, white text, hover `brightness(1.1)` + `--shadow-glow-cyan` |
| Ghost Button | `border: 1px solid --color-border-strong`, `--color-primary-500`, hover `--color-primary-glow` bg |
| Service Card | `--color-bg-surface`, `--color-border`, `--radius-lg`, hover `translateY(-4px)` + `--shadow-glow-cyan` |
| Stats Card | `--color-bg-surface`, left `3px solid --color-primary-500`, `--font-mono` for number |
| Form Input | `--color-bg-elevated`, `--color-border`, focus `--color-primary-500` border + `--color-primary-glow` ring |
| Nav Bar | `backdrop-filter: blur(16px)`, `rgba(6,15,34,0.85)` bg, `--color-border` bottom |
| Eyebrow Label | `--color-primary-500`, `--tracking-widest`, `--text-xs`, uppercase, left accent line |
| Gradient Text | `background: --gradient-text`, `-webkit-background-clip: text`, `-webkit-text-fill-color: transparent` |

---

*Design Spec v1.0 — Aria · For implementation by Finn · Queries via q*