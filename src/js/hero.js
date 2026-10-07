import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { app, $, $$, lerp, range, easeInOut, onResize, isMobile } from './app.js'
import { setTheme } from './theme.js'
import { PROJECTS } from './data.js'

/*
  The void.
  On load the whole screen is ink: the void retracts into its slot in the
  hero, and the plate inside it develops from coarse bars to fine engraving.
  On scroll the void opens again until it has absorbed the page; the studio
  introduction is then set on the ink it leaves behind.
*/
const REEL = PROJECTS.slice(0, 4)

export function initHero() {
  const hero = $('.hero')
  const stage = $('.hero__stage')
  const voidEl = $('[data-void]')
  const canvas = $('.void__canvas')
  const caption = $('[data-void-caption]')
  const reelNo = $('[data-reel-no]')
  const reelTitle = $('[data-reel-title]')
  const ticks = $$('.void__ticks i', caption)
  const intro = $('.hero__intro')
  const kicker = $('.hero__kicker')
  const titleLines = $$('.hero__title .ln > span')
  const links = $('.hero__links')
  const wordmark = $('[data-wordmark]')
  const letters = $$('span', wordmark)
  const about = $('[data-about]')
  const aboutText = $('[data-about-text]')
  const aboutLabel = $('.label', about)
  const nav = $('[data-nav]')
  const renderer = app.renderer

  // slot = the void's resting rectangle, laid out by CSS
  const slot = document.createElement('div')
  slot.className = 'void-slot'
  slot.setAttribute('aria-hidden', 'true')
  stage.prepend(slot)

  const S = { open: 1, expand: 0, dim: 0, coarse: 0, W: 1, H: 1, rect: { t: 0, r: 0, b: 0, l: 0 } }
  // base values the scroll scrub mixes from (animated by the intro and the reel)
  const baseGain = { v: 1 }
  const baseResolve = { v: 1 }
  const captionAlpha = { v: 1 }

  const view = renderer.ok ? renderer.add({
    canvas, scene: REEL[0].scene, seed: REEL[0].seed, resolve: 0, gain: 0,
    period: 3.6, maxPixels: 2.6e6,
    frame: () => {
      const k = Math.max(S.open, S.expand)
      const r = S.rect
      const t = r.t * (1 - k), rr = r.r * (1 - k), b = r.b * (1 - k), l = r.l * (1 - k)
      return [l, t, S.W - l - rr, S.H - t - b]
    },
  }) : null

  // ── wordmark fitting ──
  const fitWordmark = () => {
    wordmark.style.fontSize = '100px'
    letters.forEach((l) => (l.style.display = 'inline-block'))
    let sum = 0
    letters.forEach((l) => (sum += l.getBoundingClientRect().width))
    const avail = wordmark.clientWidth
    const fs = (100 * avail) / sum
    wordmark.style.fontSize = fs + 'px'
    stage.style.setProperty('--wm-h', fs * 0.73 + 'px')
    letters.forEach((l) => (l.style.display = ''))
  }

  const measure = () => {
    S.W = stage.clientWidth
    S.H = stage.clientHeight
    const s = stage.getBoundingClientRect()
    const r = slot.getBoundingClientRect()
    S.rect = { t: r.top - s.top, l: r.left - s.left, r: s.right - r.right, b: s.bottom - r.bottom }
    caption.style.left = S.rect.l + 'px'
    caption.style.top = S.rect.t + 'px'
    caption.style.maxWidth = S.W - S.rect.l - S.rect.r + 'px'
    if (view) renderer.resizeView(view)
    apply()
  }

  const apply = () => {
    const k = Math.max(S.open, S.expand)
    const r = S.rect
    voidEl.style.clipPath = `inset(${r.t * (1 - k)}px ${r.r * (1 - k)}px ${r.b * (1 - k)}px ${r.l * (1 - k)}px)`
  }

  // ── pointer lens over the void ──
  const target = { x: -9999, y: -9999 }
  let lensOn = false
  if (view && !app.touch) {
    stage.addEventListener('pointermove', (e) => {
      const s = stage.getBoundingClientRect()
      const x = e.clientX - s.left, y = e.clientY - s.top
      const [fl, ft, fw, fh] = view.frame()
      const inside = x > fl && x < fl + fw && y > ft && y < ft + fh && S.expand < 0.2
      target.x = x; target.y = y
      if (view.mouse.x < -999) { view.mouse.x = x; view.mouse.y = y }
      if (inside !== lensOn) {
        lensOn = inside
        gsap.to(view, { lens: inside ? 1 : 0, duration: inside ? 0.8 : 0.6, ease: 'power3.out', overwrite: 'auto' })
      }
    })
    stage.addEventListener('pointerleave', () => {
      lensOn = false
      gsap.to(view, { lens: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' })
    })
    gsap.ticker.add(() => {
      view.mouse.x = lerp(view.mouse.x, target.x, 0.14)
      view.mouse.y = lerp(view.mouse.y, target.y, 0.14)
    })
  }

  // compose the plate's light from the intro/reel and the scroll position
  if (view) {
    const BG = [11 / 255, 11 / 255, 12 / 255], FG = [236 / 255, 233 / 255, 226 / 255]
    gsap.ticker.add(() => {
      view.gain = lerp(baseGain.v, 0.5, S.dim)
      view.resolve = lerp(baseResolve.v, 0.1, S.coarse)
      const a = 1 - 0.8 * S.dim
      view._fg = FG.map((c, i) => lerp(BG[i], c, a))
    })
  }

  // ── reel: cycle the four featured plates ──
  let reelIndex = 0
  let reelTween = null
  let reelPaused = false
  const tickState = { p: 0 }
  const paintTicks = () => ticks.forEach((t, i) => {
    t.style.setProperty('--p', i < reelIndex ? 1 : i === reelIndex ? tickState.p : 0)
  })
  const nextReel = () => {
    if (!view) return
    const n = (reelIndex + 1) % REEL.length
    gsap.timeline()
      .to(baseResolve, { v: 0, duration: 0.55, ease: 'power2.in' })
      .add(() => {
        reelIndex = n
        view.scene = REEL[n].scene
        view.seed = REEL[n].seed
        reelNo.textContent = REEL[n].no
        reelTitle.textContent = `${REEL[n].title} — ${REEL[n].line}`
        tickState.p = 0
        paintTicks()
      })
      .to(baseResolve, { v: 1, duration: 1.6, ease: 'power3.out' })
    runTicks()
  }
  const runTicks = () => {
    reelTween?.kill()
    tickState.p = 0
    reelTween = gsap.to(tickState, {
      p: 1, duration: 6, ease: 'none', delay: 0.6,
      onUpdate: paintTicks,
      onComplete: nextReel,
      paused: reelPaused,
    })
  }
  const pauseReel = (v) => {
    if (v === reelPaused) return
    reelPaused = v
    if (reelTween) v ? reelTween.pause() : reelTween.resume()
  }

  // ── scroll: the void absorbs the page ──
  let lastP = 0
  let heroActive = true
  const scrub = (p) => {
    lastP = p
    if (app.reduced) return cut(p)
    const mobile = isMobile()
    const e = easeInOut(range(p, 0.02, 0.36))
    S.expand = e
    apply()
    app.renderer.dirty = true

    const fadeIntro = range(p, 0.0, 0.2)
    gsap.set(intro, { y: -fadeIntro * 70, opacity: 1 - fadeIntro })
    gsap.set(caption, { opacity: (1 - range(p, 0, 0.1)) * captionAlpha.v })
    const wm = range(p, 0.2, 0.42)
    gsap.set(wordmark, { yPercent: -wm * (mobile ? 60 : 38), opacity: 1 - range(p, 0.3, 0.44) })

    S.dim = range(p, 0.3, 0.46)
    S.coarse = range(p, 0.3, 0.5)

    const showAbout = p > 0.38
    about.style.visibility = showAbout ? 'visible' : 'hidden'
    gsap.set(aboutLabel, { opacity: range(p, 0.42, 0.5) })
    aboutLines.forEach((ln, i) => {
      const t = range(p, 0.42 + i * 0.03, 0.56 + i * 0.03)
      gsap.set(ln, { yPercent: (1 - easeOut3(t)) * 125 })
    })

    pauseReel(p > 0.12)
    // only while the hero is on screen: a jump past it must not overrule the section it lands on
    if (heroActive) setTheme(e > 0.98 ? 'ink' : 'paper')
  }
  const easeOut3 = (t) => 1 - Math.pow(1 - t, 3)

  // reduced motion: the same two states, joined by a cut instead of a camera move
  const cut = (p) => {
    const on = p > 0.18
    S.expand = on ? 1 : 0
    S.dim = S.coarse = on ? 1 : 0
    apply()
    app.renderer.dirty = true
    gsap.set(intro, { y: 0, opacity: on ? 0 : 1 })
    gsap.set(caption, { opacity: on ? 0 : 1 })
    gsap.set(wordmark, { yPercent: 0, opacity: on ? 0 : 1 })
    about.style.visibility = on ? 'visible' : 'hidden'
    gsap.set(aboutLabel, { opacity: 1 })
    aboutLines.forEach((ln) => gsap.set(ln, { yPercent: 0 }))
    if (heroActive) setTheme(on ? 'ink' : 'paper')
  }

  // ── about text, split into masked lines ──
  let aboutLines = []
  const split = SplitText.create(aboutText, {
    type: 'lines', mask: 'lines', linesClass: 'about-line', autoSplit: true,
    onSplit: (self) => { aboutLines = self.lines; scrub(lastP) },
  })
  aboutLines = split.lines


  // visibility of the void plate
  if (view) {
    new IntersectionObserver(([en]) => { view.visible = en.isIntersecting }).observe(hero)
  }

  measure()
  fitWordmark()
  measure()
  onResize(() => { fitWordmark(); measure(); scrub(lastP) })

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom bottom',
    // inclusive of both ends: at scrollY 0 the trigger reports itself inactive
    onUpdate: (self) => { heroActive = self.scroll() <= self.end; scrub(self.progress) },
    onRefresh: (self) => { heroActive = self.scroll() <= self.end; scrub(self.progress) },
  })

  // ── load sequence ──
  const intro$ = () => {
    if (app.reduced) {
      S.open = 0
      gsap.set([...letters, ...titleLines], { y: 0, yPercent: 0 })
      gsap.set([kicker, links, caption, nav], { opacity: 1 })
      captionAlpha.v = 1
      apply()
      scrub(lastP)
      return Promise.resolve()
    }
    gsap.set(letters, { y: 0, yPercent: 110 })
    gsap.set(titleLines, { y: 0, yPercent: 125 })
    gsap.set([kicker, links, caption, nav], { opacity: 0 })
    captionAlpha.v = 0
    baseGain.v = 0
    baseResolve.v = 0
    // the coarse bars fade up while fonts settle
    gsap.to(baseGain, { v: 1, duration: 0.9, ease: 'power2.out', onUpdate: () => scrub(lastP) })
    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve, onUpdate: () => scrub(lastP) })
      tl.to(S, { open: 0, duration: 1.55, ease: 'expo.inOut' }, 0)
        .to(baseResolve, { v: 1, duration: 2.4, ease: 'power2.out' }, 0.15)
        .to(letters, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.065 }, 0.78)
        .to(titleLines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.08 }, 0.95)
        .to([kicker, links, nav], { opacity: 1, duration: 0.9, ease: 'power2.out' }, 1.25)
        .to(captionAlpha, { v: 1, duration: 0.9, ease: 'power2.out' }, 1.45)
    })
  }

  return {
    play: async () => {
      await intro$()
      paintTicks()
      if (!app.reduced) runTicks()
    },
    remeasure: () => { fitWordmark(); measure() },
  }
}
