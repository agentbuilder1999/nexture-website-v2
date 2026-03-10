# Tech Spec v2 — nexture.nz Multi-Page Website

> Author: Atlas | Version: 2.0 | 2026-03-11
> Supersedes: v1.0 (Sprint-01 single-page spec)

---

## 0. Architecture Change Summary (v1 → v2)

| Aspect | v1 (Sprint-01) | v2 (Sprint-02) |
|---|---|---|
| Structure | Single `index.html` | 5 HTML pages + shared CSS/JS |
| Hero | Static gradient | `<video>` autoplay + Canvas particle slogan |
| Color system | Cyan/indigo (Aria original) | Brand-derived from logo (#E8005A + #2D3282 + #7B2070) |
| File budget | < 50KB single file | < 30KB per HTML, < 10KB shared CSS, < 8KB shared JS |
| Fonts | Internal debate | Space Grotesk 600/700 subset inline + system-ui (ADR-001) |

---

## 1. Multi-Page Architecture

### 1.1 File Structure

```
nexture.nz/
├── index.html              # Home — video hero + particle slogan
├── product.html            # Product — AI capabilities, workflow
├── team.html               # Team — founders, advisors
├── media.html              # Media — press, publications, videos
├── contact.html            # Contact — form + location
├── shared.css              # Shared styles: reset, tokens, nav, footer, typography
├── shared.js               # Shared scripts: nav toggle, scroll behavior
├── particles.js            # Particle system (Home-only, loaded conditionally)
├── assets/
│   ├── fonts/
│   │   └── space-grotesk-latin.woff2   # Subset: 600+700, Latin Basic only
│   ├── video/
│   │   └── hero-bg.mp4                 # Hero background video (≤ 5MB, H.264)
│   ├── img/                             # Optimized images (WebP preferred)
│   └── icons/                           # SVG icons (inline where possible)
└── favicon.ico
```

### 1.2 Page Template (All Pages Share This Skeleton)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Title] — Nexture</title>
  <meta name="description" content="[Page-specific description]">
  <link rel="stylesheet" href="shared.css">
  <!-- Page-specific <style> if needed (< 2KB) -->
</head>
<body data-page="[home|product|team|media|contact]">

  <!-- ① Navigation (identical across all pages) -->
  <nav class="nav" role="navigation" aria-label="Main navigation">
    <a href="/" class="nav__logo" aria-label="Nexture home">
      <!-- Inline SVG logo -->
    </a>
    <button class="nav__toggle" aria-expanded="false" aria-controls="nav-menu">
      <!-- Hamburger icon -->
    </button>
    <ul id="nav-menu" class="nav__links">
      <li><a href="/" data-nav="home">Home</a></li>
      <li><a href="/product.html" data-nav="product">Product</a></li>
      <li><a href="/team.html" data-nav="team">Team</a></li>
      <li><a href="/media.html" data-nav="media">Media</a></li>
      <li><a href="/contact.html" data-nav="contact">Contact</a></li>
    </ul>
  </nav>

  <!-- ② Page Content (varies per page) -->
  <main>
    <!-- ... -->
  </main>

  <!-- ③ Footer (identical across all pages) -->
  <footer class="footer" role="contentinfo">
    <!-- ... -->
  </footer>

  <script src="shared.js"></script>
  <!-- Page-specific scripts if needed -->
</body>
</html>
```

### 1.3 Active Nav State

```javascript
// In shared.js — auto-highlight current page
const page = document.body.dataset.page;
document.querySelector(`[data-nav="${page}"]`)?.classList.add('nav__link--active');
```

---

## 2. Home Page: Video Hero + Particle Slogan

### 2.1 Layer Stack (z-index order)

```
┌─────────────────────────────────────────┐
│  z-index: 100  Nav (fixed top)          │
├─────────────────────────────────────────┤
│  z-index: 2    Canvas (particles → slogan) │  ← particles ARE the slogan
│  z-index: 1    Color overlay               │  ← rgba tint for contrast
│  z-index: 0    <video> (hero bg)           │  ← fullscreen video
└─────────────────────────────────────────┘
```

> **Key change (v2.1):** Slogan text is no longer a separate HTML `<h1>`.
> Particles themselves assemble into the text "Pushing the Boundaries of AI".
> The Canvas layer serves dual purpose: animation engine + text display.

### 2.2 Video Background Spec

```html
<section class="hero" id="hero">
  <!-- Layer 0: Video -->
  <video class="hero__video"
         autoplay muted loop playsinline
         poster="assets/img/hero-poster.webp">
    <source src="assets/video/hero-bg.mp4" type="video/mp4">
  </video>

  <!-- Layer 1: Overlay for contrast -->
  <div class="hero__overlay"></div>

  <!-- Layer 2: Particle canvas -->
  <canvas class="hero__particles" id="particles"></canvas>

  <!-- Layer 2: Particle canvas (renders slogan text) -->
  <!-- Canvas draws: "Pushing the Boundaries of AI" via particle assembly -->

  <!-- Layer 3: Subtitle + CTAs (HTML, below particle slogan area) -->
  <div class="hero__content">
    <!-- NO <h1> here — the particle canvas IS the headline -->
    <!-- Hidden h1 for accessibility/SEO: -->
    <h1 class="sr-only">Pushing the Boundaries of AI</h1>
    <p class="hero__subtitle"><!-- Subtext --></p>
    <div class="hero__cta">
      <a href="/contact.html" class="btn btn--primary">Get Started</a>
      <a href="/product.html" class="btn btn--ghost">Learn More</a>
    </div>
  </div>
</section>
```

**Video requirements:**
- Format: H.264 MP4 (universal browser support)
- Resolution: 1920×1080 max (CSS `object-fit: cover` handles scaling)
- Duration: ≤ 15 seconds loop
- File size: ≤ 5MB (aggressive compression, visual quality secondary to load speed)
- Poster image: WebP, ≤ 50KB (shown until video loads)
- Mobile: same video, CSS crops via `object-fit: cover`; consider `<source media="(max-width:768px)">` with lower-res version if available

**Video CSS:**

```css
.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(14, 16, 40, 0.65) 0%,      /* top: heavier for nav readability */
    rgba(14, 16, 40, 0.40) 50%,      /* mid: let video show */
    rgba(14, 16, 40, 0.75) 100%      /* bottom: heavier for text contrast */
  );
  z-index: 1;
}
```

### 2.2.1 Video Audio Interaction

**Behavior (Victor confirmed):**

| State | Trigger | Result |
|---|---|---|
| Default (page load) | — | `autoplay muted loop playsinline`, no controls bar |
| First click on video area | `click` | Unmute, `volume = 0.6` (60% system volume) |
| Second click | `click` | Re-mute |
| Subsequent clicks | `click` | Toggle mute/unmute |

**HTML:**
```html
<video id="hero-video" autoplay muted loop playsinline
       poster="assets/img/hero-poster.webp">
  <source src="assets/video/hero-web.mp4" type="video/mp4">
</video>
```

> ⚠️ No `controls` attribute. No custom play/pause. Only mute toggle.

**JS (in shared.js or inline on index.html):**
```javascript
const video = document.getElementById('hero-video');
const muteIcon = document.querySelector('.hero__mute-icon');

video.addEventListener('click', () => {
  if (video.muted) {
    video.muted = false;
    video.volume = 0.6;
  } else {
    video.muted = true;
  }
  updateMuteIcon();
});

function updateMuteIcon() {
  muteIcon.dataset.state = video.muted ? 'muted' : 'unmuted';
}
```

**Mute status indicator:**
```html
<!-- Inside .hero, z-index: 4 (above canvas) -->
<button class="hero__mute-icon" data-state="muted"
        aria-label="Toggle video sound">
  <!-- SVG: speaker-off / speaker-on icon -->
</button>
```

```css
.hero__mute-icon {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 4;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;                         /* hidden by default */
  transition: opacity 0.25s ease;
  color: var(--color-text-muted);
}

/* Visible on hero hover or when unmuted */
.hero:hover .hero__mute-icon,
.hero__mute-icon[data-state="unmuted"] {
  opacity: 0.6;
}
.hero__mute-icon:hover {
  opacity: 1;
  color: var(--color-text-primary);
}
```

**Click target note:** The video element itself receives the click for mute toggle.
The overlay (`hero__overlay`) and canvas (`hero__particles`) must have
`pointer-events: none` so clicks pass through to the `<video>`.
The mute icon button is a visual indicator — clicking the icon should also toggle
(add a separate click listener on `.hero__mute-icon` that calls the same toggle logic,
with `e.stopPropagation()` to prevent double-firing).

**Accessibility:**
- `<button>` with `aria-label="Toggle video sound"`
- `aria-pressed` toggled on click: `true` when unmuted, `false` when muted
- Keyboard: `Enter`/`Space` on focused button triggers toggle

### 2.3 Particle System — Text Assembly (Home-Only)

**Loaded conditionally:**
```html
<!-- Only on index.html -->
<script src="particles.js"></script>
```

**Engine:** Native Canvas 2D API (unchanged)

**Visual role (UPDATED — Victor directive):** Particles ARE the slogan. They spawn at
random positions, fly in, and assemble to spell out the text. This is the hero's
primary visual element — not a background effect.

#### 2.3.1 Text Assembly Pipeline

```
Step 1: Offscreen Canvas Text Sampling
───────────────────────────────────────
  - Create offscreen canvas (same dimensions as visible canvas)
  - Render slogan text: "Pushing the Boundaries of AI"
  - Font: Space Grotesk 700, size = responsive (clamp 36px–72px)
  - Call getImageData() → scan pixel array
  - Sample lit pixels at regular grid interval (every 3–4px)
  - Store as target coordinate array: [{x, y}, ...]
  - Particle count = number of sampled points (typically 800–2000)

Step 2: Particle Initialization
───────────────────────────────
  - Each particle gets:
    · startX, startY: random position (spread across full viewport)
    · targetX, targetY: assigned text pixel coordinate from Step 1
    · currentX, currentY: animation interpolation position
    · radius: 1.5–2.5px
    · color: random from brand palette (pink/blue/purple/white)
    · delay: staggered 0–800ms (creates wave-in effect)

Step 3: Fly-In Animation
─────────────────────────
  - Easing: cubic-bezier ease-out (fast start, gentle land)
  - Duration: 1.5–2.5s per particle (randomized for organic feel)
  - Stagger: particles closer to center arrive first (radial wave)
  - On arrival: particle settles at targetX/targetY

Step 4: Idle Breathing (Post-Assembly)
──────────────────────────────────────
  - Each particle oscillates around its target: ±2px random offset
  - Motion: gentle Perlin-noise-like drift (sin/cos with random phase)
  - Period: 2–4s per cycle
  - Effect: text is legible but feels alive, never fully static

Step 5: Mouse/Touch Interaction (Optional Enhancement)
──────────────────────────────────────────────────────
  - Mouse enters radius (120px): nearby particles scatter outward
  - Scatter force: proportional to 1/distance², capped at 80px displacement
  - Mouse leaves: particles ease back to target positions (0.8s ease-out)
  - Mobile: touch-and-hold triggers same effect at touch point
```

#### 2.3.2 Responsive Text Sizing

```
Desktop (≥ 1200px):  font-size 64–72px  →  ~1500–2000 particles
Tablet  (768–1199px): font-size 44–56px  →  ~800–1200 particles
Mobile  (< 768px):    font-size 32–40px  →  ~500–800 particles
                      Text may wrap to 2–3 lines
```

Sampling grid density adjusts with viewport:
- Desktop: sample every 3px → high density, crisp text
- Mobile: sample every 4–5px → fewer particles, still legible

#### 2.3.3 Configuration

```javascript
const PARTICLE_CONFIG = {
  // Text
  slogan: 'Pushing the Boundaries of AI',
  fontFamily: 'Space Grotesk',
  fontWeight: 700,
  fontSize: {                        // responsive, CSS clamp equivalent
    desktop: 68,                     // px, ≥ 1200px viewport
    tablet: 48,                      // px, 768–1199px
    mobile: 36                       // px, < 768px
  },
  textAlign: 'center',
  textBaseline: 'middle',
  samplingGap: {                     // px between sampled points
    desktop: 3,
    tablet: 4,
    mobile: 5
  },

  // Appearance
  radiusRange: [1.5, 2.5],
  color: {
    primary: 'rgba(232, 0, 90,',     // brand pink #E8005A
    secondary: 'rgba(45, 50, 130,',  // brand blue #2D3282
    tertiary: 'rgba(123, 32, 112,',  // brand purple #7B2070
    accent: 'rgba(255, 255, 255,',   // white
    mix: [0.40, 0.20, 0.20, 0.20]
  },
  baseAlpha: 0.85,                   // high opacity — text must be readable

  // Fly-in animation
  flyIn: {
    durationRange: [1500, 2500],     // ms per particle
    staggerMax: 800,                 // ms max delay (radial wave)
    easing: 'easeOutCubic'           // (t) => 1 - Math.pow(1 - t, 3)
  },

  // Idle breathing
  breathing: {
    amplitude: 2,                    // px max offset from target
    periodRange: [2000, 4000]        // ms per oscillation cycle
  },

  // Mouse interaction
  mouse: {
    enabled: true,
    radius: 120,                     // px influence zone
    scatterForce: 0.08,              // force multiplier
    maxDisplacement: 80,             // px cap
    returnEasing: 'easeOutQuad',     // return-to-target easing
    returnDuration: 800              // ms
  },

  // Performance
  fpsTarget: 60,
  pauseOnHidden: true,
  reducedMotion: 'static'            // show fully assembled text instantly, no animation
};
```

#### 2.3.4 Accessibility & Fallback

| Scenario | Behavior |
|---|---|
| `prefers-reduced-motion: reduce` | Skip fly-in, render particles at final positions instantly. Disable breathing + mouse scatter. |
| Canvas unsupported | Fallback: show `<h1 class="sr-only">` as visible block element |
| SEO / screen readers | Hidden `<h1 class="sr-only">Pushing the Boundaries of AI</h1>` always in DOM |

#### 2.3.5 Performance Notes

- **Particle count scales with viewport** — no fixed number; driven by text size × sampling density
- **No connection lines** — unlike v1 ambient particles, text-assembly particles don't draw inter-particle lines (would obscure text legibility)
- **requestAnimationFrame** with delta-time normalization (frame-rate independent animation)
- **Object pool**: pre-allocate particle array at init, no GC during animation
- **Resize handling**: debounce 200ms → re-sample text → re-assign targets → quick re-assembly (300ms fly-in)

#### 2.3.6 File Size Impact

| Component | Estimated Size |
|---|---|
| Text sampling logic | ~1.5 KB |
| Particle class + pool | ~1.5 KB |
| Animation loop + easing | ~1.0 KB |
| Mouse interaction | ~0.5 KB |
| Config + init | ~0.5 KB |
| **Total particles.js** | **~5 KB** (within budget) |

---

## 3. Brand Color System

### 3.1 Logo-Derived Palette

Base colors extracted from Nexture logo:
- **Brand Pink:** `#E8005A` — primary brand accent
- **Brand Blue:** `#2D3282` — authority, depth
- **Brand Purple:** `#7B2070` — gradient bridge, secondary accent

### 3.2 Design Tokens

```css
:root {
  /* ── Core Brand (from logo source file) ── */
  --brand-pink:          #E8005A;    /* primary accent — logo magenta/pink */
  --brand-blue:          #2D3282;    /* authority, depth — logo navy */
  --brand-purple:        #7B2070;    /* secondary accent — logo purple */

  /* ── Backgrounds (dark theme, derived from --brand-blue) ── */
  --color-bg-deep:       #08081e;    /* deepest: body background */
  --color-bg-primary:    #0e1028;    /* page sections */
  --color-bg-surface:    #161838;    /* cards, elevated elements */
  --color-bg-elevated:   #1e2048;    /* hover states, inputs */

  /* ── Primary Accent — Pink ── */
  --color-primary-600:   #c00048;    /* pressed/active */
  --color-primary-500:   #E8005A;    /* default — CTAs, links, highlights */
  --color-primary-400:   #f02070;    /* hover */
  --color-primary-300:   #f54088;    /* light accent */
  --color-primary-200:   #ffa0c8;    /* very light / disabled */
  --color-primary-glow:  rgba(232, 0, 90, 0.20);

  /* ── Secondary — Blue ── */
  --color-secondary-600: #202868;
  --color-secondary-500: #2D3282;    /* secondary actions, badges */
  --color-secondary-400: #404898;
  --color-secondary-glow: rgba(45, 50, 130, 0.25);

  /* ── Tertiary — Purple ── */
  --color-tertiary-600:  #601858;
  --color-tertiary-500:  #7B2070;    /* accent elements, gradient midpoint */
  --color-tertiary-400:  #963888;
  --color-tertiary-glow: rgba(123, 32, 112, 0.20);

  /* ── Neutrals ── */
  --color-text-primary:  #f0f0ff;    /* headings, primary text */
  --color-text-secondary:#9898c0;    /* body, captions */
  --color-text-muted:    #505080;    /* placeholders, disabled */
  --color-border:        rgba(232, 0, 90, 0.12);
  --color-border-strong: rgba(232, 0, 90, 0.35);

  /* ── Semantic ── */
  --color-success:       #10b981;
  --color-warning:       #f59e0b;
  --color-error:         #ef4444;

  /* ── Gradients ── */
  --gradient-brand:      linear-gradient(135deg, #E8005A 0%, #7B2070 50%, #2D3282 100%);
  --gradient-hero-overlay: linear-gradient(180deg,
                            rgba(14, 16, 40, 0.65) 0%,
                            rgba(14, 16, 40, 0.40) 50%,
                            rgba(14, 16, 40, 0.75) 100%);
  --gradient-cta:        linear-gradient(135deg, #E8005A 0%, #7B2070 100%);
  --gradient-card-edge:  linear-gradient(180deg, rgba(232,0,90,0.10) 0%, transparent 100%);
  --gradient-text:       linear-gradient(90deg, #E8005A, #7B2070);
}
```

### 3.3 Accessibility Check (Target)

| Pair | Min Ratio | WCAG |
|---|---|---|
| `--color-text-primary` (#f0f0ff) on `--color-bg-primary` (#0e1028) | ≥ 15:1 | AAA |
| `--color-primary-500` (#E8005A) on `--color-bg-primary` (#0e1028) | ≥ 5.5:1 | AA+ |
| `--color-text-secondary` (#9898c0) on `--color-bg-surface` (#161838) | ≥ 4.5:1 | AA |
| White on `--gradient-cta` (#E8005A → #7B2070) | ≥ 4.5:1 | AA |

> Finn: verify exact ratios during implementation with DevTools contrast checker.

---

## 4. Typography (ADR-001 Compliant)

```css
:root {
  /* Families — per ADR-001 */
  --font-display:  'Space Grotesk', system-ui, sans-serif;
  --font-body:     system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono:     ui-monospace, 'SF Mono', 'Cascadia Code', monospace;

  /* Scale */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;
  --text-6xl:  3.75rem;
  --text-7xl:  4.5rem;
}
```

**Font loading:** `space-grotesk-latin.woff2` loaded via `@font-face` in `shared.css` with `font-display: swap`. File served from `assets/fonts/` (not CDN).

**Subset spec:** Latin Basic (U+0020-007F) + common punctuation. Target: ≤ 20KB for both weights combined.

---

## 5. Shared Components Spec

### 5.1 Navigation (`shared.css` + `shared.js`)

**Desktop (≥ 768px):**
```
[Logo]          [Home] [Product] [Team] [Media] [Contact]    [Get Demo →]
```

**Mobile (< 768px):**
```
[Logo]                                                [☰ Toggle]
```
→ Toggle reveals full-height slide-down menu

**Styles:**
- `position: fixed; top: 0; width: 100%; z-index: 100`
- Background: `rgba(8, 8, 30, 0.92)` — NO backdrop-filter on mobile (ADR-001)
- Desktop: `backdrop-filter: blur(12px) saturate(160%)` allowed
- Active page: `nav__link--active` with `--color-primary-500` underline
- CTA button: `--gradient-cta` background

### 5.2 Footer (`shared.css`)

```
[Logo + tagline]    [Page Links]    [Legal + Social]
────────────────────────────────────────────────────
© 2026 Nexture Limited · Christchurch, New Zealand
```

- Background: `--color-bg-deep`
- Top border: `1px solid var(--color-border)`

### 5.3 Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `--gradient-cta` | white | none | `brightness(1.15)` + `--color-primary-glow` shadow |
| Ghost | transparent | `--color-primary-500` | `--color-border-strong` | `--color-primary-glow` bg |
| Secondary | `--color-bg-elevated` | `--color-text-primary` | `--color-border` | `--color-bg-surface` border glow |

All buttons: `border-radius: 8px`, `min-height: 48px` (touch target), `font: --font-body 600`

---

## 6. Per-Page Content Spec

### 6.1 Home (`index.html`)

| Element | Spec |
|---|---|
| Hero | Video bg + overlay + particle canvas + slogan (see §2) |
| Below fold | Brief value proposition cards (2–3), reuse card component |
| CTA | Primary "Get Started" → contact.html |

### 6.2 Product (`product.html`)

| Element | Spec |
|---|---|
| Hero | Static — gradient bg + H1 + subtitle (no video, no particles) |
| Content | Feature sections: AI capabilities, workflow integration, accuracy metrics |
| Layout | Alternating left-right sections with illustrations/screenshots |

### 6.3 Team (`team.html`)

| Element | Spec |
|---|---|
| Hero | Static — gradient bg + H1 |
| Content | Team member cards: photo (WebP, ≤ 30KB each), name, role, bio |
| Layout | Grid: 3-col desktop → 1-col mobile |

### 6.4 Media (`media.html`)

| Element | Spec |
|---|---|
| Hero | Static — gradient bg + H1 |
| Content | Press mentions, publications, embedded videos (lazy-load iframes) |
| Layout | Card grid with date/source/title |

### 6.5 Contact (`contact.html`)

| Element | Spec |
|---|---|
| Hero | Static — gradient bg + H1 |
| Content | Contact form (Name, Email, Institution, Message) + location info |
| Form | HTML5 validation, no JS framework, action=mailto or static form service |

---

## 7. File Size Budget

### 7.1 Per-File Limits (uncompressed)

| File | Budget | Notes |
|---|---|---|
| `shared.css` | ≤ 10 KB | Reset + tokens + nav + footer + typography + buttons + utilities |
| `shared.js` | ≤ 4 KB | Nav toggle + active state + scroll behavior |
| `particles.js` | ≤ 5 KB | Canvas particle system (Home-only) |
| `index.html` | ≤ 30 KB | Includes hero markup + page-specific CSS/JS |
| `product.html` | ≤ 25 KB | Content-heavy but no video/canvas |
| `team.html` | ≤ 20 KB | Minimal (photos are external assets) |
| `media.html` | ≤ 20 KB | Minimal (videos lazy-loaded) |
| `contact.html` | ≤ 15 KB | Form + location |
| Font (woff2) | ≤ 20 KB | Space Grotesk 600+700 Latin subset |

### 7.2 Total First-Load Budget (Home Page)

| Resource | Size |
|---|---|
| index.html | ≤ 30 KB |
| shared.css | ≤ 10 KB |
| shared.js | ≤ 4 KB |
| particles.js | ≤ 5 KB |
| Font woff2 | ≤ 20 KB |
| Hero poster (WebP) | ≤ 50 KB |
| **Subtotal (before video)** | **≤ 119 KB** |
| Hero video (streamed) | ≤ 5 MB (not blocking FCP) |

### 7.3 Performance Targets

| Metric | Target |
|---|---|
| FCP (First Contentful Paint) | < 1.2s (relaxed from v1 due to multi-file) |
| LCP (Largest Contentful Paint) | < 2.5s (video poster counts as LCP) |
| Particle FPS | ≥ 55 fps @ 1080p |
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |

---

## 8. Technical Constraints

### Hard Constraints
- **Zero build tools:** No Webpack/Vite/PostCSS — plain HTML/CSS/JS
- **Zero CDN dependencies:** No external CDN for fonts, icons, or libraries
- **ES6+:** `const/let`, arrow functions, template literals, `class`
- **Responsive:** Mobile-first, breakpoints at 480px / 768px / 1200px
- **External assets allowed:** Images, video, fonts served from same origin (not inlined)

### Browser Support
- Chrome 80+, Firefox 78+, Safari 14+, Edge 80+
- iOS Safari 14+, Chrome Android 80+
- **No IE support**

### Accessibility
- Semantic HTML5 (`<nav>`, `<main>`, `<section>`, `<footer>`)
- `prefers-reduced-motion`: disable particles, remove transitions
- All interactive elements keyboard-accessible
- Color contrast ≥ 4.5:1 (WCAG AA)
- `aria-label` on nav, `aria-expanded` on toggle
- Video: `muted` + no essential audio content (decorative)

---

## 9. Implementation Checklist (Finn Self-Review)

Before every Handoff, verify ALL items:

### Structure & Hygiene
- [ ] Zero HTML comments in output (`grep '<!--' *.html` → 0 matches, except conditional comments if any)
- [ ] All pages share identical `<nav>` and `<footer>` markup
- [ ] `data-page` attribute set correctly on each page's `<body>`
- [ ] Active nav state works on every page

### File Size
- [ ] Each HTML file within budget (use `wc -c`)
- [ ] `shared.css` ≤ 10 KB
- [ ] `shared.js` ≤ 4 KB
- [ ] `particles.js` ≤ 5 KB

### Visual
- [ ] Particles visibly render on dark background (not too faint)
- [ ] Video autoplays muted on desktop and mobile
- [ ] Poster image displays before video loads
- [ ] No horizontal overflow at 375px viewport width
- [ ] CTA buttons meet 48px minimum touch target

### Performance
- [ ] Lighthouse Performance ≥ 90 (run on Home page)
- [ ] Lighthouse Accessibility ≥ 95
- [ ] DevTools Console: zero errors, zero warnings
- [ ] `prefers-reduced-motion`: particles stop, page fully functional

### Cross-Page
- [ ] All nav links work (no 404s)
- [ ] All pages render correctly in Chrome + Safari
- [ ] Footer consistent across all pages

---

## 10. Acceptance Criteria & Handoff Requirements

### 10.1 Mandatory Screenshots (Every Handoff)

| Screenshot | Spec |
|---|---|
| Home desktop | 1440px width, full hero visible (video + particles + slogan) |
| Home mobile | 375px width, same hero |
| Product desktop | 1440px, full above-fold |
| Any page mobile nav | 375px, hamburger menu open |
| Lighthouse report | Home page, Performance + Accessibility scores visible |

### 10.2 Acceptance Criteria (Sprint-02)

| # | Criterion | Verifier |
|---|---|---|
| AC-1 | 5 HTML pages render without errors (Console clean) | Finn self-check |
| AC-2 | Shared nav highlights current page correctly | Finn self-check |
| AC-3 | Home hero: video autoplays muted, particles visible, slogan readable | Screenshot → Aria verify |
| AC-4 | All file sizes within §7 budget | Finn `wc -c` output |
| AC-5 | Lighthouse Performance ≥ 90 | Screenshot → Atlas verify |
| AC-6 | Lighthouse Accessibility ≥ 95 | Screenshot → Atlas verify |
| AC-7 | Mobile responsive: no overflow, touch targets ≥ 48px | Mobile screenshot → Aria verify |
| AC-8 | `prefers-reduced-motion` disables all animation | Finn self-check |
| AC-9 | Brand colors match §3 token definitions | Screenshot → Aria verify |
| AC-10 | Zero HTML comments in delivered files | Finn `grep` check |

### 10.3 Handoff Flow

```
Finn implements
  → Finn runs §9 Checklist (all boxes checked)
  → Finn posts Handoff + 5 screenshots to Telegram topic
  → Atlas verifies: file sizes + Lighthouse scores
  → Aria verifies: visual fidelity + brand colors + responsiveness
  → q final sign-off
```

---

## 11. Deployment Architecture

```
Route53 (nexture.nz)
  → CloudFront (CDN, HTTPS via ACM cert)
    → S3 bucket (static hosting, private)
       ├── index.html
       ├── product.html
       ├── team.html
       ├── media.html
       ├── contact.html
       ├── shared.css
       ├── shared.js
       ├── particles.js
       └── assets/
            ├── fonts/
            ├── video/
            ├── img/
            └── icons/
```

- S3 bucket: private, CloudFront OAC access only
- CloudFront: gzip/brotli compression, cache-control headers
- HTTPS: ACM certificate for `nexture.nz` + `www.nexture.nz`
- Redirect: `www.nexture.nz` → `nexture.nz` (canonical)

---

## Changelog

| Date | Version | Change |
|---|---|---|
| 2026-03-10 | 1.0 | Initial single-page spec |
| 2026-03-11 | 2.0 | Multi-page architecture, video hero, brand color system, acceptance criteria |

---

*End of spec. Aria: design-spec update per §3 color tokens. Finn: implement per §1 structure + §9 checklist. Atlas: verify per §10.*
