import gsap from 'gsap'
import { app, $, trapFocus } from './app.js'
import { PROJECTS, byId } from './data.js'

/*
  Case view. The plate you click is the plate you land on: its rectangle
  opens to fill the screen while the engraving keeps running, then the case
  sheet slides up over its lower edge. "Next case" wipes with the ink bar.
*/
export function initCase() {
  const renderer = app.renderer
  const html = document.documentElement
  const root = $('[data-case]')
  const scroller = $('[data-case-scroll]')
  const plate = $('[data-case-plate]')
  const body = $('[data-case-body]')
  const wipe = $('[data-case-wipe]')
  const bar = $('.case__bar', root)
  const closeBtn = $('[data-case-close]')
  const nextBtn = $('[data-case-next]')
  const el = {
    count: $('[data-case-count]'), no: $('[data-case-no]'), title: $('[data-case-title]'),
    line: $('[data-case-line]'), meta: $('[data-case-meta]'), text: $('[data-case-text]'),
    fig: $('[data-case-fig]'), nextTitle: $('[data-case-next-title]'),
  }

  const clip = { t: 0, r: 0, b: 0, l: 0 }
  const size = { W: 1, H: 1 }
  const view = renderer.ok ? renderer.add({
    canvas: $('[data-case-canvas]'), visible: false, resolve: 0, maxPixels: 2.6e6,
    frame: () => [clip.l, clip.t, size.W - clip.l - clip.r, size.H - clip.t - clip.b],
  }) : null
  const view2 = renderer.ok ? renderer.add({ canvas: $('[data-case-canvas-2]'), visible: false, resolve: 0.35, period: 3 }) : null

  let current = null
  let source = null
  let opener = null
  let isOpen = false
  let busy = false     // an open or next transition is running
  let closing = false
  let tl = null        // the running transition, so a close can always interrupt it
  let pushed = false

  const applyClip = () => {
    plate.style.clipPath = `inset(${clip.t}px ${clip.r}px ${clip.b}px ${clip.l}px)`
    renderer.dirty = true
  }

  const fill = (p) => {
    current = p
    el.count.textContent = `Case ${p.no} / ${String(PROJECTS.length).padStart(2, '0')}`
    el.no.textContent = `Pl. ${p.no}`
    el.title.textContent = p.title
    el.line.textContent = p.line
    el.meta.innerHTML = p.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')
    el.text.innerHTML = p.text.map(([k, v]) => `<section><h3>${k}</h3><p>${v}</p></section>`).join('')
    el.fig.textContent = p.fig
    const next = PROJECTS[(p.index + 1) % PROJECTS.length]
    el.nextTitle.textContent = next.title
    nextBtn.dataset.next = next.id
    if (view) { view.scene = p.scene; view.seed = p.seed }
    if (view2) {
      view2.scene = p.scene
      view2.seed = p.seed + 0.37
      view2.angle = 0
    }
  }

  const measure = () => {
    size.W = plate.clientWidth
    size.H = plate.clientHeight
    if (view) renderer.resizeView(view)
    if (view2) renderer.resizeView(view2)
  }

  const rectFrom = (src) => {
    const W = window.innerWidth, H = size.H
    if (!src) return { t: H * 0.5, r: W * 0.5, b: H * 0.5, l: W * 0.5 }
    const r = src.getBoundingClientRect()
    const t = Math.max(0, r.top), l = Math.max(0, r.left)
    const bottom = Math.min(H, r.bottom), right = Math.min(W, r.right)
    if (bottom <= t || right <= l) return { t: H * 0.5, r: W * 0.5, b: H * 0.5, l: W * 0.5 }
    return { t, l, r: W - right, b: H - bottom }
  }

  const open = (id, src, { push = true } = {}) => {
    const p = byId[id]
    if (!p || busy || closing) return
    if (isOpen) { goNext(id); return }
    busy = true
    isOpen = true
    source = src || null
    opener = document.activeElement
    fill(p)
    root.hidden = false
    html.classList.add('case-open')
    app.lenis?.stop()
    scroller.scrollTop = 0
    measure()
    if (view) view.visible = true
    if (view2) view2.visible = true

    if (push) {
      history.pushState({ vantaCase: id }, '', `#work/${id}`)
      pushed = true
    }

    const from = rectFrom(source)
    Object.assign(clip, from)
    applyClip()
    const d = app.reduced ? 0 : 1
    if (view) {
      view.resolve = app.reduced ? 1 : (source?._view?.resolve ?? 0.4)
      gsap.to(view, { resolve: 1, duration: 2 * d, delay: 0.2 * d, ease: 'power2.out', overwrite: 'auto' })
    }
    tl = gsap.timeline()
      .to(clip, { t: 0, r: 0, b: 0, l: 0, duration: 1.15 * d, ease: 'expo.inOut', onUpdate: applyClip, onComplete: () => { busy = false } }, 0)
      .fromTo(body, { y: () => window.innerHeight * 0.5, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 * d, ease: 'expo.out' }, 0.7 * d)
      .fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.6 * d }, 0.8 * d)
    if (view2 && !app.reduced) gsap.fromTo(view2, { resolve: 0 }, { resolve: 0.35, duration: 2, delay: 1.2 })
    closeBtn.focus({ preventScroll: true })
  }

  const finishClose = () => {
    root.hidden = true
    html.classList.remove('case-open')
    if (view) view.visible = false
    if (view2) view2.visible = false
    gsap.set([body, bar, root], { clearProps: 'opacity,transform,clipPath' })
    app.lenis?.start()
    isOpen = false
    busy = false
    closing = false
    pushed = false
    if (location.hash.startsWith('#work/')) history.replaceState(null, '', location.pathname + location.search)
    const back = opener?.isConnected && opener !== document.body
      ? opener
      : document.querySelector(`[data-open-case="${current?.id}"]`)
    back?.focus({ preventScroll: true })
  }

  const doClose = () => {
    if (!isOpen || closing) return
    closing = true
    tl?.kill()
    gsap.set(wipe, { scaleY: 0 })
    const d = app.reduced ? 0 : 1
    const atTop = scroller.scrollTop < 40
    tl = gsap.timeline({ onComplete: finishClose })
    tl.to(bar, { opacity: 0, duration: 0.3 * d }, 0)
    if (atTop && source && source.isConnected) {
      tl.to(body, { y: () => window.innerHeight * 0.5, opacity: 0, duration: 0.6 * d, ease: 'power3.in' }, 0)
        .to(clip, { ...rectFrom(source), duration: 0.95 * d, ease: 'expo.inOut', onUpdate: applyClip }, 0.25 * d)
    } else {
      tl.to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9 * d, ease: 'expo.inOut' }, 0)
    }
  }

  const close = () => {
    if (!isOpen || closing) return
    if (pushed && history.state?.vantaCase) history.back()
    else doClose()
  }

  const goNext = (id) => {
    if (busy || closing) return
    const p = byId[id]
    if (!p) return
    busy = true
    source = document.querySelector(`.plate[data-open-case="${id}"]`)
    const d = app.reduced ? 0 : 1
    tl?.kill()
    gsap.set(clip, { t: 0, r: 0, b: 0, l: 0 })
    gsap.set([body, bar], { y: 0, opacity: 1 })
    tl = gsap.timeline({ onComplete: () => { closeBtn.focus({ preventScroll: true }) } })
      .set(wipe, { transformOrigin: '50% 100%' })
      .to(wipe, { scaleY: 1, duration: 0.6 * d, ease: 'expo.in' })
      .add(() => {
        fill(p)
        scroller.scrollTop = 0
        Object.assign(clip, { t: 0, r: 0, b: 0, l: 0 })
        applyClip()
        if (view) {
          view.resolve = app.reduced ? 1 : 0
          gsap.to(view, { resolve: 1, duration: 2 * d, delay: 0.15 * d, ease: 'power2.out', overwrite: 'auto' })
        }
        history.replaceState({ vantaCase: id }, '', `#work/${id}`)
        busy = false
      })
      .set(wipe, { transformOrigin: '50% 0%' })
      .to(wipe, { scaleY: 0, duration: 0.85 * d, ease: 'expo.out' }, '+=0.05')
  }

  // ── wiring ──
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-case]')
    if (!t || root.contains(t)) return
    e.preventDefault()
    // open from the plate itself, or from the archive's live preview
    let src = t.classList.contains('plate') ? t : null
    if (!src && t.classList.contains('row')) {
      const pv = document.querySelector('.archive__preview')
      if (pv && pv.offsetParent !== null) src = pv
    }
    open(t.dataset.openCase, src)
  })
  scroller.addEventListener('scroll', () => {
    bar.classList.toggle('is-solid', scroller.scrollTop > body.offsetTop - bar.offsetHeight)
  }, { passive: true })
  closeBtn.addEventListener('click', close)
  nextBtn.addEventListener('click', () => goNext(nextBtn.dataset.next))
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
    else trapFocus(root, e)
  })
  // back/forward and hand-edited hashes both land here
  const sync = () => {
    const m = location.hash.match(/^#work\/([\w-]+)/)
    const id = m && byId[m[1]] ? m[1] : null
    if (isOpen && !id) { pushed = false; doClose() }
    else if (!isOpen && id) { pushed = false; open(id, null, { push: false }) }
  }
  window.addEventListener('popstate', sync)
  window.addEventListener('hashchange', sync)
  window.addEventListener('resize', () => { if (isOpen) { measure(); applyClip() } })

  return {
    openFromHash: () => {
      const m = location.hash.match(/^#work\/([\w-]+)/)
      if (m && byId[m[1]]) {
        history.replaceState({ vantaCase: m[1] }, '', location.hash)
        pushed = false
        open(m[1], null, { push: false })
      }
    },
  }
}
