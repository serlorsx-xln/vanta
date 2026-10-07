import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { app, $, $$, lerp, range, easeInOut, onResize, isMobile } from './app.js'
import { setTheme } from './theme.js'

/*
  The void returns. The contact field opens from the same rectangle the
  hero's void rested in, until it fills the screen; the page ends in ink, with
  the wordmark engraved in light.
*/
const EMAIL = 'hello@vanta.example'

export function initContact() {
  const section = $('.contact')
  const field = $('[data-contact-field]')
  const title = $$('[data-contact-title] .ln > span')

  // ── the field opens ──
  const inset = (k) => {
    const mobile = isMobile()
    const t = lerp(mobile ? 10 : 14, 0, k)
    const l = lerp(mobile ? 6 : 44, 0, k)
    const r = lerp(mobile ? 6 : 2.4, 0, k)
    field.style.clipPath = `inset(${t}vh ${r}% 0% ${l}%)`
  }
  if (!app.reduced) {
    inset(0)
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'top 15%',
      onUpdate: (self) => {
        const k = easeInOut(range(self.progress, 0.05, 1))
        inset(k)
        const y = self.scroll()
        if (y >= self.start && y <= self.end) setTheme(k > 0.985 ? 'ink' : 'paper')
      },
      onLeaveBack: () => { inset(0) },
    })
    // once past the opening, the theme follows the section
    ScrollTrigger.create({
      trigger: section,
      start: 'top 15%',
      end: 'bottom top',
      onToggle: (self) => { if (self.isActive) setTheme('ink') },
    })

    gsap.set(title, { yPercent: 125 })
    ScrollTrigger.create({
      trigger: '[data-contact-title]',
      start: 'top 82%',
      once: true,
      onEnter: () => gsap.to(title, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.1 }),
    })
    const bits = $$('.contact__head, .brief, .contact__direct > div')
    bits.forEach((b) => gsap.from(b, {
      opacity: 0, y: 24, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: b, start: 'top 90%', once: true },
    }))
  } else {
    ScrollTrigger.create({
      trigger: section, start: 'top 55%', end: 'bottom top',
      onToggle: (self) => setTheme(self.isActive ? 'ink' : 'paper'),
    })
  }

  // ── brief composer ──
  const form = $('[data-brief]')
  const status = $('[data-brief-status]')
  const inputs = $$('input', form)
  const selects = $$('select', form)

  // every field is exactly as wide as what it currently says, so the sentence reads as one line of type
  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden;pointer-events:none'
  probe.style.setProperty('transition', 'none', 'important')
  form.appendChild(probe)
  const textWidth = (el, text, weight) => {
    const cs = getComputedStyle(el)
    probe.style.fontFamily = cs.fontFamily
    probe.style.fontSize = cs.fontSize
    probe.style.fontStretch = cs.fontStretch
    probe.style.letterSpacing = cs.letterSpacing
    probe.style.fontWeight = weight
    probe.textContent = text
    return probe.getBoundingClientRect().width
  }
  const autosize = (el) => {
    const fs = parseFloat(getComputedStyle(el).fontSize)
    if (el.tagName === 'SELECT') {
      const w = textWidth(el, el.options[el.selectedIndex].text, 560)
      el.style.width = Math.ceil(w + fs * 1.05) + 'px'
    } else {
      const w = el.value ? textWidth(el, el.value, 560) : textWidth(el, el.placeholder, 380)
      el.style.width = Math.ceil(Math.max(w, fs * 2) + fs * 0.3) + 'px'
    }
  }
  const sizeAll = () => [...inputs, ...selects].forEach(autosize)
  sizeAll()
  onResize(sizeAll)
  inputs.forEach((i) => {
    i.addEventListener('input', () => {
      autosize(i)
      i.closest('.field').classList.remove('is-invalid')
      i.removeAttribute('aria-invalid')
    })
  })
  selects.forEach((sel) => sel.addEventListener('change', () => autosize(sel)))

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    const problems = []
    const name = form.elements.name, email = form.elements.email
    if (!data.name.trim()) problems.push([name, 'your name'])
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) problems.push([email, 'an email we can reply to'])
    inputs.forEach((i) => { i.closest('.field').classList.remove('is-invalid'); i.removeAttribute('aria-invalid') })
    if (problems.length) {
      problems.forEach(([i]) => { i.closest('.field').classList.add('is-invalid'); i.setAttribute('aria-invalid', 'true') })
      status.classList.add('is-error')
      status.textContent = `Almost — add ${problems.map((p) => p[1]).join(' and ')}.`
      problems[0][0].focus()
      return
    }
    status.classList.remove('is-error')
    const company = data.company.trim()
    const subject = `New project — ${company || data.name.trim()}`
    const body = [
      'Hello VANTA,',
      '',
      `I'm ${data.name.trim()}${company ? ` from ${company}` : ''}. We need help with ${data.kind} and hope to start ${data.when}.`,
      '',
      'A little more about the project:',
      '',
      '',
      `Reply to: ${data.email.trim()}`,
    ].join('\n')
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    status.textContent = `Your email app should now be open with the brief written. Nothing happened? Write to ${EMAIL} directly.`
  })

  // ── copy address ──
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy
      let ok = false
      try { await navigator.clipboard.writeText(text); ok = true } catch { ok = false }
      btn.textContent = ok ? 'Copied' : 'Press ⌘C'
      if (!ok) {
        const sel = window.getSelection(), r = document.createRange()
        r.selectNodeContents(btn.previousElementSibling)
        sel.removeAllRanges(); sel.addRange(r)
      }
      setTimeout(() => { btn.textContent = 'Copy' }, 2200)
    })
  })

  initFootMark()
  return { fit: sizeAll }
}

function initFootMark() {
  // ── the wordmark, engraved ──
  const renderer = app.renderer
  const footCanvas = $('[data-foot-canvas]')
  const mark = $('.foot__mark')

  // keep only the pixels inside the letters
  let fit = null
  const setFont = (ctx, fs) => {
    ctx.font = `860 expanded ${fs}px "Mona Sans Variable"`
    if ('fontStretch' in ctx) ctx.fontStretch = 'expanded'
  }
  const maskText = (ctx, w, h) => {
    if (!fit || fit.w !== w || fit.h !== h) {
      setFont(ctx, 100)
      const m = ctx.measureText('VANTA')
      const fs = (100 * w) / (m.actualBoundingBoxRight + m.actualBoundingBoxLeft)
      setFont(ctx, fs)
      const m2 = ctx.measureText('VANTA')
      fit = { w, h, fs, x: m2.actualBoundingBoxLeft, y: (h + m2.actualBoundingBoxAscent - m2.actualBoundingBoxDescent) / 2 }
    }
    ctx.save()
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'alphabetic'
    setFont(ctx, fit.fs)
    ctx.fillText('VANTA', fit.x, fit.y)
    ctx.restore()
  }

  if (!renderer.ok) {
    // no WebGL: the same engraving, ruled once with the 2D canvas
    const draw = () => {
      const r = footCanvas.getBoundingClientRect()
      const d = Math.min(window.devicePixelRatio || 1, 2)
      const w = (footCanvas.width = Math.max(2, Math.round(r.width * d)))
      const h = (footCanvas.height = Math.max(2, Math.round(r.height * d)))
      const ctx = footCanvas.getContext('2d')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#ece9e2'
      const period = 3.2 * d
      for (let y = 0; y < h; y += period) ctx.fillRect(0, y, w, period * 0.46)
      maskText(ctx, w, h)
    }
    document.fonts.load('860 100px "Mona Sans Variable"').then(draw, draw)
    onResize(draw)
    return
  }

  const view = renderer.add({
    canvas: footCanvas, scene: 0, seed: 0.9, resolve: app.reduced ? 1 : 0, alpha: true, visible: false, period: 3.2,
    // on narrow screens the fringes are drawn at a fixed scale so they stay broad behind small letters
    frame: () => {
      const fh = Math.max(view.cssH, 300)
      return [0, (view.cssH - fh) / 2, view.cssW, fh]
    },
    post: maskText,
  })
  new IntersectionObserver(([en]) => {
    view.visible = en.isIntersecting
    renderer.dirty = true
    if (en.isIntersecting && !app.reduced && view.resolve < 1) gsap.to(view, { resolve: 1, duration: 2.6, ease: 'power2.out' })
  }).observe(mark)

  if (!app.touch) {
    const target = { x: -9999, y: -9999 }
    mark.addEventListener('pointermove', (e) => {
      const r = footCanvas.getBoundingClientRect()
      target.x = e.clientX - r.left
      target.y = e.clientY - r.top
      if (view.mouse.x < -999) { view.mouse.x = target.x; view.mouse.y = target.y }
    })
    mark.addEventListener('pointerenter', () => gsap.to(view, { lens: 1, duration: 0.8, ease: 'power3.out', overwrite: 'auto' }))
    mark.addEventListener('pointerleave', () => gsap.to(view, { lens: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }))
    gsap.ticker.add(() => {
      if (view.lens < 0.001) return
      view.mouse.x = lerp(view.mouse.x, target.x, 0.16)
      view.mouse.y = lerp(view.mouse.y, target.y, 0.16)
    })
  }
  onResize(() => renderer.resizeView(view))
}
