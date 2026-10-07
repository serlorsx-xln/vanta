# VANTA

A one-page website for VANTA, a fictional creative technology studio in Lisbon and Rotterdam, built with Vite, vanilla JavaScript, GSAP (ScrollTrigger, SplitText), Lenis and a single WebGL2 renderer. VANTA is named after the blackest black, so the page is built on a void: an ink rectangle that opens, retracts and returns. It contains no photographs; every image is a line engraving drawn live in the browser. It is a design study: the studio, its clients, case studies and people are invented, and the page says so in its footer.

## Why it exists

The brief asked for an art-directed studio site that avoids the usual landing-page kit (cards, rounded containers, gradients, glows, glassmorphism, badges, particles, a centred hero). The answer is one concept, **The Blackest Black**. Two materials, paper and ink, carry the page, with one blue for state. A few motions carry the story, each tied to one idea: the void opens like an aperture, plates develop from coarse bars to fine lines, the philosophy is redacted on screen, capability names solve their own width, and transitions wipe with ink. Every word, client, number and person belongs to the invented studio.

```
scroll ──> Lenis (smooth on wheel; native on touch and under reduced motion)
             │
             ▼
   ScrollTrigger per section ──> hero · work · redact · caps · studio · contact
             │                     (scroll-scrubbed moves and play-once reveals)
             ▼
   theme.js: html[data-theme] crossfades the page between paper and ink

   gsap.ticker ──> lenis.raf ──> renderer.render
                                     │
                                     ▼
                one offscreen WebGL2 context, eight scenes
                                     │  drawImage
                                     ▼
   void · plates · archive preview · case plates · footer wordmark
```

## Features

Read from the code, accurate as of the current `main`.

- **The void** (`src/js/hero.js`). On load the screen is ink, and the void retracts into its slot while the wordmark and the hero line rise. The plate inside cycles through the four featured projects. On scroll it opens until it has absorbed the page, and the studio introduction is set on it line by line.
- **One renderer for every image** (`src/js/renderer.js`). A single WebGL2 context draws eight procedural scenes as line-screen engravings and copies each frame into its page canvas. Each plate has its own scene, seed, line period, resolve (coarse to fine) and pointer lens. The renderer only draws visible plates, holds a pixel budget and lowers its render scale if frames stay slow.
- **Developing plates** (`src/js/work.js`). Each featured plate opens from a slit and its engraving resolves as it enters, and the canvas drifts against its frame on scroll. On a mouse, a lens swells the lines under the cursor and a label names the click.
- **Four spreads, four layouts**. Halden, Mirae Museum of Light, Northvault and Ostra each get their own composition. Four more projects sit in an archive index whose sticky preview plate re-develops on hover or focus.
- **Case view** (`src/js/case.js`, `src/js/data.js`). The clicked plate's rectangle opens to full screen and a paper sheet rises over it with the brief, approach, outcome and a second plate. It lives at `#work/<id>`. It handles back/forward and hand-edited hashes, traps focus, closes on Esc, and moves to the next case with an ink wipe.
- **Redaction** (`src/js/redact.js`). Scrolling bars out 31 words of agency boilerplate, with a live count, until one sentence is left: "We make things people remember." Three principles follow, set as a staircase.
- **Solved capability rows** (`src/js/caps.js`). Each discipline name is fitted to the full measure at two weights by solving `font-stretch`. On hover or open the weight surges while the width compensates. The rows are a single-open accordion, and the "Seen in" names open their case studies.
- **Live details** (`src/js/studio.js`, `src/js/nav.js`). The nav shows the Lisbon time. The Lisbon and Rotterdam clocks say whether each studio is open from its local time. The running head rolls to the current section's number and name.
- **Paper and ink** (`src/js/theme.js`). Sections declare a theme and the whole viewport crossfades, and the browser `theme-color` follows. The hero and Contact switch only once their void has fully opened.
- **Brief composer** (`src/js/contact.js`). Contact is a sentence with blanks ("Hello VANTA, I'm … from …"). Each field is sized to the text it holds. It validates inline, then opens the visitor's email app with the brief written out. There is also a copy-address button.
- **Engraved footer**: the VANTA wordmark is the interference plate masked to the letters, with the lens on desktop.
- **Menu** (`src/js/nav.js`). A full-screen ink overlay with numbered sections and the current one marked. Section jumps cut through ink instead of scrolling the whole page.
- **Distinct mobile composition** (760px and below). It has single-column spreads with their own crops, a void that rests below the hero text, an archive without the preview plate and native touch scrolling.
- **Reduced motion**. Lenis is off, the hero and Contact cut between states, plates are drawn still and the redaction starts fully applied. Only opacity and colour transition.
- **Accessibility and fallbacks**. There is a skip link, a visible accent focus ring, and labelled controls throughout. Canvases are `aria-hidden`, and the redaction has a one-sentence text equivalent. Without WebGL, plates become a CSS line texture and the footer wordmark is ruled with a 2D canvas. Without JavaScript every section stays visible, and a 5-second failsafe reveals the page if the scripts never boot.

### Sections

| Section id | Name | Theme | What happens |
|---|---|---|---|
| `top` | 01 Index | paper, then ink (set by the hero) | The void retracts on load and cycles the featured plates; on scroll it opens to full bleed and the studio introduction is set on it |
| `work` | 02 Work | ink | Four featured spreads, each with its own layout, then an archive of four more with a live preview plate |
| `philosophy` | 03 Philosophy | paper | A 340vh redaction run (31 words), then three principles as a staircase |
| `capabilities` | 04 Capabilities | paper | Four solved rows: Products, Experiences, Websites, Identities |
| `studio` | 05 Studio | paper | Statement, facts, the two studio clocks, people, careers and partners |
| `contact` | 06 Contact | ink (set by the section) | The field opens from the void's proportions; brief composer, addresses and the engraved wordmark |
| `#work/<id>` | Case view | ink plate, paper sheet | One of eight case studies, opened from its plate, an archive row or a capability link |

### Plates

| Scene | Name | Used for |
|---|---|---|
| 0 | Interference | Halden; the footer wordmark |
| 1 | Orb | Mirae Museum of Light |
| 2 | Slabs | Northvault |
| 3 | Terrain | Ostra |
| 4 | Glyph (&) | Pallas Type |
| 5 | Eclipse | Lumen Film Festival |
| 6 | Vessel | Kiln & Co. |
| 7 | Field lines | Verde Grid |

The hero reel cycles scenes 0 to 3. Each case view shows its project's scene twice: as the opening plate and as a second figure with a different seed.

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8; developed on Node 24)
- npm (uses `package-lock.json`)
- A browser with WebGL2 for the full experience

## Usage

Local development:

```bash
npm install
npm run dev        # http://127.0.0.1:5199
```

Production build and local preview:

```bash
npm run build      # static output in dist/
npm run preview    # serves dist/ at http://localhost:4173
```

| Command | What it does |
|---|---|
| `npm run dev` | Vite development server (port 5199, set in `vite.config.js`) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |

The production build is about 72 KB of JavaScript and 8 KB of CSS gzipped, plus the self-hosted font files.

### Tests

There is no automated test suite in this repository. The production build was checked with scripted headless-Chrome passes at 1440×900 and 390×844. They covered 22 interaction checks: menu, section jumps, the case view (open, next, close, back/forward, edited hash), the capability accordion and its links, brief validation and the composed email, copy, and back to top. They also covered 11 theme checks after jumps, with no console errors. Reduced motion and a WebGL-disabled browser were checked visually. Those scripts are not committed.

## Deploy

There is no hosted demo yet; run it locally to see it. The site is fully static and needs no environment variables or backend. Any static host can serve `dist/` after `npm run build`. No Dockerfile or `coolify.yaml` is included.

## Security notes

- **No backend, no secrets.** There are no API routes, environment variables or keys.
- **The page sends nothing.** The brief form validates the fields and then opens the visitor's own email app through a `mailto:` link. There is no `fetch`, storage, cookie or analytics anywhere in `src`.
- **Reserved addresses.** Every address on the page uses the reserved `vanta.example` domain, so mail from the demo can never reach a real organisation.
- **No runtime third-party requests.** Mona Sans and Martian Mono are installed from Fontsource on npm and bundled into `dist/` at build time. Every image is generated in the browser.
- **Clipboard.** The Copy button writes the address with `navigator.clipboard`, and selects the text instead if that is refused.
- **Fiction is disclosed.** VANTA, its clients and its people are invented, and the footer says so. A real company called Vanta, which makes security compliance software, is unrelated. Any resemblance to a real studio is unintended.
- The project configures no security headers; set them on the host.

## Project structure

```
index.html            all content and copy; the no-JS failsafe
public/               favicon.svg
src/main.js           boot: fonts, Lenis, the renderer, section modules, the ticker
src/js/renderer.js    the shared WebGL2 line-screen renderer and its eight scenes
src/js/               hero (the void), work (plates, archive), case (case view),
                      redact, caps, studio, contact (brief, footer wordmark),
                      nav (bar, menu, jumps), theme (paper/ink), data (case
                      studies), app (shared state and helpers)
src/styles/main.css   tokens, layout, components, mobile, reduced motion, fallbacks
PRODUCT.md            product brief: users, purpose, voice, constraints, the fiction
DESIGN.md             the design system as built (colours, type, layout, motion, named rules)
vite.config.js        dev server port and build target
```

## License

No license file is present in this repository; all rights are reserved by the repository owner. The source is public to read, but no permission to reuse or redistribute it is granted. (`"private": true` in `package.json` only stops it being published to npm.)
