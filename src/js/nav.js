import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { app, $, $$, scrollToTarget, trapFocus } from './app.js'

/*
  Navigation is a running head: the current section rolls into place as you
  read. Jumps never scroll through the page — an ink bar covers the screen,
  the page cuts underneath it, and the bar lifts on the new section.
*/
export function initNav() {
  const html = document.documentElement
  const headNo = $('[data-head-no]')
  const headLabel = $('[data-head-label]')
  const menu = $('[data-menu]')
  const toggle = $('[data-menu-toggle]')
  const toggleLabel = $('[data-menu-label]')
  const cut = $('[data-cut]')
  let open = false
  let cutting = false
  let menuTl = null // the running open/close timeline, interruptible either way

  // ── running head ──
  let currentLabel = headLabel.textContent
  const roll = (no, label) => {
    if (label === currentLabel) return
    currentLabel = label
    headNo.textContent = no
    if (app.reduced) { headLabel.textContent = label; return }
    gsap.timeline()
      .to(headLabel, { yPercent: -110, duration: 0.32, ease: 'power2.in' })
      .add(() => { headLabel.textContent = label })
      .fromTo(headLabel, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' })
  }
  $$('main > section[data-section]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => { if (self.isActive) roll(sec.dataset.no, sec.dataset.section) },
    })
  })

  // ── clocks in the nav and studio ──
  const fmt = {}
  const tick = () => {
    const now = new Date()
    $$('[data-clock]').forEach((el) => {
      const tz = el.dataset.clock
      fmt[tz] ||= new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })
      const t = fmt[tz].format(now)
      if (el.textContent !== t) el.textContent = t
    })
  }
  tick()
  setInterval(tick, 1000)

  // ── menu ──
  const words = $$('.menu__word', menu)
  const nos = $$('.menu__no', menu)
  const aside = $('.menu__aside', menu)

  const openMenu = () => {
    if (open) return
    open = true
    menuTl?.kill()
    // mark where the reader is
    const here = $(`main > section[data-section="${currentLabel}"]`)
    $$('a', menu).forEach((a) => {
      if (here && a.getAttribute('href') === '#' + here.id) a.setAttribute('aria-current', 'location')
      else a.removeAttribute('aria-current')
    })
    menu.hidden = false
    toggle.setAttribute('aria-expanded', 'true')
    toggleLabel.textContent = 'Close'
    app.lenis?.stop()
    const d = app.reduced ? 0 : 1
    menuTl = gsap.timeline()
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9 * d, ease: 'expo.inOut' })
      .fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.1 * d, ease: 'expo.out', stagger: 0.045 * d }, 0.35 * d)
      .fromTo([...nos, aside], { opacity: 0 }, { opacity: 1, duration: 0.6 * d }, 0.6 * d)
    $('a', menu).focus({ preventScroll: true })
  }

  const closeMenu = (afterJump = false) => {
    if (!open) return Promise.resolve()
    open = false
    menuTl?.kill()
    toggle.setAttribute('aria-expanded', 'false')
    toggleLabel.textContent = 'Menu'
    const d = app.reduced ? 0 : 1
    return new Promise((resolve) => {
      menuTl = gsap.timeline({
        onComplete: () => {
          menu.hidden = true
          app.lenis?.start()
          resolve()
        },
      })
        .to(words, { yPercent: -110, duration: 0.45 * d, ease: 'power3.in', stagger: 0.025 * d })
        .to([...nos, aside], { opacity: 0, duration: 0.3 * d }, 0)
        .to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: (afterJump ? 0.9 : 0.75) * d, ease: 'expo.inOut' }, 0.2 * d)
    })
  }

  toggle.addEventListener('click', () => (open ? closeMenu() : openMenu()))
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); toggle.focus() }
    else trapFocus(menu, e)
  })
  // Tab from the toggle into the menu while it is open
  toggle.addEventListener('keydown', (e) => {
    if (open && e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); $('a', menu).focus() }
  })

  // ── jumps ──
  const focusTarget = (el) => {
    if (!el) return
    el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }

  const cutTo = (target) => {
    if (cutting) return
    const el = document.querySelector(target)
    if (app.reduced) { scrollToTarget(el, true); focusTarget(el); return }
    if (open) {
      // the open menu is already an ink field: cut beneath it, then lift it
      scrollToTarget(el, true)
      ScrollTrigger.update()
      closeMenu(true).then(() => focusTarget(el))
      return
    }
    cutting = true
    gsap.timeline({ onComplete: () => { cutting = false; focusTarget(el) } })
      .fromTo(cut, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.in' })
      .add(() => { scrollToTarget(el, true); ScrollTrigger.update() })
      .to(cut, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: 'expo.out' }, '+=0.08')
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-goto]')
    if (!a) return
    const href = a.getAttribute('href')
    if (!href || !href.startsWith('#')) return
    e.preventDefault()
    cutTo(href)
  })

  return { closeMenu, isOpen: () => open }
}
