// Shared runtime state and small helpers.
export const app = {
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  touch: window.matchMedia('(hover: none)').matches,
  lenis: null,
  renderer: null,
  resizers: new Set(),
}

export const $ = (s, el = document) => el.querySelector(s)
export const $$ = (s, el = document) => [...el.querySelectorAll(s)]
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const range = (v, a, b) => clamp((v - a) / (b - a))
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t) => 1 - Math.pow(1 - t, 3)
export const isMobile = () => window.innerWidth <= 760

export function onResize(fn) { app.resizers.add(fn) }

let lastW = window.innerWidth
let lastH = window.innerHeight
let timer
window.addEventListener('resize', () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    const w = window.innerWidth, h = window.innerHeight
    // On touch devices the toolbar resizes the viewport while scrolling; only
    // a width change (or a large height change) is a real layout change.
    if (app.touch && w === lastW && Math.abs(h - lastH) < 160) return
    lastW = w; lastH = h
    app.resizers.forEach((fn) => fn())
  }, 160)
})

export function scrollToTarget(target, immediate = false) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  const y = !el || el.id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY
  if (app.lenis) app.lenis.scrollTo(y, { immediate, force: true, lock: !immediate })
  else window.scrollTo({ top: y, behavior: immediate || app.reduced ? 'auto' : 'smooth' })
}

// Keep keyboard focus inside an open dialog.
export function trapFocus(root, e) {
  if (e.key !== 'Tab') return
  const f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', root)
    .filter((el) => el.offsetParent !== null || el === document.activeElement)
  if (!f.length) return
  const first = f[0], last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}
