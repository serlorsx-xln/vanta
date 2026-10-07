import '@fontsource-variable/mona-sans/wdth.css'
import '@fontsource-variable/martian-mono/wdth.css'
import './styles/main.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

import { app, onResize } from './js/app.js'
import { LineRenderer } from './js/renderer.js'
import { initTheme } from './js/theme.js'
import { initNav } from './js/nav.js'
import { initHero } from './js/hero.js'
import { initWork } from './js/work.js'
import { initCase } from './js/case.js'
import { initRedact } from './js/redact.js'
import { initCaps } from './js/caps.js'
import { initStudio } from './js/studio.js'
import { initContact } from './js/contact.js'

gsap.registerPlugin(ScrollTrigger, SplitText)
window.__vanta = true

const html = document.documentElement
if (app.reduced) html.classList.add('reduced')

// one renderer for every plate on the page
const renderer = new LineRenderer()
app.renderer = renderer
if (import.meta.env.DEV) window.__app = app
if (!renderer.ok) html.classList.add('no-gl')
if (app.reduced) renderer.static = true

// smooth scroll on wheel/trackpad; touch keeps native scrolling
if (!app.reduced) {
  app.lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95, syncTouch: false })
  app.lenis.on('scroll', ScrollTrigger.update)
  if (import.meta.env.DEV) window.__lenis = app.lenis
}
gsap.ticker.lagSmoothing(0)
gsap.ticker.add((time) => {
  app.lenis?.raf(time * 1000)
  renderer.render(time, gsap.ticker.deltaRatio(60) * 16.67)
})
document.addEventListener('visibilitychange', () => { if (!document.hidden) renderer.dirty = true })

async function boot() {
  initTheme()
  initNav()
  const hero = initHero()
  initWork()
  const cases = initCase()
  initRedact()
  const caps = initCaps()
  if (import.meta.env.DEV) window.__caps = caps
  initStudio()
  const contact = initContact()

  // glyph plate needs the studio typeface before it can be drawn
  const fontsReady = Promise.race([
    Promise.all([
      document.fonts.load('860 100px "Mona Sans Variable"'),
      document.fonts.load('400 100px "Mona Sans Variable"'),
      document.fonts.load('400 11px "Martian Mono Variable"'),
    ]).then(() => document.fonts.ready),
    new Promise((r) => setTimeout(r, 2600)),
  ])
  const minDelay = new Promise((r) => setTimeout(r, app.reduced ? 0 : 650))
  await Promise.all([fontsReady, minDelay])

  renderer.setGlyph('&', '"Mona Sans Variable"')
  hero.remeasure()
  caps.fit()
  contact.fit()
  renderer.resizeAll()
  ScrollTrigger.refresh()

  await hero.play()
  cases.openFromHash()
}

onResize(() => {
  renderer.resizeAll()
  ScrollTrigger.refresh()
})

boot()
