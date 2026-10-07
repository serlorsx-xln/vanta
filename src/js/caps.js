import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { app, $, $$, onResize } from './app.js'

/*
  Capabilities are set as justified rows. Each word is fitted to the full
  measure twice — once light, once black — by solving the width axis. On
  hover or open the weight surges while the width compensates, so the line
  changes character without ever leaving the measure.
*/
const REST = { w: 230, ls: -0.01 }
const ON = { w: 820, ls: -0.03 }
const S_MIN = 75, S_MAX = 125

export function initCaps() {
  const root = $('[data-caps]')
  const words = $$('[data-fit]', root)
  const buttons = $$('.cap__btn', root)

  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:nowrap;visibility:hidden;font-family:var(--f-sans);line-height:1'
  // the reduced-motion stylesheet gives everything a tiny transition, which would make measurements lag a step behind
  probe.style.setProperty('transition', 'none', 'important')
  document.body.appendChild(probe)

  const width = (text, fs, w, s, ls) => {
    probe.style.fontSize = fs + 'px'
    probe.style.fontWeight = w
    probe.style.fontStretch = s + '%'
    probe.style.letterSpacing = ls + 'em'
    probe.textContent = text
    return probe.getBoundingClientRect().width
  }

  const fit = () => {
    const W = root.clientWidth - parseFloat(getComputedStyle(root).paddingLeft) * 2
    const base = 100
    // one shared size: the largest that lets every word fit in both states
    let fs = Infinity
    for (const el of words) {
      for (const st of [REST, ON]) {
        const wMin = width(el.textContent, base, st.w, S_MIN, st.ls)
        fs = Math.min(fs, (base * W) / wMin)
      }
    }
    fs *= 0.985
    // keep rows from towering over the page on very wide screens
    fs = Math.min(fs, window.innerHeight * 0.26)

    for (const el of words) {
      const solve = (st) => {
        let lo = S_MIN, hi = S_MAX
        if (width(el.textContent, fs, st.w, hi, st.ls) < W) {
          // even the widest cut is short: open the tracking to reach the measure
          const w = width(el.textContent, fs, st.w, hi, st.ls)
          const n = el.textContent.length
          return { s: hi, ls: st.ls + (W - w) / (n * fs) }
        }
        for (let i = 0; i < 18; i++) {
          const mid = (lo + hi) / 2
          if (width(el.textContent, fs, st.w, mid, st.ls) > W) hi = mid
          else lo = mid
        }
        return { s: lo, ls: st.ls }
      }
      const r = solve(REST), o = solve(ON)
      el.style.setProperty('--fs', fs + 'px')
      el.style.setProperty('--w-rest', REST.w)
      el.style.setProperty('--w-on', ON.w)
      el.style.setProperty('--s-rest', r.s.toFixed(2) + '%')
      el.style.setProperty('--s-on', o.s.toFixed(2) + '%')
      el.style.setProperty('--ls-rest', r.ls.toFixed(4) + 'em')
      el.style.setProperty('--ls-on', o.ls.toFixed(4) + 'em')
    }
  }

  // ── accordion ──
  const toggle = (btn, force) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'))
    const willOpen = force ?? btn.getAttribute('aria-expanded') !== 'true'
    if (willOpen === (btn.getAttribute('aria-expanded') === 'true')) return
    btn.setAttribute('aria-expanded', String(willOpen))
    const items = $$('.cap__desc, .cap__col', panel)
    const d = app.reduced ? 0 : 1
    gsap.killTweensOf(panel)
    if (willOpen) {
      panel.hidden = false
      gsap.fromTo(panel, { height: 0 }, {
        height: 'auto', duration: 1 * d, ease: 'expo.out',
        onComplete: () => { gsap.set(panel, { clearProps: 'height' }); ScrollTrigger.refresh() },
      })
      gsap.fromTo(items, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1 * d, ease: 'expo.out', stagger: 0.07 * d, delay: 0.12 * d })
    } else {
      gsap.to(panel, {
        height: 0, duration: 0.7 * d, ease: 'power3.inOut',
        onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'height' }); ScrollTrigger.refresh() },
      })
    }
  }
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    const opening = btn.getAttribute('aria-expanded') !== 'true'
    if (opening) buttons.forEach((b) => b !== btn && toggle(b, false))
    toggle(btn)
  }))

  // ── entrance: rules draw, words rise into their rows ──
  if (!app.reduced) {
    const caps = $$('.cap', root)
    caps.forEach((cap) => {
      const word = $('.cap__word', cap)
      const small = $$('.cap__no, .cap__sub, .cap__toggle', cap)
      gsap.set(word, { yPercent: 40, opacity: 0 })
      gsap.set(small, { opacity: 0 })
      ScrollTrigger.create({
        trigger: cap,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(word, { yPercent: 0, opacity: 1, duration: 1.3, ease: 'expo.out' })
          gsap.to(small, { opacity: 1, duration: 0.8, delay: 0.25 })
        },
      })
    })
    const folio = $$('.folio--caps > *')
    gsap.set(folio, { opacity: 0, y: 16 })
    ScrollTrigger.create({
      trigger: '.folio--caps', start: 'top 85%', once: true,
      onEnter: () => gsap.to(folio, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }),
    })
  }

  fit()
  onResize(fit)
  return { fit }
}
