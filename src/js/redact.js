import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { app, $, $$ } from './app.js'

/*
  Philosophy, demonstrated rather than stated. A paragraph of agency language
  is redacted word by word as you scroll, until only the sentence that
  matters is left standing between the bars.
*/
export function initRedact() {
  const section = $('[data-redact]')
  const text = $('[data-redact-text]')
  const count = $('[data-redact-count]')
  const caption = $('[data-redact-caption]')

  // wrap every redacted word with its own bar
  const groups = $$('.r', text)
  const bars = []
  const groupOf = []
  groups.forEach((g, gi) => {
    // a group followed directly by another keeps its last bar bridged across the space
    const gap = g.nextSibling
    const bridged = gap?.nodeType === 3 && !gap.textContent.trim() && gap.nextSibling?.classList?.contains('r')
    const words = g.textContent.trim().split(/[ \t\n\r]+/) // a no-break space keeps a dash with its word
    g.textContent = ''
    words.forEach((w, i) => {
      const span = document.createElement('span')
      span.className = 'w' + (i < words.length - 1 || bridged ? ' is-joined' : '')
      span.textContent = w
      const bar = document.createElement('span')
      bar.className = 'bar'
      span.appendChild(bar)
      g.appendChild(span)
      if (i < words.length - 1) g.appendChild(document.createTextNode(' '))
      bars.push(bar)
      groupOf.push(gi)
    })
  })
  const total = bars.length

  if (app.reduced) {
    gsap.set(bars, { scaleX: 1 })
    count.textContent = total
    return
  }

  gsap.set(caption, { opacity: 0, y: 14 })

  // one scrubbed timeline: bars run in reading order, with a breath between groups
  const tl = gsap.timeline({ paused: true })
  let at = 0
  bars.forEach((bar, i) => {
    if (i > 0 && groupOf[i] !== groupOf[i - 1]) at += 1.4
    tl.to(bar, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, at)
    at += 0.42
  })
  tl.to(caption, { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, at + 0.6)
  tl.to({}, { duration: 1.2 })

  let shown = -1
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.7,
    animation: tl,
    onUpdate: () => {
      let n = 0
      for (const b of bars) if (gsap.getProperty(b, 'scaleX') > 0.5) n++
      if (n !== shown) { shown = n; count.textContent = n }
    },
  })
}
