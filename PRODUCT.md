# Product

<!-- impeccable:product-schema 1 -->

> **Everything in this file is fiction.** The user's brief asked for a fictional creative technology studio called VANTA. Name, people, cities, clients, case studies, figures and dates were authored for this project. A real company called Vanta, which makes security compliance software, is unrelated; any resemblance to a real studio or company is unintended. If the studio is ever made real, replace every fact below. See "Evidence on Hand" for the replacement list.

## Platform

web

## Stack

Not pinned by the user's brief, which allowed libraries where they materially improve the result. Chosen: Vite 8, vanilla ES modules with no framework, GSAP with ScrollTrigger and SplitText, Lenis smooth scroll, one WebGL2 renderer for every image, and Mona Sans and Martian Mono as self-hosted variable fonts (Fontsource). One page with no routing or application state does not need a framework; GSAP and Lenis carry the scroll choreography, and the renderer replaces photography. No deploy target specified. The build is a static `dist/` that any static host can serve.

## Users

- **Primary: the people at ambitious brands who commission digital work.** Brand, marketing and product leads at companies like the ones in the work: a speaker maker, a museum foundation, a bank, a running brand, a type foundry, a film festival, a ceramics maker, an energy network operator. They arrive with one of the briefs the contact form offers: a digital product, an interactive experience, a flagship website, a brand system, or "something we can't name yet". They visit to judge whether the craft is real and whether the studio can ship: who does the work, how long it takes, how large the team is and when it can start. Their job is to decide whether VANTA gets a brief.
- **Secondary: prospective hires, press and the creative-web community.** The careers note is written for "designers who can read a shader and engineers who care about kerning". They judge the craft of the page itself.

## Product Purpose

**VANTA** is a creative technology studio in Lisbon and Rotterdam. Since 2014 it has designed and engineered digital products, interactive experiences and websites for ambitious brands. It is 26 people and takes five or six projects a year. The website exists to show the work and the way the studio thinks, on a page built the way the studio builds. It ends in a single action: **start a project**, by completing the one-sentence brief in Contact ("Hello VANTA, I'm … from …"), which composes an email to the studio.

Success: a prospective client reaches the end knowing what VANTA makes, how it works and when it can start, and sends a brief. Nobody should leave mistaking VANTA for the agency its own philosophy paragraph redacts.

## Positioning

Most studio sites describe themselves in the same vocabulary: full-service, award-winning, cutting-edge, seamless. VANTA's page performs its position instead of stating it. The philosophy section opens on a paragraph of that vocabulary and redacts it as the reader scrolls, 31 words under black bars, until one sentence is left: *We make things people remember.* The caption names the joke: "That was principle 01, applied to our own sentence." The other two principles follow.

1. **Subtract.** Every project starts with a written list of things the studio won't make.
2. **Prototype the feeling.** Latency, easing, weight and sound are built in code from the first week, never in slides.
3. **Stay small on purpose.** The people who present the work are the people who make it.

Brand line: *Most of what gets made online disappears. We make the rest.*

The concept reads the name literally. Vantablack is the blackest black, so the studio's material is the void: a black field in the hero opens until it has absorbed the page, and the page ends in ink with the wordmark engraved in light. There are no photographs. Every image, including the case studies, is a plate drawn live in the browser, which the work section states outright: "Every plate on this page is rendered live, in your browser, the way we build."

## Operating Context

- Founder and creative director: **Inês Moura**. Studio founded 2014 in Lisbon. 26 designers, engineers and producers. Average tenure six years. Eleven languages spoken, "plus GLSL".
- Two studios. **Lisbon**, Cais do Sodré: design, production and real-time. **Rotterdam**, Katendrecht: engineering and product. Visits to both by appointment, Mon–Fri, 09:00–19:00. Each studio's clock on the page shows open or closed from that city's local time.
- Led by Inês Moura (Founder, Creative Director), Daan Verhoef (Technical Director), Sofia Brandão (Design Director), Kenji Arakawa (Head of Real-time) and Marta Kowalczyk (Executive Producer), "and twenty-one others".
- Five or six projects a year. The page shows four of thirty-one projects from 2024–2026 as featured plates and four more in an archive index. All eight open as full case studies. Partners since 2020 are listed by name, not by logo.
- Now booking projects from February 2027. The studio hires twice a year; the next window opens in January 2027.
- Fees are not published. The brief asks for the kind of project and a preferred start, not a budget, so the site makes no price claim.
- Three addresses: `hello@` for new projects, `jobs@` for careers and `press@` for press and talks, all at `vanta.example`. The reserved `.example` domain means demo mail can never reach a real organisation.

## Capabilities and Constraints

**Capabilities (fictional, as set on the page):**

| | Row | Scope | Includes | Seen in | Typically |
|---|---|---|---|---|---|
| 01 | Products | Digital products | Product strategy and research; UX and interface design; design systems; iOS, Android and web engineering; prototyping in code | Northvault, Verde Grid | 6–12 months, a team of six to ten |
| 02 | Experiences | Interactive experiences | Real-time graphics (WebGL, Unreal, TouchDesigner); spatial and physical installation; generative systems; sound and haptics; hardware integration | Mirae Museum of Light, Ostra | 4–10 months, a team of five to eight |
| 03 | Websites | Flagship websites | Art direction; motion design; creative development; headless CMS and editorial tooling; performance and accessibility | Halden, Pallas Type, Kiln & Co. | 3–6 months, a team of four to six |
| 04 | Identities | Brand systems for screens | Visual identity; motion identity; generative brand tools; type direction; guidelines as code | Halden, Lumen Film Festival | 3–8 months, a team of three to six |

"Four disciplines, one team." Each row opens to its detail, one at a time, and every "Seen in" name opens that case study.

**Constraints:**

- Not a conventional SaaS landing page, and none of the familiar generated landing-page patterns the brief named: generic cards, excessive rounded containers, gradient-heavy visuals, glowing effects, random glassmorphism, meaningless badges, decorative particles, a predictable centred hero.
- Content set by the brief: who VANTA is, selected work, capabilities, philosophy, studio information and a strong final contact moment. Concise, believable copy. No lorem ipsum.
- Motion is part of the art direction: page load, type reveals, scroll transitions, image behaviour, hovers, navigation transitions and section-to-section movement. A few strong interaction ideas, executed well, rather than many.
- It must work on desktop and mobile.
- The site's only conversion is the brief. The page sends nothing and stores nothing: the brief opens the visitor's own email app with the message written.
- There is no photography. Every image is a plate drawn by the WebGL2 renderer.
- No analytics, cookies, browser storage or runtime third-party requests. Fonts are bundled at build time.

## Brand Commitments

- Name: **VANTA**, always in capitals ("VANTA Studio" in the copyright line). Founder: **Inês Moura**. Studios: **Lisbon** and **Rotterdam**. Projects are numbered as plates, *Pl. 01* to *Pl. 08*; sections as *01 Index* to *06 Contact*.
- Voice: plain declaratives in the first person plural. Numbers, durations, team sizes and named people do the persuading ("Sixty-one screens became nineteen"). Dry, and willing to undercut itself: "Small enough to argue about an easing curve. Big enough to ship it on time." Clients are described by what they make and what they asked for, never flattered. Proof instead of adjectives, as in the Halden brief.
- No "full-service", "award-winning", "innovation-led", "leverage", "cutting-edge", "ideate", "strategize", "seamless", "best-in-class", "next-generation", "move the needle" or "touchpoint" copy. These are the words the philosophy section redacts.
- No award badges, rankings or client logo walls. Partners are set as a line of text.
- Concept chosen for this build (not pinned by the user): the void. Two materials, paper `#e9e6df` and ink `#0a0a0b`, and one accent, `#3340ff`, used sparingly.

## Evidence on Hand

None real. The studio does not exist.

**Must not be fabricated:** testimonials, press quotes, awards, rankings, "trusted by" logos, real companies presented as clients, prices or day rates, and outcome metrics attributed to real organisations.

**Authored fiction to replace if this ever becomes real:** studio name, founder, founding year, both studios and their neighbourhoods, headcount (26), average tenure, languages spoken, the five named leads and their titles, the project count (thirty-one, 2024–2026), projects per year, the capability table (scopes, durations, team sizes, "Seen in" links), the partner list including the four names that appear only there (Arkade Transit, Solvei Hotels, Maison Aube, Fjord Public Radio), "Partners since 2020", the booking date (February 2027), the hiring window (January 2027), visiting hours, the three `vanta.example` addresses, the copyright line (2014–2026), all body copy, and the generated plates, which stand in for real project imagery.

The eight case studies, with the facts each one states:

- **Halden** (Copenhagen, 2026; seven people, nine months): an identity engine driven by each speaker's measured frequency response; launched with the H2 series in March 2026 across fourteen markets.
- **Mirae Museum of Light** (Mirae Foundation, Seoul, 2025; eleven people, fourteen months): eleven rooms; opened in October 2025 and booked out for its first four months.
- **Northvault** (Oslo, 2025; nine people, eleven months): over a million customers on an app designed for forty thousand; sixty-one screens became nineteen; 240 components.
- **Ostra** (Ostra Running, Bilbao, 2024; six people, five months): forty thousand routes from sixty-two countries in the first month.
- **Pallas Type** (Zürich, 2024; four people, four months): the variable-font tester became the foundry's main sales channel.
- **Lumen Film Festival** (Porto, 2024; five people, six months): used across the 2024 and 2025 editions; ticketing went from eleven steps to four.
- **Kiln & Co.** (Stoke-on-Trent, 2025; five people, five months): a 3D viewer on every product page; returns "fell noticeably", deliberately unquantified.
- **Verde Grid** (Rotterdam, 2026; eight people, ten months): nine separate tools replaced by one operations product, in use across all control rooms since spring 2026.

## Product Principles

1. **Demonstrate, then state.** The philosophy is redacted on screen before it is written down, and the work is rendered live rather than described.
2. **Subtract.** The studio's first principle applies to its own page: six sections, a few strong interaction ideas, nothing decorative.
3. **Proof instead of adjectives.** Durations, team sizes, named people and stated outcomes carry the case. A claim the page cannot back is left out.
4. **The page is the first case study.** A client checks the craft of the site before reading any of the work.
5. **One way in.** The close is a single sentence to complete. It composes an email; it does not collect data.

## Accessibility & Inclusion

- Honour `prefers-reduced-motion` with the same content and no camera moves. The void and the contact field cut between states instead of opening on scroll, plates are drawn still, the redaction bars are applied from the start with the count at 31, smooth scrolling is off and CSS transitions are limited to opacity and colour.
- Everything works by keyboard: a skip link to the content, a visible focus ring in the accent, the menu and case view as modal dialogs that trap focus, close on Esc and return focus to what opened them, section jumps that move focus to the target, and capability rows as buttons with `aria-expanded`. The brief marks a missing name or an invalid email with `aria-invalid`, explains it in a polite live region and focuses the first problem.
- Every canvas is decorative and hidden from screen readers. Plates are buttons named "Open case: …", the redacted paragraph is replaced for assistive technology by one sentence that describes it and gives the sentence that remains, and every brief field has a visually hidden label.
- Mobile (760 px and below) gets its own composition, not a scaled-down desktop: single-column spreads with their own crops, the archive as a plain list without its preview plate, a shorter redaction run and native touch scrolling. The pointer lens is for pointer devices only.
- Without WebGL, plates fall back to a CSS line texture and the footer wordmark is ruled with a 2D canvas. Without JavaScript, the page starts as `no-js` and every section is visible. If the scripts never boot, a 5-second failsafe removes the `js` class so nothing stays hidden. The direct email links work either way.
