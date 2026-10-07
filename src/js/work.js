import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { app, $, $$, lerp } from './app.js'
import { byId } from './data.js'

/*
  Plates develop. Each one enters as a closed slit, opens, and its engraving
  resolves from coarse bars to fine lines. Under the pointer the lines swell
  like glass laid over a print, and a label names what a click will do.
*/
export function initWork() {
  const renderer = app.renderer
  const cursor = $('[data-cursor]')
  const cursorPos = { x: -200, y: -200, tx: -200, ty: -200 }
  const views = new Map()

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const v = views.get(en.target)
      if (v) { v.visible = en.isIntersecting; if (en.isIntersecting) renderer.dirty = true }
    })
  }, { rootMargin: '10% 0px' })

  // ── featured plates ──
  $$('.spread').forEach((spread) => {
    const plate = $('.plate', spread)
    const canvas = $('canvas', plate)
    const view = renderer.ok ? renderer.add({
      canvas,
      scene: +canvas.dataset.scene,
      seed: +canvas.dataset.seed,
      resolve: app.reduced ? 1 : 0,
      visible: false,
    }) : null
    if (view) { views.set(plate, view); io.observe(plate) }
    plate._view = view

    const lines = $$('.ln > span', spread)
    const meta = $$('.spread__no, .spread__line, .spread__text, .spread__tags, .spread__vertical', spread)

    if (!app.reduced) {
      gsap.set(lines, { yPercent: 125 })
      gsap.set(meta, { opacity: 0, y: 18 })
      gsap.set(plate, { clipPath: 'inset(100% 0% 0% 0%)' })
      ScrollTrigger.create({
        trigger: plate,
        start: 'top 86%',
        once: true,
        onEnter: () => {
          gsap.to(plate, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'expo.out' })
          if (view) gsap.to(view, { resolve: 1, duration: 2.8, ease: 'power2.out', delay: 0.15 })
        },
      })
      ScrollTrigger.create({
        trigger: spread,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          gsap.to(lines, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.09, delay: 0.1 })
          gsap.to(meta, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.3 })
        },
      })
      // depth: the engraving drifts against the frame
      gsap.fromTo(canvas, { yPercent: -4 }, {
        yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }

    if (view) bindLens(plate, view, canvas)
  })

  // ── lens + cursor label ──
  function bindLens(plate, view, canvas) {
    if (app.touch) return
    const target = { x: 0, y: 0 }
    let on = false
    const local = (e) => {
      const r = canvas.getBoundingClientRect()
      target.x = e.clientX - r.left
      target.y = e.clientY - r.top
    }
    plate.addEventListener('pointerenter', (e) => {
      on = true
      local(e)
      view.mouse.x = target.x; view.mouse.y = target.y
      cursorPos.x = cursorPos.tx = e.clientX
      cursorPos.y = cursorPos.ty = e.clientY
      cursor.classList.add('is-on')
      if (!app.reduced) gsap.to(view, { lens: 1, duration: 0.9, ease: 'power3.out', overwrite: 'auto' })
    })
    plate.addEventListener('pointermove', (e) => { local(e); cursorPos.tx = e.clientX; cursorPos.ty = e.clientY })
    plate.addEventListener('pointerleave', () => {
      on = false
      cursor.classList.remove('is-on')
      gsap.to(view, { lens: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
    })
    gsap.ticker.add(() => {
      if (!on && view.lens < 0.001) return
      view.mouse.x = lerp(view.mouse.x, target.x, 0.16)
      view.mouse.y = lerp(view.mouse.y, target.y, 0.16)
    })
  }

  gsap.ticker.add(() => {
    cursorPos.x = lerp(cursorPos.x, cursorPos.tx, 0.24)
    cursorPos.y = lerp(cursorPos.y, cursorPos.ty, 0.24)
    cursor.style.transform = `translate3d(${cursorPos.x + 16}px, ${cursorPos.y + 16}px, 0)`
  })
  // a scrolled page should drop a stale label
  window.addEventListener('scroll', () => {
    const el = document.elementFromPoint(cursorPos.tx, cursorPos.ty)
    if (!el || !el.closest('.plate')) cursor.classList.remove('is-on')
  }, { passive: true })

  // ── archive index with a live preview ──
  const previewCanvas = $('[data-archive-preview]')
  const previewCap = $('[data-archive-cap]')
  const rows = $$('.archive .row')
  const preview = renderer.ok ? renderer.add({ canvas: previewCanvas, scene: 4, seed: 0.2, resolve: 1, visible: false, period: 3 }) : null
  if (preview) { views.set(previewCanvas, preview); io.observe(previewCanvas) }
  let activeRow = rows[0]
  rows[0]?.classList.add('is-active')
  const showRow = (row) => {
    if (row === activeRow) return
    activeRow?.classList.remove('is-active')
    activeRow = row
    row.classList.add('is-active')
    const p = byId[row.dataset.openCase]
    previewCap.textContent = `Pl. ${p.no} — ${p.title}`
    if (!preview) return
    preview.scene = +row.dataset.preview
    preview.seed = +row.dataset.previewSeed
    renderer.dirty = true
    if (!app.reduced) gsap.fromTo(preview, { resolve: 0 }, { resolve: 1, duration: 1.4, ease: 'power3.out', overwrite: true })
  }
  rows.forEach((row) => {
    row.addEventListener('pointerenter', () => showRow(row))
    row.addEventListener('focus', () => showRow(row))
  })
  $('.archive__list')?.addEventListener('pointerleave', () => {
    // keep the last preview, but release the bar so the list reads as a list
    rows.forEach((r) => r !== activeRow && r.classList.remove('is-active'))
  })

  const archiveHead = $$('.archive__head, .archive .row')
  if (!app.reduced) {
    gsap.set(archiveHead, { opacity: 0, y: 24 })
    ScrollTrigger.create({
      trigger: '.archive',
      start: 'top 80%',
      once: true,
      onEnter: () => gsap.to(archiveHead, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 }),
    })
  }

  const folio = $$('.work .folio > *')
  if (!app.reduced) {
    gsap.set(folio, { opacity: 0, y: 16 })
    ScrollTrigger.create({
      trigger: '.work .folio', start: 'top 85%', once: true,
      onEnter: () => gsap.to(folio, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }),
    })
  }
}
