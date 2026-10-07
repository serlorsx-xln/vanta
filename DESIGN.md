---
name: VANTA
description: The blackest black as a material. Paper and ink, one blue, and every image a live line engraving.
colors:
  paper: "#e9e6df"
  ink: "#0a0a0b"
  accent: "#3340ff"
  fg-2: "color-mix(in srgb, var(--fg) 56%, var(--bg))"
  rule: "color-mix(in srgb, var(--fg) 22%, var(--bg))"
  plate-ink: "#0b0b0c"
  plate-light: "#ece9e2"
  error-rule: "#ff6a3d"
  error-text: "#ff8a64"
typography:
  wordmark:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "26.6vw"
    fontWeight: 860
    lineHeight: 0.73
    letterSpacing: "-0.02em"
    fontStretch: "125%"
  display:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(64px, 12.4vw, 236px)"
    fontWeight: 780
    lineHeight: 0.84
    letterSpacing: "-0.05em"
    fontStretch: "106%"
  project-title:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "per spread, up to clamp(96px, 17.6vw, 330px)"
    fontWeight: 760
    lineHeight: 0.84
    letterSpacing: "-0.045em"
    fontStretch: "112%"
  capability:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "fitted at runtime (--fs)"
    fontWeight: "230 at rest, 820 on hover or open"
    lineHeight: 0.78
    fontStretch: "solved per word, 75% to 125%"
  statement:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(38px, 5.6vw, 104px)"
    fontWeight: 480
    lineHeight: 0.96
    letterSpacing: "-0.04em"
    fontStretch: "88%"
  redaction:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(30px, 4.35vw, 82px)"
    fontWeight: 460
    lineHeight: 1.06
    letterSpacing: "-0.034em"
    fontStretch: "92%"
  headline:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(34px, 3.55vw, 62px)"
    fontWeight: 440
    lineHeight: 0.98
    letterSpacing: "-0.032em"
    fontStretch: "92%"
  lede:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(28px, 3.3vw, 58px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.028em"
    fontStretch: "94%"
  numeral:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(56px, 7vw, 128px)"
    fontWeight: 300
    lineHeight: 0.86
    letterSpacing: "-0.04em"
    fontStretch: "85%"
    fontFeature: "tabular-nums"
  line:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(20px, 1.7vw, 28px)"
    fontWeight: 420
    lineHeight: 1.1
    letterSpacing: "-0.015em"
    fontStretch: "92%"
  body:
    fontFamily: "Mona Sans Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Martian Mono Variable, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.01em"
    fontStretch: "87.5%"
    fontFeature: "tabular-nums"
rounded:
  none: "0px"
  dot: "50%"
spacing:
  margin: "clamp(16px, 2.4vw, 40px)"
  gutter: "clamp(12px, 1.5vw, 24px)"
  margin-mobile: "16px"
  gutter-mobile: "12px"
  columns: "12"
components:
  button-send:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px 30px 19px"
  button-send-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
  link:
    textColor: "currentColor"
    rounded: "{rounded.none}"
    padding: "0 0 1px"
  field:
    backgroundColor: "transparent"
    textColor: "currentColor"
    rounded: "{rounded.none}"
    padding: "0 0.1em 0.02em"
  status-dot:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.dot}"
    width: "7px"
    height: "7px"
  cursor-label:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 10px 7px"
---

# Design System: VANTA

## Overview

**Creative North Star: "The Blackest Black"**

Vantablack absorbs almost all the light that reaches it, so the studio's material is the void. The page is made of two materials, paper and ink, and the void is a rectangle of ink that behaves like an aperture. On load it fills the screen and retracts into its slot in the hero. On scroll it opens again until it has absorbed the page, and in Contact it returns from the same rectangle and opens into the ink footer. Nothing on the page is a photograph. Every image is a plate: a line-screen engraving drawn live by one WebGL2 renderer, which develops from coarse bars to fine lines as it enters and swells under the pointer like a lens laid over a print.

Colour behaves like exposure, not decoration. Sections are transparent and the document theme decides the ground, so moving between a paper section and an ink section crossfades the whole viewport instead of drawing a seam. Type does the rest. One sans family is used across its whole width and weight range: wide and black for the wordmark, condensed and heavy for capabilities, light and wide in the menu. A narrow monospace carries every label, number and folio. There are no cards, no rounded containers, no icons and no shadows. Separation is a 1px rule.

**Key Characteristics:**
- Two materials, paper `#e9e6df` and ink `#0a0a0b`; one accent, `#3340ff`, for state only.
- The void: one ink rectangle that opens, retracts and returns.
- Plates, not photographs: live line engravings that develop and respond to the pointer.
- Mona Sans on its width and weight axes; Martian Mono, narrowed, for labels.
- Square corners everywhere; circles only for status dots.
- A few motions, each tied to one idea: aperture, develop, redact, solve, wipe.

## Colors

A two-material palette with one saturated blue whose job is strictly limited.

### Primary
- **Ink** (ink): the void, the ink theme's ground, plate backgrounds, the menu overlay, the case wipe and every redaction bar on paper.
- **Paper** (paper): the paper theme's ground, the case sheet, the send button and the cursor label. Text on ink is paper.

### Secondary
- **Signal Blue** (accent): live or current state. It marks the open studio's status dot, the pulsing "Now booking" dot, the current item in the menu, the focus ring, a focused field's underline, the send button's hover wipe, the skip link and the text selection.

### Neutral
- **Secondary Ink** (fg-2): the foreground mixed 56% into the ground. Labels, notes, captions and placeholders. Because it is a mix, it follows the theme without its own dark value.
- **Rule** (rule): the foreground at 22%. Hairlines between rows, facts and people.
- **Plate Ink / Plate Light** (plate-ink, plate-light): the renderer's two colours, one step off the page's ink and paper so engravings read as printed matter rather than UI.

### Error
- **Error rule / Error text** (error-rule, error-text): a warm red-orange, used only for an invalid field's underline and the brief's error message, on the ink contact field. It never appears anywhere else.

### Named Rules
**The Exposure Rule.** Sections never paint their own background. A section declares `data-theme="paper"` or `"ink"` and `src/js/theme.js` sets `html[data-theme]` when it crosses 55% of the viewport; ground and text crossfade over `--t-theme` (0.9s). The hero and Contact set the theme themselves, and only once their void has fully opened.

**The One Blue Rule.** The accent marks state (current, open, focused, booking) or the moment of an action (the send wipe). It is never a fill at rest, a heading colour or a decoration.

**The Plate Rule.** Images are engravings in plate ink and plate light. No photograph, gradient or illustration stands in for one, including in the fallback, which is a CSS line texture.

## Typography

**Display and Body Font:** Mona Sans Variable (Fontsource, width and weight axes), falling back to Helvetica Neue and Arial
**Label Font:** Martian Mono Variable at 87.5% width, falling back to ui-monospace

**Character:** One sans used as a range rather than a style. The wordmark sits at the wide, black end (860, 125%); capability rows swing between hairline and black; the redaction and the studio statement are set slightly condensed at a book weight. The mono is small and narrow and never shouts.

### Hierarchy
- **Wordmark** (860, 125%, 26.6vw, 0.73): VANTA across the hero, set in `mix-blend-mode: difference` so it inverts where the void crosses it.
- **Display** (780, 106%, clamp(64px, 12.4vw, 236px), 0.84): the Contact title, "Bring us / the hard one.", with the second line indented 16.6%.
- **Project title** (760, 112%, 0.84): sized per spread. Halden runs at clamp(96px, 17.6vw, 330px) and crosses the plate's lower edge; Northvault at 820 and 78%; Ostra set vertically at 300 and 125%. Case titles use clamp(56px, 9.6vw, 184px) at 108%.
- **Capability** (fitted): one shared size per screen, with each word's width solved so it fills the measure (see the Solved Measure Rule).
- **Statement** (480, 88%, clamp(38px, 5.6vw, 104px)): the studio statement.
- **Redaction** (460, 92%, clamp(30px, 4.35vw, 82px)): the philosophy paragraph.
- **Headline** (440, 92%, clamp(34px, 3.55vw, 62px)): the hero line. Principles use 480 at 86%.
- **Lede** (400, 94%, clamp(28px, 3.3vw, 58px)): the "Who we are" paragraph on the void.
- **Numeral** (300, 85%, clamp(56px, 7vw, 128px), tabular): the Lisbon and Rotterdam clocks.
- **Line** (420, 92%, clamp(20px, 1.7vw, 28px)): project one-liners and case lines.
- **Body** (400, 15px, 1.5): notes and descriptions; case text runs larger, at clamp(20px, 1.75vw, 30px).
- **Label** (Martian Mono, 11px, 87.5%, tabular): folios, plate numbers, tags, the clock, counters, field hints.

### Named Rules
**The Solved Measure Rule.** Capability names are justified by the width axis, not by letter-spacing or size. `src/js/caps.js` measures every word at weight 230 and at 820 and picks one size at which all of them fit in both states. Then, for each word, it solves `font-stretch` between 75% and 125% so the word exactly fills the measure at both weights. On hover or open, the weight surges and the width compensates over 0.9s, so the line changes character without leaving the measure.

**The Masked Line Rule.** Display lines rise from their own mask (`.ln > span`, or SplitText line masks). Each mask carries 0.16em of extra bottom room so descenders are never clipped, and lines start 125% below it.

**The Mono Is Small Rule.** Martian Mono appears only at 11px, narrowed, in secondary ink or as a quiet label. It is never a heading.

## Layout

A 12-column grid with margin `--m` (clamp(16px, 2.4vw, 40px)) and gutter `--g` (clamp(12px, 1.5vw, 24px)) runs through every section, the nav, the menu and the case sheet. Sections open with a folio: a mono label in columns 1–3 and a note in columns 7–10.

The hero is not centred. Its stage is sticky for 290vh. The void rests in a slot from 44% of the width to the right margin, the intro sits in the left 44%, and the wordmark spans the bottom edge. The four featured projects each get a different composition: a full-bleed plate with the title cut across its lower edge (Halden), a sticky caption beside a tall 4:5 plate (Mirae Museum of Light), a small square plate under an outsized condensed title (Northvault), and a vertical title rail beside a 16:10 plate (Ostra). The archive is an index of rows in eight columns, with a sticky 4:5 preview plate in the last three. The three principles descend as a staircase, each offset 16vh below the last. Studio is a colophon of statement, facts, clocks, people, careers and partners.

**Tablet (1100px and below)** narrows the archive, capability and studio columns.

**Mobile (760px and below)** is its own composition. The margin drops to 16px and the gutter to 12px, and the nav loses its clock and section number. The void's slot moves below the hero text. Spreads become single columns with their own crops, and the archive drops its preview plate. Capability rows refit to the narrower measure, and the redaction run shortens from 340svh to 300svh. On touch devices, scrolling stays native and there is no pointer lens or cursor label.

## Motion

Motion follows five ideas, each with one meaning.

- **Aperture.** The void's rectangle animates as a `clip-path` inset. On load it retracts from full screen into its slot over 1.55s (`expo.inOut`) while the wordmark letters and hero lines rise. On scroll the hero's 290vh is a scrub: the void opens to full bleed, dims and coarsens its plate, and the "Who we are" paragraph is set on it line by line. Contact reverses the idea and opens its field from the same proportions as it enters.
- **Develop.** Every plate enters as a closed slit (`inset(100% 0 0 0)` to `inset(0)`, 1.7s `expo.out`) while its renderer `resolve` value runs from coarse to fine over about 2.8s. The hero void cycles through the four featured projects, about six seconds each, de-resolving to swap scenes. On pointer devices a lens follows the cursor over plates and the footer wordmark, and a paper label names the click.
- **Redact.** In Philosophy a 340vh sticky run scrubs a black bar across each of 31 words, with a live count, until one sentence is left.
- **Solve.** Capability rows change weight and width together (0.9s `--ease-out`). Menu items and the case view's "Next case" title do the same on hover, at a smaller scale.
- **Wipe.** Navigation jumps cover the screen with an ink cut. "Next case" wipes with an ink bar (scale 0 to 1 to 0). Archive rows and the send button fill with a bar that grows from one side and leaves from the other.

Easing tokens are `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` and `--ease-io: cubic-bezier(0.76, 0, 0.24, 1)`. GSAP uses `expo.out` and `expo.inOut` for the same two characters. Scroll-linked moves (hero, redaction, contact field, plate parallax) are scrubbed; reveals play once. The theme crossfade takes 0.9s.

**Reduced motion** keeps the content and removes the travel. Lenis is off, the hero and Contact cut between states, plates are drawn still, and the redaction starts fully applied. CSS animations stop, and transitions are limited to opacity and colours so nothing that is measured (size, width, axes) animates.

## Elevation & Depth

Depth comes from the void and the plates, not from layered UI. Nothing floats and there are no ambient shadows. The fixed nav, the hero wordmark, the Halden title and the archive's row bar use `mix-blend-mode: difference`, so they invert over whatever passes beneath instead of sitting on a panel. The case view is a full-screen plate with a paper sheet sliding over its lower edge.

### Shadow Vocabulary
- **Sheet edge** (`box-shadow: inset 0 -1px 0` in 14% ink): the case bar once the sheet has passed under it. It is a hairline, not a shadow.
- **Focus underline** (`box-shadow: 0 2px 0 0 var(--accent)`): a focused brief field.
- **Booking pulse** (a 10px accent ring that fades out every 2.4s): the "Now booking" dot only.

### Named Rules
**The Flat Plate Rule.** If something needs separating, it gets a 1px rule in `--rule` or `--fg`, never a shadow, a fill or a card.

## Shapes

Every rectangle has square corners: plates, buttons, fields, the menu, the cursor label, the case sheet. Fields are a single 1px underline. Circles appear only as status marks: the 7px studio and booking dots and the 6px current-section dot in the menu. The capability toggle is two 1px lines that rotate into a minus sign.

## Components

### Navigation
- **Bar:** fixed and blended with `difference`. It holds the wordmark (15px, 800, 125%), a running head with the section number and a label that rolls when the section changes, the live Lisbon clock, and "Menu". It hides while a case is open.
- **Menu:** a full-screen ink overlay that opens downward with a `clip-path` (0.9s `expo.inOut`). It lists six numbered links at clamp(44px, 8.4vh, 112px), weight 300, which turn 800 and 116% wide on hover. The current section gets an accent dot, and an aside holds the booking line, the address and both studios. It traps focus and closes on Esc.

### Plates and Spreads
A plate is a button with an ink ground and a canvas that drifts ±4% against its frame on scroll. It is labelled "Open case: …" and opens the case view. The meta block holds the plate number, title, one line, a short text and mono tags.

### Archive
Rows of number, client, what was made and year, on 1px rules. Hover or focus sweeps a `difference` bar across the row and swaps the sticky preview plate to that project's scene, which re-develops over 1.4s.

### Redaction Block
A sticky stage with the paragraph, a live "N words removed" counter and a caption that appears when the run ends. Screen readers get a one-sentence description instead of the animated paragraph.

### Capability Rows
Each row is a button with `aria-expanded`. Number and subtitle sit above the fitted word, and a two-line toggle sits at the right. Opening a row closes the others. The panel has a description, a "What that includes" list, a "Seen in" list whose names open the matching case study, and a typical duration and team size.

### Studio Clocks
Large tabular numerals for Lisbon and Rotterdam, each with a status line computed from the city's local time ("Studio open", "Opens at 09:00", "Closed — back at 09:00", "Closed for the weekend"). The dot turns accent when the studio is open.

### Brief Composer
A sentence with blanks: name, company, project type, preferred start and email. Every field is sized in JavaScript to exactly the width of what it currently says, so the sentence reads as one line of type. Validation marks name and email with `aria-invalid`, writes the problem in a polite live region and focuses the first field. "Compose email" is a square paper button with an accent wipe. It opens the visitor's email app with the brief written out.

### Contact Links
Three addresses on 1px rules (`hello@`, `press@`, plus `jobs@` in Studio), all at the reserved `vanta.example` domain. A mono "Copy" control writes the address to the clipboard, or selects it if clipboard access is refused.

### Case View
A modal dialog at `#work/<id>`. The clicked plate's rectangle opens to full screen (1.15s `expo.inOut`) with the engraving still running, then the paper sheet rises over its lower edge with the title, meta (client, year, disciplines, team), three text sections (brief, approach, outcome), a second plate and "Next case". The bar turns solid once the sheet passes under it. Esc, Close, the back button and editing the hash all close it, and focus returns to whatever opened it.

### Footer Wordmark
VANTA engraved in light: the interference plate masked to the letters on the ink field, with the pointer lens on desktop. Below it sit the copyright line, the fiction note and "Back to top".

## Do's and Don'ts

### Do:
- **Do** let sections declare `data-theme` and let the document change the ground.
- **Do** draw any new image as a renderer plate, and give it the develop entrance.
- **Do** fit display type to its measure with the width axis before reaching for size or tracking.
- **Do** separate with 1px rules and keep every corner square.
- **Do** give mobile and reduced motion their own composition, not a frozen or scaled desktop.
- **Do** keep the mono at 11px and in secondary ink.

### Don't:
- **Don't** use the accent as a fill at rest, a heading colour or a decoration; it marks state.
- **Don't** add photographs, gradients, glows, shadows, glass, badges or cards.
- **Don't** centre the hero or stack sections in identical layouts; each spread has its own composition.
- **Don't** animate measured properties under reduced motion.
- **Don't** add motion that does not belong to one of the five ideas: aperture, develop, redact, solve, wipe.
