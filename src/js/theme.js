import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $$ } from './app.js'

/*
  The page "exposes" between paper and ink. Sections are transparent; the
  document theme decides the ground, so a change crossfades the whole viewport
  instead of drawing a seam between two sections.
  The hero and contact manage their own theme: each turns ink only once its
  void has fully opened, so the reveal is never swallowed by the ground.
*/
const html = document.documentElement
let current = 'paper'

export function setTheme(t) {
  if (t === current) return
  current = t
  html.dataset.theme = t
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = t === 'ink' ? '#0a0a0b' : '#e9e6df'
}

export function initTheme() {
  html.dataset.theme = 'paper'
  $$('main > section[data-theme]').forEach((sec) => {
    if (sec.hasAttribute('data-theme-manual')) return
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) setTheme(sec.dataset.theme) },
    })
  })
}
